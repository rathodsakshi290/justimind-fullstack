# JustiMind — Enterprise Legal Intelligence Platform

JustiMind is a full-stack legal intelligence platform combining advanced LLM reasoning, semantic precedent retrieval, and mathematical formal verification using the Microsoft Z3 SMT solver.

---

## Core Capabilities

- **Prediction Engine**: Reasoned probability analysis of case outcomes (win, loss, settlement) with evidentiary strength weighting and tactical SWOT modeling.
- **Case Summarizer**: Automated extraction of critical facts, legal issues, procedural posture, and strategic recommendations from complex filings.
- **Formal Verification Engine**: Mathematical proof of statutory limitations, procedural deadlines, and contract clause consistency using the Microsoft Z3 SMT theorem prover.
- **Document Analyzer**: Automated auditing of contracts and agreements for risk level, statutory violations, missing protections, and regulatory compliance.
- **Interactive Knowledge Graph**: Graph visualization mapping precedent citations, statutes, judicial opinions, and case relationships.
- **Semantic Research & Dockets**: Cross-referenced statutory search and live legal updates.
- **Multi-Jurisdiction Support**: Localized frameworks covering US Federal, UK Common Law, Indian High Courts & Supreme Court, and EU regulations.

---

## Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Routing**: React Router (HashRouter for universal hosting support)
- **Visualization**: Recharts & SVG interactive canvas
- **Icons & Styling**: Lucide React & custom CSS design tokens
- **Internationalization**: Built-in multi-language and RTL jurisdiction switching

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Verification Solver**: Microsoft Z3 SMT Theorem Prover (`z3-solver`)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: Security Headers Middleware, CORS policies, and rate limiting

---

## Project Structure

```
justimind-fullstack/
├── frontend/                   # Modern React SPA
│   ├── src/
│   │   ├── pages/              # Product views (Workspace, Prediction, Verification, etc.)
│   │   ├── components/         # Navigation, layout, legal markdown & controls
│   │   ├── context/            # Auth, Theme, and Language context providers
│   │   └── lib/                # API client layer
│   ├── dist/                   # Production build bundle
│   └── package.json
├── backend/                    # FastAPI REST API
│   ├── main.py                 # Application entrypoint & middleware
│   ├── z3_verifier.py          # Z3 formal logic verification engine
│   ├── database.py             # Database configuration
│   ├── models.py               # SQLAlchemy ORM models
│   ├── schemas.py              # Pydantic validation schemas
│   ├── auth.py                 # Password hashing & JWT handlers
│   ├── routers/                # Endpoint routers (auth, cases, verification, etc.)
│   └── tests/                  # Pytest test suite
├── docker-compose.yml          # Container configuration
└── render.yaml                 # Render cloud deployment blueprint
```

---

## Getting Started Locally

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- Web App: `http://localhost:5173`

---

## Running Automated Tests

Run the backend test suite:

```bash
# From backend directory with venv activated
pytest tests/
```

Run specific verification tests:

```bash
pytest backend/tests/test_verification.py
```

---

## Deployment

### GitHub Pages (Frontend)
The production bundle is configured with relative base asset paths and HashRouter:
- **Live URL**: `https://rathodsakshi290.github.io/justimind-fullstack/`
- Build output is deployed via the `gh-pages` branch or GitHub Actions workflow (`.github/workflows/deploy.yml`).

### Docker
Run both services in local containers:

```bash
docker compose up --build
```

### Cloud Platforms (Render / Railway / Vercel)
- **Render**: Connect the repository and select `render.yaml` to deploy both the FastAPI backend and static frontend.
- **Vercel**: Deploy the `frontend/` directory with the included `vercel.json` SPA configuration.
