import React, { useState, useEffect } from "react";
import { Scale, Sun, Moon, LogOut, Loader2, AlertCircle, FileText } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  JustiMind — Live Demo                                              */
/*  This is the ONE screen in the project that actually talks to the   */
/*  real FastAPI backend: signup/login issue a real JWT, and the       */
/*  summarizer calls a real LLM through your backend. Everything else  */
/*  in frontend-screens/ is a static UI prototype with sample data —   */
/*  this file is the wiring pattern to extend to those screens.        */
/* ------------------------------------------------------------------ */

const API_BASE = "http://localhost:8000";

export default function JustiMindLiveDemo() {
  const [theme, setTheme] = useState("dark");
  const [token, setToken] = useState(() => localStorage.getItem("jm_token") || "");
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [caseTitle, setCaseTitle] = useState("");
  const [caseText, setCaseText] = useState("");
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    if (token) localStorage.setItem("jm_token", token);
    else localStorage.removeItem("jm_token");
  }, [token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { email: form.email, password: form.password, full_name: form.full_name };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication failed");
      setToken(data.access_token);
    } catch (err) {
      setAuthError(
        err.message === "Failed to fetch"
          ? "Could not reach the backend. Is it running at localhost:8000?"
          : err.message
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    setSummaryError("");
    setSummary(null);
    setSummaryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cases/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: caseTitle, text: caseText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Summarization failed");
      setSummary({ ...data, parsed: JSON.parse(data.summary_json) });
    } catch (err) {
      setSummaryError(
        err.message === "Failed to fetch"
          ? "Could not reach the backend. Is it running at localhost:8000?"
          : err.message
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const logout = () => setToken("");

  return (
    <div className={`ld-root ld-theme-${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .ld-root {
          --bg: #050505; --surface: #0a0a0d; --card: #121212; --card-border: rgba(255,255,255,0.08);
          --text: #f5f6fa; --text-muted: #9a9db3;
          --royal: #2547F4; --purple: #7B3FE4; --cyan: #22D3EE;
          --grad: linear-gradient(120deg, var(--royal), var(--purple) 55%, var(--cyan));
          --good: #34d399; --bad: #f87171;
          font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--text);
          min-height: 100vh; transition: background 0.4s, color 0.4s;
        }
        .ld-root.ld-theme-light {
          --bg: #f7f7fa; --surface: #ffffff; --card: #ffffff; --card-border: rgba(10,10,25,0.08);
          --text: #0c0c14; --text-muted: #5b5f76;
        }
        .ld-root * { box-sizing: border-box; }
        .ld-mono { font-family: 'IBM Plex Mono', monospace; }

        .ld-topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 26px; border-bottom: 1px solid var(--card-border); }
        .ld-logo { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 15.5px; }
        .ld-logo-mark { width: 26px; height: 26px; border-radius: 7px; background: var(--grad); display: flex; align-items: center; justify-content: center; }
        .ld-live-pill { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: var(--cyan); background: rgba(34,211,238,0.08); border: 1px solid rgba(34,211,238,0.25); padding: 4px 10px; border-radius: 100px; margin-left: 14px; }
        .ld-icon-btn { width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--card-border); background: var(--card); display: flex; align-items: center; justify-content: center; color: var(--text); cursor: pointer; }

        .ld-wrap { max-width: 640px; margin: 0 auto; padding: 50px 24px; }
        .ld-card { background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; padding: 28px; }
        .ld-h1 { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 500; margin: 0 0 6px; }
        .ld-sub { color: var(--text-muted); font-size: 13.5px; margin-bottom: 24px; }

        .ld-tabs { display: flex; gap: 8px; margin-bottom: 22px; }
        .ld-tab { flex: 1; text-align: center; padding: 9px; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer; background: var(--surface); color: var(--text-muted); border: 1px solid var(--card-border); }
        .ld-tab.ld-tab-active { background: var(--grad); color: white; border: none; }

        .ld-field { margin-bottom: 14px; }
        .ld-field label { font-size: 12.5px; color: var(--text-muted); margin-bottom: 6px; display: block; }
        .ld-field input, .ld-field textarea { width: 100%; background: var(--surface); border: 1px solid var(--card-border); border-radius: 9px; padding: 10px 12px; color: var(--text); font-family: 'Manrope', sans-serif; font-size: 14px; outline: none; }
        .ld-field input:focus, .ld-field textarea:focus { border-color: var(--cyan); }
        .ld-field textarea { resize: vertical; min-height: 120px; }

        .ld-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; font-size: 14px; padding: 12px; border-radius: 10px; border: none; background: var(--grad); color: white; cursor: pointer; }
        .ld-btn:disabled { opacity: 0.6; cursor: default; }

        .ld-error { display: flex; gap: 8px; align-items: flex-start; background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.25); color: var(--bad); border-radius: 9px; padding: 10px 12px; font-size: 12.5px; margin-bottom: 14px; line-height: 1.5; }

        .ld-userbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .ld-userbar-token { font-size: 11.5px; color: var(--text-muted); }

        .ld-summary-block { margin-top: 24px; }
        .ld-summary-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--purple); font-family: 'IBM Plex Mono', monospace; margin: 18px 0 8px; }
        .ld-summary-title:first-child { margin-top: 0; }
        .ld-summary-text { font-size: 13.5px; line-height: 1.65; color: var(--text); }
        .ld-summary-list { margin: 0; padding-left: 18px; font-size: 13.5px; line-height: 1.7; color: var(--text-muted); }
        .ld-confidence { display: inline-flex; align-items: center; gap: 6px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; padding: 5px 12px; border-radius: 100px; background: rgba(34,211,238,0.1); color: var(--cyan); }
      `}</style>

      <div className="ld-topbar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="ld-logo">
            <div className="ld-logo-mark"><Scale size={14} color="#fff" /></div>
            JustiMind
          </div>
          <span className="ld-live-pill">LIVE BACKEND DEMO</span>
        </div>
        <button className="ld-icon-btn" onClick={toggleTheme}>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button>
      </div>

      <div className="ld-wrap">
        {!token && (
          <div className="ld-card">
            <h1 className="ld-h1">{mode === "login" ? "Sign in" : "Create an account"}</h1>
            <p className="ld-sub">Calls your real FastAPI backend at <span className="ld-mono">localhost:8000</span> — real password hashing, real JWT.</p>

            <div className="ld-tabs">
              <div className={`ld-tab ${mode === "login" ? "ld-tab-active" : ""}`} onClick={() => setMode("login")}>Sign in</div>
              <div className={`ld-tab ${mode === "signup" ? "ld-tab-active" : ""}`} onClick={() => setMode("signup")}>Sign up</div>
            </div>

            {authError && <div className="ld-error"><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{authError}</div>}

            <form onSubmit={handleAuth}>
              {mode === "signup" && (
                <div className="ld-field">
                  <label>Full name</label>
                  <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                </div>
              )}
              <div className="ld-field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="ld-field">
                <label>Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
              </div>
              <button className="ld-btn" disabled={authLoading}>
                {authLoading && <Loader2 size={15} className="ld-spin" />}
                {mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>
          </div>
        )}

        {token && (
          <div className="ld-card">
            <div className="ld-userbar">
              <div>
                <h1 className="ld-h1" style={{ marginBottom: 2 }}>Case Summarizer</h1>
                <div className="ld-userbar-token">Authenticated — real JWT stored</div>
              </div>
              <button className="ld-icon-btn" onClick={logout}><LogOut size={15} /></button>
            </div>

            {summaryError && <div className="ld-error"><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{summaryError}</div>}

            <form onSubmit={handleSummarize}>
              <div className="ld-field">
                <label>Case title</label>
                <input value={caseTitle} onChange={(e) => setCaseTitle(e.target.value)} required placeholder="e.g. Ferreira v. State" />
              </div>
              <div className="ld-field">
                <label>Case text (facts, filing, correspondence…)</label>
                <textarea value={caseText} onChange={(e) => setCaseText(e.target.value)} required placeholder="Paste the case text here — this gets sent to a real LLM via your backend." />
              </div>
              <button className="ld-btn" disabled={summaryLoading}>
                {summaryLoading ? <><Loader2 size={15} className="ld-spin" /> Analyzing with LLM…</> : <><FileText size={15} /> Summarize case</>}
              </button>
            </form>

            {summary && (
              <div className="ld-summary-block">
                <div className="ld-confidence">Confidence: {summary.confidence ?? "—"}%</div>

                <div className="ld-summary-title">Executive summary</div>
                <p className="ld-summary-text">{summary.parsed.executive_summary}</p>

                {summary.parsed.facts?.length > 0 && (
                  <>
                    <div className="ld-summary-title">Facts</div>
                    <ul className="ld-summary-list">{summary.parsed.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </>
                )}

                {summary.parsed.issues?.length > 0 && (
                  <>
                    <div className="ld-summary-title">Issues</div>
                    <ul className="ld-summary-list">{summary.parsed.issues.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </>
                )}

                {summary.parsed.recommendations?.length > 0 && (
                  <>
                    <div className="ld-summary-title">Recommendations</div>
                    <ul className="ld-summary-list">{summary.parsed.recommendations.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
