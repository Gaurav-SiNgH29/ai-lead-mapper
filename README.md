# GrowEasy CSV Importer

An AI-powered CSV importer that intelligently extracts CRM lead data from
**any** CSV format — Facebook Lead exports, Google Ads exports, real estate
CRM exports, manually created spreadsheets, and more — without requiring the
uploaded file to match any specific column layout.

The core challenge this project solves isn't CSV parsing itself — it's
allowing a user to upload a CSV with completely arbitrary column names,
order, and structure, and have the system accurately map that data into
GrowEasy's fixed CRM schema using an LLM.

---

## How it works

1. **Upload** — drag & drop or file picker, `.csv` only, 5MB max
2. **Preview** — the file is parsed and shown exactly as uploaded, in a
   scrollable table with a sticky header. No AI call happens at this stage.
3. **Confirm** — only on explicit confirmation does the frontend call the
   backend API
4. **AI mapping** — the backend batches the parsed rows and sends them to
   Gemini, which intelligently maps arbitrary column names to the fixed CRM
   schema based on *meaning*, not exact naming
5. **Results** — imported and skipped records are shown in separate tables,
   along with total counts

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS, react-dropzone, PapaParse |
| Backend | Node.js, Express, Multer, PapaParse |
| AI | Google Gemini (`gemini-2.5-flash-lite`) via `@google/genai` |
| Database | None — the app is stateless by design, per assignment scope |

### Why `gemini-2.5-flash-lite`

The mapping task is pattern-matching against a known schema, not deep
multi-step reasoning — so a lightweight, high-throughput model is a better
fit than a heavier reasoning model. This choice also maximizes free-tier
request headroom during development and evaluation. Extended "thinking" is
explicitly disabled (`thinkingBudget: 0`) for the same reason: it isn't
needed for this task and only adds latency.

---

## Project structure

```
groweasy-csv-importer/
├── backend/
│   ├── src/
│   │   ├── server.js        # Express app, single upload/import route
│   │   ├── aiMapper.js       # Batching, Gemini prompt, retry logic
│   │   ├── deduplicate.js    # Duplicate lead detection (email + mobile)
│   │   ├── crmSchema.js      # CRM field list + allowed enum values
│   │   └── config.js         # Centralized environment variable loading
│   ├── .env                  # GEMINI_API_KEY, PORT (not committed)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── page.js       # Page composition + step state machine
│   │   ├── components/
│   │   │   ├── UploadDropzone.jsx
│   │   │   ├── PreviewTable.jsx
│   │   │   ├── ResultsTable.jsx
│   │   │   └── ui/
│   │   │       ├── Button.jsx
│   │   │       ├── Spinner.jsx
│   │   │       └── FileChip.jsx
│   │   ├── constants/
│   │   │   ├── apiEndpoints.js
│   │   │   ├── messages.js
│   │   │   └── crmSchema.js  # Mirrors backend's schema for column headers
│   │   └── api/
│   │       └── importApi.js  # Single fetch wrapper for the import call
│   └── package.json
│
└── README.md
```

---

## Setup instructions

### Prerequisites
- Node.js (v18 or later recommended)
- A Gemini API key — get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 1. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=4000
```

Start the backend:

```bash
npm run dev
```

The server runs at `http://localhost:4000`. Confirm it's up by visiting
`http://localhost:4000/health` — you should see `{"status":"ok"}`.

### 2. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
```

If your backend runs anywhere other than `http://localhost:4000`, create a
`.env.local` file inside `frontend/`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 3. Try it out

Upload any CSV with lead-like data (name, email, phone, and any other
columns under any naming). The app will preview it, then map it to the CRM
schema on confirmation.

---

## CRM schema & mapping rules

The AI maps every record to this fixed schema:

`created_at, name, email, country_code, mobile_without_country_code, company,
city, state, country, lead_owner, crm_status, crm_note, data_source,
possession_time, description`

Key rules enforced in the AI prompt:

- `crm_status` must be one of `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`,
  `BAD_LEAD`, `SALE_DONE` — or left blank if unclear. Never invented.
- `data_source` must be one of a fixed set of known sources, or left blank
  if not confidently matched.
- `country_code` is normalized to always include a leading `+` (e.g. `91`,
  `0091`, and `+91` all become `+91`).
- If multiple emails or phone numbers exist in one raw record, the first is
  used as the primary field; the rest are appended into `crm_note`.
- A record is skipped only if it has **neither** an email **nor** a mobile
  number.

## Beyond the spec: duplicate detection

Not required by the assignment, but added as a data-quality safeguard:
records with the same normalized email + mobile number combination are
detected after AI mapping and excluded from `imported`, appearing instead in
`skipped` with a clear "duplicate record" reason. This runs across the
*entire* CSV (not per-batch), so duplicates spanning different batches are
still caught correctly.

---

## Known limitations

- **Gemini free-tier daily quota**: the free tier for Gemini models is
  capped at a small number of requests per day, shared across all keys in
  the same Google Cloud project. Heavy testing can exhaust this quota,
  surfacing as a `429` error. For reliable evaluation, either enable
  billing on the associated Google Cloud project (usage costs for this
  scale of testing are negligible) or use a fresh project/key.
- **Sequential batch processing**: batches are currently sent to Gemini one
  at a time rather than in parallel. This was a deliberate scope decision
  given the assignment's time constraints — the codebase is structured so
  that adding a concurrency-limited parallel processor later would only
  require changes inside `aiMapper.js`, with no changes needed elsewhere.
- **No automated tests**: given the project timeline, testing was done
  manually with a range of deliberately messy CSVs (renamed/reordered
  columns, quoted commas, multiple emails/phones per record, malformed
  quotes, missing fields, and duplicate records) rather than an automated
  suite.

---

## Bonus items implemented

- Drag & drop upload
- Duplicate lead detection (beyond spec)
- Loading state during AI processing
- Clear, itemized error handling (invalid file type, empty file, oversized
  file, failed AI batches)

## Bonus items not implemented (given time constraints)

- Parallel/streaming batch processing
- Unit tests
- Docker setup
- Dark mode
- Virtualized tables for very large CSVs

---

## Submitted for

Software Developer (Intern) — GrowEasy
