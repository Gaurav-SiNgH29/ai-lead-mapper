// CRM schema constants — single source of truth for field definitions,
// allowed enum values, and validation rules used across the backend.
//
// IMPORTANT: CRM_FIELDS is mirrored in frontend/src/constants/crmSchema.js.
// If a field is added, renamed, or removed here, that file MUST be updated
// to match, and CRM_FIELD_LABELS in the same file must get a new entry too.
// The correct long-term fix is a shared package (e.g. packages/shared in a
// turborepo setup) — deliberately out of scope for this assignment's timeline.

export const CRM_FIELDS = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description",
];

// Only these values are valid for crm_status — the AI prompt enforces
// this, and any value outside this list indicates a prompt compliance
// failure worth investigating.
export const ALLOWED_CRM_STATUS = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
];

// Only these values are valid for data_source — if the source in the
// raw CSV doesn't confidently match one of these, the AI must leave
// the field blank rather than inventing a close-but-wrong value.
export const ALLOWED_DATA_SOURCE = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
];