import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "./config.js";
import { CRM_FIELDS, ALLOWED_CRM_STATUS, ALLOWED_DATA_SOURCE } from "./crmSchema.js";
import { deduplicateRecords } from "./deduplicate.js";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const BATCH_SIZE = 25;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function buildPrompt(batch) {
  return `
You are a data mapping engine for a CRM system. You will receive an array of
raw records extracted from a CSV file. The CSV may use ANY column names,
ANY order, and may include irrelevant or extra columns — you must intelligently
figure out which raw field maps to which CRM field based on meaning, not exact name.

Map EVERY raw record (one output object per input record, same order) to this
exact CRM schema, plus two extra tracking fields. Every output object must have
EXACTLY these keys, in this order, and no other keys:
${JSON.stringify([...CRM_FIELDS, "_skipped", "_skip_reason"])}

Rules you MUST follow exactly:
1. "crm_status" must be one of ONLY these values, or an empty string if unclear:
   ${JSON.stringify(ALLOWED_CRM_STATUS)}
2. "data_source" must be one of ONLY these values, or an empty string if not
   confidently matched — never invent a new value:
   ${JSON.stringify(ALLOWED_DATA_SOURCE)}
3. "created_at" must be a date string parseable by JavaScript's new Date(...) function.
   If no date-like field exists, leave it as an empty string.
4. If the raw record contains multiple email addresses, use the first as
   "email" and append any additional emails into "crm_note".
5. If the raw record contains multiple phone numbers, use the first as
   "mobile_without_country_code" and append any additional numbers into "crm_note".
6. Put any extra useful info that doesn't fit another field (remarks, comments,
   follow-up notes) into "crm_note".
7. If a record has NEITHER an email NOR a phone number anywhere in it, still
   map whatever fields you can (e.g. name, company), set "_skipped" to true,
   and set "_skip_reason" to "No email or mobile number found". For every
   other record, set "_skipped" to false and "_skip_reason" to an empty string.
8. Never introduce raw line breaks inside any field value — escape as \\n if needed.
9. "country_code" must always be normalized to include a leading "+" sign
   (e.g. "91" or "+91" or "0091" should all become "+91"). If no country
   code is present in the source data, leave it blank rather than guessing one.

Return ONLY valid JSON, no markdown code fences, no explanation text, in exactly
this shape:
{
  "records": [ { ...CRM fields..., "_skipped": false, "_skip_reason": "" }, ... ]
}

Here is the batch of raw records to map:
${JSON.stringify(batch)}
`.trim();
}

function extractJson(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

function buildFailureFallback() {
  const blankRecord = Object.fromEntries(CRM_FIELDS.map((field) => [field, ""]));
  return { ...blankRecord, _skipped: true, _skip_reason: "AI processing failed after retries" };
}

async function processBatchWithRetry(batch) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const prompt = buildPrompt(batch);
      const result = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const parsed = extractJson(result.text);

      if (!Array.isArray(parsed.records) || parsed.records.length !== batch.length) {
        throw new Error("Response 'records' array missing or doesn't match batch size");
      }

      return parsed.records;
    } catch (err) {
      lastError = err;
      console.warn(`Batch attempt ${attempt + 1} failed:`, err.message);

      if (attempt < MAX_RETRIES) {
        await wait(RETRY_DELAY_MS);
      }
    }
  }

  console.error("Batch permanently failed after retries:", lastError?.message);
  return batch.map(() => buildFailureFallback());
}

// Main export: batches raw rows, maps each to CRM fields, and splits
// results into imported / skipped. Every skipped row — whether skipped
// for missing contact info, AI failure, OR being a duplicate — is kept
// in its ORIGINAL raw CSV shape, so the skipped table never mixes
// raw-shaped and CRM-shaped rows together.
export async function mapRecordsToCRM(rawRows) {
  const batches = chunkArray(rawRows, BATCH_SIZE);

  const skipped = [];
  const importCandidates = []; // { record, rawRow } pairs awaiting dedup

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

  const { uniqueRecords, duplicateRawRows } = deduplicateRecords(importCandidates);

  const allSkipped = [...skipped, ...duplicateRawRows];

  return {
    imported: uniqueRecords,
    skipped: allSkipped,
    totalImported: uniqueRecords.length,
    totalSkipped: allSkipped.length,
  };
}