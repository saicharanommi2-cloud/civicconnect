import { Router } from "express";
import { nanoid } from "nanoid";
import db from "../models/db.js";
import { upload } from "../middleware/upload.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = Router();

function serializeIssue(row) {
  return {
    id: row.id,
    referenceId: row.reference_id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    description: row.description,
    priority: row.priority,
    status: row.status,
    location: row.lat && row.lng ? { lat: row.lat, lng: row.lng } : null,
    media: JSON.parse(row.media_paths).map((p) => `/uploads/${p}`),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateReferenceId() {
  return `CC-${Math.floor(10000 + Math.random() * 89999)}`;
}

// Create a new issue. Works for logged-in users and guests alike —
// req.userId will simply be undefined for guests.
router.post("/", optionalAuth, upload.array("media", 6), (req, res) => {
  const { title, category, description, priority, lat, lng } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ message: "Title, category, and description are required." });
  }

  let referenceId = generateReferenceId();
  // Guard against the rare collision.
  while (db.prepare("SELECT id FROM issues WHERE reference_id = ?").get(referenceId)) {
    referenceId = generateReferenceId();
  }

  const mediaFilenames = (req.files || []).map((f) => f.filename);

  const result = db
    .prepare(
      `INSERT INTO issues (reference_id, user_id, title, category, description, priority, lat, lng, media_paths)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      referenceId,
      req.userId || null,
      title,
      category,
      description,
      priority || "normal",
      lat ? Number(lat) : null,
      lng ? Number(lng) : null,
      JSON.stringify(mediaFilenames)
    );
  console.log("✅ Report inserted. ID:", result.lastInsertRowid);
  const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(result.lastInsertRowid);
  console.log(issue);
  res.status(201).json({ issue: serializeIssue(issue) });
});

// List the logged-in user's own issues.
router.get("/mine", requireAuth, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM issues WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.userId);
  res.json({ issues: rows.map(serializeIssue) });
});

// Look up a single issue by its public reference ID (e.g. CC-10234).
// No auth required so the Track page works for anyone with the code.
router.get("/:referenceId", (req, res) => {
  const row = db
    .prepare("SELECT * FROM issues WHERE reference_id = ?")
    .get(req.params.referenceId.toUpperCase());

  if (!row) {
    return res.status(404).json({ message: "No report found with that reference number." });
  }

  res.json({ issue: serializeIssue(row) });
});

// Update an issue's status — intended for an internal/admin tool, kept
// open here for demo purposes. Add an admin-role check before production use.
router.patch("/:referenceId/status", requireAuth, (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "in-progress", "resolved", "rejected"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}` });
  }

  const row = db
    .prepare("SELECT * FROM issues WHERE reference_id = ?")
    .get(req.params.referenceId.toUpperCase());
  if (!row) {
    return res.status(404).json({ message: "Issue not found." });
  }

  db.prepare("UPDATE issues SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
    status,
    row.id
  );

  const updated = db.prepare("SELECT * FROM issues WHERE id = ?").get(row.id);
  res.json({ issue: serializeIssue(updated) });
});

export default router;
