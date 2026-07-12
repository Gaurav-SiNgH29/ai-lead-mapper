import express from "express";
import cors from "cors";
import multer from "multer";
import Papa from "papaparse";
import { mapRecordsToCRM } from "./services/aiMapper.js";
import { PORT } from "./config/config.js";
import {
  MAX_FILE_SIZE_BYTES,
  ACCEPTED_MIME_TYPE,
  ACCEPTED_EXTENSION,
  ROUTES,
  ERROR_MESSAGES,
  LOG_MESSAGES,
} from "./config/constants.js";

const app = express();

app.use(cors());
app.use(express.json());

// File kept in memory rather than written to disk — we only need it
// briefly to parse, and never persist it. Size limit enforced here
// server-side to match the frontend's client-side validation exactly.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

// Health check — used by the frontend's checkHealth() to verify the
// backend is reachable before surfacing a confusing "Failed to fetch"
// error on Render's free-tier cold starts.
app.get(ROUTES.health, (req, res) => {
  res.json({ status: "ok" });
});

// POST /api/import
// Accepts a CSV file under the field name "file", parses it, sends it
// to the AI mapping layer, and returns structured CRM records.
// Validation order: file presence → MIME type → empty content → parse.
app.post(ROUTES.import, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: ERROR_MESSAGES.noFileUploaded });
    }

    const isCsv =
      req.file.mimetype === ACCEPTED_MIME_TYPE ||
      req.file.originalname.toLowerCase().endsWith(ACCEPTED_EXTENSION);

    if (!isCsv) {
      return res.status(400).json({ error: ERROR_MESSAGES.notACsv });
    }

    const csvText = req.file.buffer.toString("utf-8");

    if (!csvText.trim()) {
      return res.status(400).json({ error: ERROR_MESSAGES.emptyCsv });
    }

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      // PapaParse reports row-level warnings without failing the whole
      // parse — log them for debugging but continue with what parsed.
      console.warn(LOG_MESSAGES.csvParseWarnings, parsed.errors);
    }

    const result = await mapRecordsToCRM(parsed.data);

    return res.json(result);
  } catch (err) {
    console.error(LOG_MESSAGES.importError, err);
    return res.status(500).json({ error: ERROR_MESSAGES.processingFailed });
  }
});

app.listen(PORT, () => {
  console.log(LOG_MESSAGES.serverRunning(PORT));
});