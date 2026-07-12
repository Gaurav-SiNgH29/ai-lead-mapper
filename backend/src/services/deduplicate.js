import { SKIP_REASONS } from "../config/constants.js";

// Deduplicates by (email + mobile) identity, computed from the AI-mapped
// CRM record — but returns the ORIGINAL raw CSV row for any duplicate found,
// so skipped rows always stay in the same raw shape as other skip reasons,
// regardless of why a record was excluded.
//
// Why email + mobile together, not just email?
// A shared family email with different phone numbers represents two distinct
// leads — deduplicating on email alone would incorrectly collapse them.
// Requiring BOTH to match is a more conservative, less destructive rule.
function buildIdentityKey(record) {
  const email = (record.email || "").trim().toLowerCase();
  const mobile = (record.mobile_without_country_code || "").trim();
  return `${email}|${mobile}`;
}

// Accepts an array of { record, rawRow } pairs (AI-mapped CRM record +
// its original raw CSV row). Returns unique CRM records to import, and
// duplicates as raw rows with a reason — matching the shape of every
// other skipped-row source so the frontend never needs to handle
// duplicates differently from other skip types.
export function deduplicateRecords(pairs) {
  const seen = new Set();
  const uniqueRecords = [];
  const duplicateRawRows = [];

  for (const { record, rawRow } of pairs) {
    const key = buildIdentityKey(record);

    if (seen.has(key)) {
      duplicateRawRows.push({
        row: rawRow,
        reason: SKIP_REASONS.duplicate,
      });
      continue;
    }

    seen.add(key);
    uniqueRecords.push(record);
  }

  return { uniqueRecords, duplicateRawRows };
}