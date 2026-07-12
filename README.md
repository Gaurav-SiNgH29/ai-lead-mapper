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
   schema based on *meaning*, not exact naming. If Gemini fails, the system
   automatically falls back to Groq (Llama 3.3 70B) before giving up.
5. **Results** — imported and skipped records are shown in separate tables,
   along with total counts

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS, react-dropzone, PapaParse |
| Backend | Node.js, Express, Multer, PapaParse |
| AI (Primary) | Google Gemini (`gemini-2.5-flash-lite`) via `@google/genai` |
| AI (Fallback) | Groq (`llama-3.3-70b-versatile`) via OpenAI-compatible SDK |
| Database | None — the app is stateless by design, per assignment scope |

### Why `gemini-2.5-flash-lite`

The mapping task is pattern-matching against a known schema, not deep
multi-step reasoning — so a lightweight, high-throughput model is a better
fit than a heavier reasoning model. Extended "thinking" is explicitly
disabled (`thinkingBudget: 0`) for the same reason: it isn't needed for
this task and only adds latency.

### Why Groq as fallback

Gemini's free tier has a daily request cap. If Gemini's quota is exhausted
or the API returns a transient error, the system automatically retries with
Groq — a free, no-credit-card-required provider with generous daily limits.
The fallback is transparent: the same prompt is sent, the same response
shape is expected, and the user sees no difference in the results.

---

## Project structure

```
groweasy-csv-importer/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express app, single upload/import route
│   │   ├── config/
│   │   │   ├── config.js          # Centralized environment variable loading
│   │   │   └── constants.js       # All magic values, error/log messages
│   │   ├── services/
│   │   │   ├── aiMapper.js        # Batching, retry logic, fallback orchestration
│   │   │   ├── openaiMapper.js    # Groq fallback (OpenAI-compatible SDK)
│   │   │   └── deduplicate.js     # Duplicate lead detection (email + mobile)
│   │   ├── prompts/
│   │   │   └── prompt.js          # AI prompt — isolated for independent iteration
│   │   └── schema/
│   │       └── crmSchema.js       # CRM field list + allowed enum values
│   ├── .env                       # API keys, PORT (not committed)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js            # Page composition + step state machine
│   │   │   └── layout.js          # Root layout with ThemeProvider
│   │   ├── components/
│   │   │   ├── UploadDropzone.jsx
│   │   │   ├── PreviewTable.jsx   # Shared DataTable component
│   │   │   ├── ResultsTable.jsx
│   │   │   └── ui/
│   │   │       ├── Button.jsx
│   │   │       ├── Spinner.jsx
│   │   │       ├── FileChip.jsx
│   │   │       └── ThemeToggle.jsx
│   │   ├── constants/
│   │   │   ├── apiEndpoints.js    # Centralized backend URLs
│   │   │   ├── messages.js        # All user-facing strings
│   │   │   ├── crmSchema.js       # Mirrors backend schema + human-readable labels
│   │   │   └── theme.js           # Design tokens (colors, surfaces)
│   │   ├── context/
│   │   │   └── ThemeContext.jsx   # Global dark/light mode state
│   │   ├── api/
│   │   │   └── importApi.js       # Single fetch wrapper for the import call
│   │   └── utils/
│   │       └── formatFileSize.js  # Pure utility, extracted from FileChip
│   └── package.json
│
└── README.md
```

---

## Setup instructions

### Prerequisites
- Node.js (v18 or later recommended)
- A Gemini API key — get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- A Groq API key (fallback) — get one free at [console.groq.com](https://console.groq.com) (no credit card required)

### 1. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_groq_api_key_here
PORT=4000
```

Note: `OPENAI_API_KEY` holds the Groq key — Groq's API is OpenAI-compatible,
so the same SDK and variable name work without any changes.

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

---

## AI provider fallback

The system uses a two-provider fallback chain:

1. **Gemini** (`gemini-2.5-flash-lite`) — primary provider, tried first
2. **Groq** (`llama-3.3-70b-versatile`) — fallback, tried automatically if Gemini fails

If Gemini returns a quota error (`429`), the system skips remaining retries
immediately and falls back to Groq rather than waiting through pointless
retry cycles. If both providers fail, the affected batch is marked as skipped
with a clear reason — the rest of the import continues unaffected.

---

---

## Deployment

### Backend — Render

1. Push your code to a public GitHub repository
2. Go to [render.com](https://render.com) and create a new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Add environment variables:
   - `GEMINI_API_KEY` — your Gemini API key
   - `OPENAI_API_KEY` — your Groq API key (Groq is OpenAI-compatible)
   - `PORT` — `4000`
6. Click **Create Web Service**

Once deployed, your backend URL will look like:
`https://your-app-name.onrender.com`

Verify it's running: `https://your-app-name.onrender.com/health` should return `{"status":"ok"}`

> **Note**: Render's free tier spins down after inactivity. The first request
> after a cold start may take 30-60 seconds — this is expected, not a bug.

---

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) and create a new **Project**
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
4. Add environment variable:
   - `NEXT_PUBLIC_API_BASE_URL` — your Render backend URL (e.g. `https://your-app-name.onrender.com`)
5. Click **Deploy**

Once deployed, your frontend URL will look like:
`https://your-app-name.vercel.app`

> **Note**: Vercel auto-redeploys whenever you push to `main` on GitHub.
> No manual redeployment needed after code changes.

## Beyond the spec: duplicate detection

Not required by the assignment, but added as a data-quality safeguard:
records with the same normalized email + mobile number combination are
detected after AI mapping and excluded from `imported`, appearing instead in
`skipped` with a clear "duplicate record" reason. This runs across the
*entire* CSV (not per-batch), so duplicates spanning different batches are
still caught correctly.

---

## Known limitations

- **Gemini free-tier daily quota**: the free tier is capped at 20 requests
  per day per project. The Groq fallback handles this automatically, but if
  both providers are exhausted, affected batches will be marked as skipped.
  For reliable high-volume evaluation, enable billing on the Gemini project.
- **Sequential batch processing**: batches are sent one at a time rather
  than in parallel. Deliberate scope decision — the codebase is structured
  so adding concurrency would only require changes inside `aiMapper.js`.
- **No automated tests**: testing was done manually with a range of
  deliberately messy CSVs (renamed/reordered columns, quoted commas,
  multiple emails/phones per record, malformed quotes, missing fields,
  and duplicate records).
- **Render free-tier cold starts**: the backend may take 30-60 seconds to
  respond on the first request after inactivity. This is expected behavior
  on Render's free tier — subsequent requests are fast.

---

## Bonus items implemented

- Drag & drop upload
- Dark mode / light mode toggle (persists across sessions)
- AI provider fallback (Gemini → Groq) for resilience
- Duplicate lead detection (beyond spec)
- Loading state during AI processing
- Clear, itemized error handling (invalid file type, empty file, oversized
  file, quota exhaustion, failed AI batches)
- File chip with remove/replace option in preview
- Centralized design tokens, strings, and constants (zero hardcoded values
  in components)

## Bonus items not implemented

- Parallel/streaming batch processing
- Unit tests
- Docker setup
- Virtualized tables for very large CSVs

---

## Submitted for

Software Developer (Intern) — GrowEasy
