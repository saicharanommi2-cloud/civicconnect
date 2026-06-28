
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import db from "../models/db.js";
import { sendOtpEmail, sendPasswordResetEmail, generateOtp } from "../utils/notify.js";

const router = Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}

/**
 * Step 1 of registration: validate input, store a pending registration
 * with a hashed password and OTP, and "send" the OTP (logged to console
 * in dev — see utils/notify.js).
 */
router.post("/register-request", async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const otpExpires = Date.now() + (Number(process.env.OTP_EXPIRES_MINUTES) || 10) * 60 * 1000;

  db.prepare(
    `INSERT INTO pending_registrations (email, name, phone, password_hash, otp_code, otp_expires)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       name = excluded.name,
       phone = excluded.phone,
       password_hash = excluded.password_hash,
       otp_code = excluded.otp_code,
       otp_expires = excluded.otp_expires`
  ).run(email, name, phone, passwordHash, otp, otpExpires);
    await sendOtpEmail(email, otp);

  res.status(200).json({ message: "OTP sent. Check your email to verify your account." });
});

/**
 * Step 2 of registration: confirm the OTP, promote the pending
 * registration into a real user, and return a session token.
 */
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  const pending = db.prepare("SELECT * FROM pending_registrations WHERE email = ?").get(email);

  if (!pending) {
    return res.status(404).json({ message: "No pending registration found for this email." });
  }
  if (Date.now() > pending.otp_expires) {
    return res.status(410).json({ message: "This code has expired. Please register again." });
  }
  if (pending.otp_code !== otp) {
    return res.status(400).json({ message: "Invalid or expired code." });
  }

  const result = db
    .prepare(
      `INSERT INTO users (name, email, phone, password_hash, is_verified)
       VALUES (?, ?, ?, ?, 1)`
    )
    .run(pending.name, pending.email, pending.phone, pending.password_hash);

  db.prepare("DELETE FROM pending_registrations WHERE email = ?").run(email);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  const token = signToken(user.id);

  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken(user.id);
  res.status(200).json({ token, user: publicUser(user) });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  // Always respond with 200 regardless of whether the account exists, so
  // the endpoint can't be used to enumerate registered emails.
  if (user) {
    const token = nanoid(32);
    const expires = Date.now() + 60 * 60 * 1000;
    db.prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?").run(
      token,
      expires,
      user.id
    );
    await sendPasswordResetEmail(email, token);
  }

  res.status(200).json({ message: "If that email exists, a reset link has been sent." });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: "Token and new password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  const user = db.prepare("SELECT * FROM users WHERE reset_token = ?").get(token);
  if (!user || Date.now() > user.reset_token_expires) {
    return res.status(400).json({ message: "This reset link is invalid or has expired." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare(
    "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?"
  ).run(passwordHash, user.id);

  res.status(200).json({ message: "Password updated. You can now log in." });
});

router.get("/me", (req, res) => {
  // Lightweight session check used by the frontend on refresh, if needed.
  res.status(200).json({ message: "Use Authorization header with a Bearer token." });
});

export default router;
