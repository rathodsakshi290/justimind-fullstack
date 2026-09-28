# JustiMind — Full Project

A real, runnable full-stack project: a FastAPI backend with actual authentication,
a real SQLite database, and a case summarizer that calls a real LLM — plus eight
polished UI screens covering the rest of the product surface.

## What's real vs. what's a prototype (read this first)

**Real and working, end-to-end:**
- `backend/` — FastAPI app with a genuine database (SQLite via SQLAlchemy),
  password hashing (bcrypt), and JWT-based auth (signup/login/me). Tested — see
  `backend/tests/`.
- `frontend-demo/justimind-live-demo.jsx` — a minimal UI that actually calls that
  backend: real signup/login, and a case summarizer that sends your case text to
  Claude via the Anthropic API and gets back a real structured analysis.

**UI prototypes with sample data (not wired to the backend):**
- Everything in `frontend-screens/` — the landing page, AI workspace, prediction
  results, case summarizer, analytics dashboard, document analyzer, knowledge
  graph, and admin panel. These are polished, interactive React components, but
  their content (chat replies, predictions, analytics numbers) is hardcoded
  sample data, not live data from the backend.

**Not included, and why:**
- OAuth (Google/GitHub/Microsoft login) — needs client IDs/secrets registered
  under your own accounts with each provider.
- Live court-data feeds, legal news APIs — gated/paid data sources.
- A trained legal-prediction ML model — needs a real labeled dataset and a
  training pipeline; that's its own project.
- Stripe/Razorpay/Twilio/SendGrid — needs your real accounts and keys.
- Actual deployment — `docker-compose.yml` is provided so it *runs* locally in
  containers, but nothing is deployed to a live server or Kubernetes cluster.

If you want any of the eight prototype screens wired to the real backend the way
`justimind-live-demo.jsx` is, that's a well-defined next step — each one just
needs its sample-data arrays replaced with `fetch()` calls to new backend
endpoints, following the same pattern already in the live demo.

## Project structure

```
justimind-fullstack/
├── backend/                    ← Real FastAPI app
│   ├── main.py                 ← App entrypoint, CORS, router registration
│   ├── database.py             ← SQLAlchemy engine/session setup
│   ├── models.py                ← User, Case ORM models
│   ├── schemas.py               ← Pydantic request/response schemas
│   ├── auth.py                  ← Password hashing, JWT creation/validation
│   ├── llm.py                   ← Real Anthropic API call for summarization
│   ├── routers/
│   │   ├── auth.py               ← /auth/signup, /auth/login, /auth/me
│   │   └── cases.py              ← /cases/summarize, /cases/, /cases/{id}
│   ├── tests/
│   │   └── test_auth.py          ← Real pytest suite (4 tests, all passing)
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── frontend-demo/
│   └── justimind-live-demo.jsx  ← Actually calls the backend above
└── frontend-screens/             ← The 8 polished UI prototypes (sample data)
    ├── justimind-landing.jsx
    ├── justimind-workspace.jsx
    ├── justimind-prediction.jsx
    ├── justimind-summarizer.jsx
    ├── justimind-analytics.jsx
    ├── justimind-analyzer.jsx
    ├── justimind-knowledge-graph.jsx
    └── justimind-admin.jsx
```

## Running the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Open .env and paste your Anthropic API key (from console.anthropic.com)
# into ANTHROPIC_API_KEY — the summarizer endpoint won't work without it.
# Auth (signup/login) works fine even without this key.

uvicorn main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` — FastAPI's interactive Swagger UI, where you
can try every endpoint directly (signup, login, summarize) without any frontend.

Run the real test suite:
```bash
pytest
```

### Running via Docker instead

```bash
cp backend/.env.example backend/.env   # then edit it with your API key
docker compose up --build
```

## Running the live demo frontend

```bash
npm create vite@latest justimind-frontend -- --template react
cd justimind-frontend
npm install lucide-react
cp ../frontend-demo/justimind-live-demo.jsx src/
```

Edit `src/App.jsx`:
```jsx
import JustiMindLiveDemo from "./justimind-live-demo";
export default function App() {
  return <JustiMindLiveDemo />;
}
```

```bash
npm run dev
```

With the backend running on port 8000 and this on port 5173, you can sign up,
log in, paste in case text, and get back a real LLM-generated summary — the full
loop, actually working.

## Running the 8 prototype screens

Same Vite setup, but also `npm install recharts` (used by the analytics and
prediction screens), then copy files from `frontend-screens/` and swap the
import in `App.jsx`. These render fully interactive but use sample data —
no backend calls.

## Extending this

The natural next steps, roughly in order of value:
1. Wire `justimind-workspace.jsx`'s chat to a real backend endpoint (same
   pattern as the summarizer — a `/chat` route that calls the LLM).
2. Wire `justimind-prediction.jsx` to a real `/cases/{id}/predict` endpoint.
3. Add a proper frontend router (React Router or Next.js) so all screens live
   under one app with shared nav and a shared auth-token context, instead of
   each being a standalone file.
4. Move from SQLite to Postgres for anything beyond local development —
   just change `DATABASE_URL` in `.env`.
