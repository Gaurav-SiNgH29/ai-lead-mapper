import { CRM_FIELDS, ALLOWED_CRM_STATUS, ALLOWED_DATA_SOURCE } from "../schema/crmSchema.js";

// Builds the exact prompt sent to Gemini for one batch of raw CSV rows.
// Isolated in its own file so prompt iteration never requires touching
// the batching, retry, or deduplication logic in aiMapper.js.
//
// Design decisions encoded in this prompt:
// - Every record is returned (never silently dropped) — skipped ones are
//   flagged with _skipped=true so the caller always gets a 1:1 output/input match
// - Enum fields (crm_status, data_source) have explicit allowed-value lists
//   to prevent the model from inventing plausible-but-wrong values
// - country_code normalization is explicit because real-world data has
//   "91", "+91", "0091" — all meaning the same thing
// - Extra contact info (multiple emails/phones) goes into crm_note rather
//   than being silently discarded
export function buildPrompt(batch) {
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