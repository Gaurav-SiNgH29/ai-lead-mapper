import express from "express";
import cors from "cors";
import multer from "multer";
import Papa from "papaparse";
import { mapRecordsToCRM } from "./aiMapper.js";
import { PORT } from "./config.js";

const app = express();

app.use(cors());
app.use(express.json());

// multer handles the file upload itself; we keep the file in memory
// (not written to disk) since we only need it briefly to parse
const upload = multer({ storage: multer.memoryStorage() });

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// POST /api/import
// Accepts a CSV file under the field name "file", parses it, and
// this route just proves parsing works correctly.
app.post("/api/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Send a CSV under field name 'file'." });
    }

    const isCsv =
      req.file.mimetype === "text/csv" ||
      req.file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      return res.status(400).json({ error: "Uploaded file is not a CSV." });
    }

    const csvText = req.file.buffer.toString("utf-8");

    if (!csvText.trim()) {
      return res.status(400).json({ error: "Uploaded CSV is empty." });
    }

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.warn("CSV parse warnings:", parsed.errors);
    }

    const result = await mapRecordsToCRM(parsed.data);

    return res.json(result);
  } catch (err) {
    console.error("Error parsing CSV:", err);
    return res.status(500).json({ error: "Failed to parse CSV." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});0