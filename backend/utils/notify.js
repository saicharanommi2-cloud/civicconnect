import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s/g, ""),
    },
  });
}

export async function sendOtpEmail(email, otp) {
  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"CivicConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "CivicConnect OTP Verification",
      html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 10 minutes.</p>`,
    });

    console.log("✅ OTP Email Sent");
  } catch (err) {
    console.error("❌ OTP Email Error:", err);
  }
}

export async function sendPasswordResetEmail(email, token) {
  try {
    const transporter = getTransporter();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"CivicConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click here:</p><a href="${resetUrl}">${resetUrl}</a>`,
    });

    console.log("✅ Reset Email Sent");
  } catch (err) {
    console.error("❌ Reset Email Error:", err);
  }
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}