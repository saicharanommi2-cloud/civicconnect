import { upload } from "../middleware/upload.js";
import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post(
  "/analyze",
  upload.array("media", 1),
  async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No image uploaded.",
      });
    }

    const imagePath = req.files[0].path;

    const imageBytes = fs.readFileSync(imagePath);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: req.files[0].mimetype,
            data: imageBytes.toString("base64"),
          },
        },
        {
          text: `
You are an AI assistant for CivicConnect.

Analyze this uploaded image.

Return ONLY JSON.

{
  "isRealIssue": true,
  "category": "",
  "department": "",
  "severity": "",
  "confidence": 0,
  "summary": ""
}

Rules:

If image is NOT a civic issue
(Selfie, Animal, Food, Random object, Screenshot)

Return

"isRealIssue": false

Possible categories

Road
Garbage
Water
Drainage
Electricity
Public Safety
Transport
Health

Severity

Low
Medium
High
          `,
        },
      ],
    });

    const text = response.text;

    res.json(JSON.parse(text));

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;