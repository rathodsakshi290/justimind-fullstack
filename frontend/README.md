# JustiMind Frontend

A real, connected React app (Vite + React Router) that talks to the FastAPI
backend in `../backend`. Every page here calls a real endpoint — there is no
sample data hardcoded into these pages (the Knowledge Graph page is the one
exception, clearly labeled in-app, since there's no real case-law graph data
behind this project).

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` by default and expects the backend at
`http://localhost:8000`. To point at a different backend URL, create a
`.env` file:

```
VITE_API_BASE=http://localhost:8000
```

## Pages

| Route | What it does |
|---|---|
| `/login` | Real signup/login against the backend. First account ever created becomes Admin. |
| `/workspace` | Chat — persisted history, real LLM replies via the backend. |
| `/summarizer` | Submit case text, get a real LLM-generated structured summary. |
| `/prediction` | Pick a previously summarized case, run a real LLM-based outcome analysis on it. |
| `/analyzer` | Submit document text, get real LLM-based clause/compliance findings. |
| `/analytics` | Real counts and charts computed from your account's actual stored cases/documents. |
| `/knowledge-graph` | Interactive but sample data — no real graph backend exists yet. |
| `/admin` | Real user list — visible only to the Admin account. |

## Build for production

```bash
npm run build
```

Outputs to `dist/`. This has been verified to build cleanly (no compile
errors) as part of putting this project together.

## Extending

Each page follows the same pattern: call a function from `src/lib/api.js`,
handle loading/error state, render the response. To add a new backend-wired
feature, add the endpoint to `api.js` and follow the pattern in
`SummarizerPage.jsx` or `AnalyzerPage.jsx`.
