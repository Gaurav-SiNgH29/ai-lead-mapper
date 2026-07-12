import { GEMINI_API_KEY, OPENAI_API_KEY } from "../config/config.js";
import { GoogleGenAI } from "@google/genai";
import { CRM_FIELDS } from "../schema/crmSchema.js";
import { deduplicateRecords } from "./deduplicate.js";
import { buildPrompt } from "../prompts/prompt.js";
import { processBatchWithOpenAI } from "./openaiMapper.js";
import {
  GEMINI_MODEL,
  BATCH_SIZE,
  MAX_RETRIES,
  RETRY_DELAY_MS,
  THINKING_BUDGET,
  SKIP_REASONS,
  LOG_MESSAGES,
} from "../config/constants.js";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Pauses execution for `ms` milliseconds — used between retry attempts
// to give transient API failures (503, rate limits) time to clear before
// hitting the same endpoint again immediately.
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Splits an array into chunks of `size` — keeps batch processing logic
// clean by separating the chunking concern from the processing concern.
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// Strips markdown code fences in case the model wraps its JSON output
// in ```json ... ``` despite being told not to — a common LLM quirk
// that our prompt explicitly discourages but can't fully prevent.
function extractJson(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

// Builds a fallback record when a batch permanently fails — keeps the
// same CRM shape as a successful response so downstream code never
// needs to special-case a failure differently from a normal skip.
function buildFailureFallback() {
  const blankRecord = Object.fromEntries(CRM_FIELDS.map((field) => [field, ""]));
  return {
    ...blankRecord,
    _skipped: true,
    _skip_reason: SKIP_REASONS.aiFailure,
  };
}

// Sends one batch to Gemini, retrying on failure (bad JSON, API error, etc.)
// Retry delay gives transient failures time to resolve before the next attempt.
// Sends one batch to Gemini with retries. If ALL Gemini attempts fail,
// falls back to OpenAI before permanently marking the batch as failed.
// The fallback is transparent — callers receive identical record shapes
// regardless of which provider ultimately processed the batch.
async function processBatchWithRetry(batch) {
  let lastError;

  // Attempt Gemini first — preferred provider (free tier, lower latency)
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const prompt = buildPrompt(batch);
      const result = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: THINKING_BUDGET },
        },
      });

      const parsed = extractJson(result.text);

      if (
        !Array.isArray(parsed.records) ||
        parsed.records.length !== batch.length
      ) {
        throw new Error(
          "Response 'records' array missing or doesn't match batch size"
        );
      }

      return parsed.records;
    } catch (err) {
      lastError = err;
      console.warn(LOG_MESSAGES.batchAttemptFailed(attempt), err.message);

      if (attempt < MAX_RETRIES) {
        await wait(RETRY_DELAY_MS);
      }
    }
  }

  // Gemini exhausted — attempt OpenAI fallback before giving up.
  // One attempt only: if both providers fail, the batch is permanently failed.
  if (OPENAI_API_KEY) {
    try {
      console.warn("[aiMapper] Gemini exhausted — attempting OpenAI fallback");
      const records = await processBatchWithOpenAI(batch);
      console.log("[aiMapper] OpenAI fallback succeeded");
      return records;
    } catch (fallbackErr) {
      console.error(
        "[aiMapper] OpenAI fallback also failed:",
        fallbackErr.message
      );
    }
  } else {
    console.warn(
      "[aiMapper] OpenAI fallback unavailable — OPENAI_API_KEY not set"
    );
  }

  // Both providers failed — mark every record in this batch as skipped
  // rather than losing them silently or crashing the whole request.
  console.error(LOG_MESSAGES.batchPermanentlyFailed, lastError?.message);
  return batch.map(() => buildFailureFallback());
}

// Main export: batches raw rows, maps each to CRM fields via Gemini,
// and splits results into imported / skipped. Every skipped row —
// whether skipped for missing contact info, AI failure, or being a
// duplicate — is kept in its ORIGINAL raw CSV shape so the skipped
// table never mixes raw-shaped and CRM-shaped rows together.
export async function mapRecordsToCRM(rawRows) {
  const batches = chunkArray(rawRows, BATCH_SIZE);

  const skipped = [];
  const importCandidates = [];

  for (const batch of batches) {
    const mappedRecords = await processBatchWithRetry(batch);

    mappedRecords.forEach((record, i) => {
      const rawRow = batch[i];
      const { _skipped, _skip_reason, ...crmRecord } = record;

      if (_skipped) {
        skipped.push({ row: rawRow, reason: _skip_reason });
      } else {
        importCandidates.push({ record: crmRecord, rawRow });
      }
    });
  }

  // Deduplication runs after ALL batches merge — duplicates can span
  // across batch boundaries, so per-batch dedup would miss cross-batch
  // duplicates entirely.
  const { uniqueRecords, duplicateRawRows } = deduplicateRecords(importCandidates);
  const allSkipped = [...skipped, ...duplicateRawRows];

  return {
    imported: uniqueRecords,
    skipped: allSkipped,
    totalImported: uniqueRecords.length,
    totalSkipped: allSkipped.length,
  };
}