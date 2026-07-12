// Mirrors backend/src/crmSchema.js — kept in sync manually since frontend
// and backend are separate apps in this monorepo. If a field is added,
// renamed, or removed on the backend, this file MUST be updated to match.
//
// Why not a shared package? A proper monorepo setup (e.g. turborepo with
// a packages/shared directory) would eliminate this coupling entirely —
// deliberately out of scope for this assignment's timeline, but the
// right long-term call for a production system.

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

// Human-readable labels for each CRM field — used in table column headers
// so evaluators and end users see "Created At" instead of "created_at".
// Kept co-located with the field list so adding a new field forces you
// to also add its label — they can't drift apart accidentally.
export const CRM_FIELD_LABELS = {
  created_at: "Created At",
  name: "Name",
  email: "Email",
  country_code: "Country Code",
  mobile_without_country_code: "Mobile",
  company: "Company",
  city: "City",
  state: "State",
  country: "Country",
  lead_owner: "Lead Owner",
  crm_status: "Status",
  crm_note: "Notes",
  data_source: "Source",
  possession_time: "Possession Time",
  description: "Description",
};