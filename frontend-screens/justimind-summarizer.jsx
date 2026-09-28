import React, { useState } from "react";
import {
  Scale, Sun, Moon, Download, FileText, Upload, CheckCircle2, XCircle,
  Clock, Gavel, AlertTriangle, ShieldCheck, ListChecks, Scale3d,
  FileSearch, BookOpen, Sparkles, File
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  JustiMind — Case Summarizer                                       */
/*  Same token system as the rest of the product.                     */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: "overview", label: "Executive summary" },
  { id: "facts", label: "Facts & issues" },
  { id: "evidence", label: "Evidence" },
  { id: "timeline", label: "Timeline" },
  { id: "judgment", label: "Judgment" },
  { id: "risk", label: "Risk & recommendations" },
];

const FACTS = [
  "Plaintiff entered a service agreement with the defendant on March 3, 2024.",
  "Defendant terminated the agreement without the 30-day notice specified in Clause 7.",
  "Plaintiff claims $142,000 in lost revenue as a direct result of early termination.",
  "Defendant asserts the agreement was void due to a prior breach by the plaintiff.",
];

const ISSUES = [
  "Whether the 30-day notice clause was enforceable given the alleged prior breach.",
  "Whether the plaintiff's claimed damages are reasonably foreseeable under the contract.",
  "Whether the defendant's prior-breach claim is supported by contemporaneous evidence.",
];

const EVIDENCE = [
  { name: "Signed service agreement (Exhibit A)", strength: 92 },
  { name: "Email correspondence re: termination (Exhibit B)", strength: 78 },
  { name: "Chain-of-custody log (Exhibit C)", strength: 41 },
  { name: "Witness statement — operations manager", strength: 66 },
];

const TIMELINE = [
  { date: "Mar 3, 2024", label: "Service agreement signed" },
  { date: "Nov 12, 2024", label: "Defendant issues termination notice" },
  { date: "Nov 14, 2024", label: "Plaintiff disputes notice period" },
  { date: "Jan 8, 2025", label: "Complaint filed in District Court" },
  { date: "Jul 14, 2026", label: "Next hearing scheduled" },
];

const PROS = ["Clear written contract with an explicit notice clause", "Consistent documentary trail across both parties"];
const CONS = ["Chain-of-custody gap weakens Exhibit C", "Defendant's prior-breach claim is not yet fully rebutted"];

const RECOMMENDATIONS = [
  "Request the original chain-of-custody log for Exhibit C before the July 14 hearing.",
  "Depose the operations manager to lock in testimony ahead of trial.",
  "Consider a structured settlement offer given the defendant's recent settlement pattern.",
];

function Section({ title, icon: Icon, children }) {
  return (
    <div className="cs-card">
      <div className="cs-card-head">
        <Icon size={15} />
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function JustiMindSummarizer() {
  const [theme, setTheme] = useState("dark");
  const [tab, setTab] = useState("overview");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className={`cs-root cs-theme-${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .cs-root {
          --bg: #050505; --surface: #0a0a0d; --card: #121212; --card-border: rgba(255,255,255,0.08);
          --text: #f5f6fa; --text-muted: #9a9db3;
          --royal: #2547F4; --purple: #7B3FE4; --cyan: #22D3EE; --neon: #4F8CFF;
          --grad: linear-gradient(120deg, var(--royal), var(--purple) 55%, var(--cyan));
          --good: #34d399; --warn: #fbbf24; --bad: #f87171;
          font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--text);
          min-height: 100vh; transition: background 0.4s, color 0.4s;
        }
        .cs-root.cs-theme-light {
          --bg: #f7f7fa; --surface: #ffffff; --card: #ffffff; --card-border: rgba(10,10,25,0.08);
          --text: #0c0c14; --text-muted: #5b5f76;
        }
        .cs-root * { box-sizing: border-box; }
        .cs-mono { font-family: 'IBM Plex Mono', monospace; }

        .cs-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 26px; border-bottom: 1px solid var(--card-border);
          position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 75%, transparent);
          backdrop-filter: blur(14px); z-index: 10;
        }
        .cs-logo { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 15.5px; }
        .cs-logo-mark { width: 26px; height: 26px; border-radius: 7px; background: var(--grad); display: flex; align-items: center; justify-content: center; }
        .cs-case-title { font-size: 13.5px; color: var(--text-muted); margin-left: 18px; padding-left: 18px; border-left: 1px solid var(--card-border); }
        .cs-actions { display: flex; align-items: center; gap: 10px; }
        .cs-icon-btn { width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--card-border); background: var(--card); display: flex; align-items: center; justify-content: center; color: var(--text); cursor: pointer; }
        .cs-icon-btn:hover { border-color: var(--neon); }
        .cs-btn { display: inline-flex; align-items: center; gap: 7px; font-weight: 700; font-size: 13px; padding: 9px 15px; border-radius: 9px; border: 1px solid var(--card-border); background: var(--card); color: var(--text); cursor: pointer; }
        .cs-btn--primary { background: var(--grad); border: none; color: white; }

        .cs-layout { display: grid; grid-template-columns: 300px 1fr; gap: 0; min-height: calc(100vh - 65px); }

        /* Left: document panel */
        .cs-doc-panel { border-right: 1px solid var(--card-border); padding: 22px; background: var(--surface); }
        .cs-dropzone {
          border: 1.5px dashed var(--card-border); border-radius: 14px; padding: 22px 16px;
          text-align: center; margin-bottom: 20px; color: var(--text-muted); font-size: 12.5px;
        }
        .cs-dropzone svg { margin-bottom: 8px; color: var(--neon); }
        .cs-doc-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; background: var(--card); border: 1px solid var(--card-border); margin-bottom: 8px; font-size: 12.5px; }
        .cs-doc-icon { width: 30px; height: 30px; border-radius: 8px; background: rgba(37,71,244,0.12); display: flex; align-items: center; justify-content: center; color: var(--cyan); flex-shrink: 0; }
        .cs-doc-meta { color: var(--text-muted); font-size: 11px; }
        .cs-panel-label { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin: 22px 0 10px; }
        .cs-panel-label:first-of-type { margin-top: 0; }

        .cs-confidence-card { background: var(--card); border: 1px solid var(--card-border); border-radius: 14px; padding: 18px; text-align: center; }
        .cs-confidence-num { font-family: 'IBM Plex Mono', monospace; font-size: 30px; color: var(--cyan); }
        .cs-confidence-lbl { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

        /* Right: content */
        .cs-content { padding: 26px 32px 60px; }
        .cs-header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
        .cs-kicker { font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; letter-spacing: 0.06em; color: var(--purple); text-transform: uppercase; }
        .cs-h1 { font-family: 'Fraunces', serif; font-weight: 500; font-size: 27px; margin: 6px 0 4px; }
        .cs-sub { color: var(--text-muted); font-size: 13.5px; }

        .cs-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--card-border); margin-bottom: 24px; overflow-x: auto; }
        .cs-tab { padding: 10px 16px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; }
        .cs-tab.cs-tab-active { color: var(--text); border-bottom-color: var(--cyan); }

        .cs-card { background: var(--card); border: 1px solid var(--card-border); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
        .cs-card-head { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; margin-bottom: 14px; color: var(--text); }
        .cs-card-head svg { color: var(--cyan); }

        .cs-list { list-style: none; margin: 0; padding: 0; }
        .cs-list li { display: flex; gap: 10px; font-size: 14px; line-height: 1.6; color: var(--text-muted); padding: 8px 0; border-bottom: 1px solid var(--card-border); }
        .cs-list li:last-child { border-bottom: none; }
        .cs-list-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--cyan); margin-top: 9px; flex-shrink: 0; }

        .cs-evidence-row { padding: 12px 0; border-bottom: 1px solid var(--card-border); }
        .cs-evidence-row:last-child { border-bottom: none; }
        .cs-evidence-top { display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 6px; }
        .cs-evidence-track { height: 6px; border-radius: 4px; background: var(--card-border); overflow: hidden; }
        .cs-evidence-fill { height: 100%; border-radius: 4px; }

        .cs-timeline { position: relative; padding-left: 22px; }
        .cs-timeline::before { content: ''; position: absolute; left: 5px; top: 6px; bottom: 6px; width: 2px; background: var(--card-border); }
        .cs-tl-item { position: relative; padding-bottom: 22px; }
        .cs-tl-item:last-child { padding-bottom: 0; }
        .cs-tl-dot { position: absolute; left: -22px; top: 3px; width: 12px; height: 12px; border-radius: 50%; background: var(--grad); border: 2px solid var(--card); }
        .cs-tl-date { font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; color: var(--cyan); margin-bottom: 3px; }
        .cs-tl-label { font-size: 13.5px; color: var(--text); }

        .cs-verdict-card { background: linear-gradient(135deg, rgba(37,71,244,0.12), rgba(123,63,228,0.12)); border: 1px solid var(--card-border); border-radius: 14px; padding: 22px; margin-bottom: 16px; }
        .cs-verdict-badge { display: inline-flex; align-items: center; gap: 6px; font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; padding: 5px 12px; border-radius: 100px; background: rgba(52,211,153,0.15); color: var(--good); margin-bottom: 12px; }
        .cs-verdict-text { font-size: 14.5px; line-height: 1.65; color: var(--text); }

        .cs-proscons { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .cs-pc-head { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; margin-bottom: 10px; }
        .cs-pc-item { display: flex; gap: 8px; font-size: 13.5px; color: var(--text-muted); padding: 6px 0; line-height: 1.5; }

        @media (max-width: 860px) {
          .cs-layout { grid-template-columns: 1fr; }
          .cs-doc-panel { border-right: none; border-bottom: 1px solid var(--card-border); }
          .cs-proscons { grid-template-columns: 1fr; }
          .cs-case-title { display: none; }
        }
      `}</style>

      {/* ---------------- Top bar ---------------- */}
      <div className="cs-topbar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="cs-logo">
            <div className="cs-logo-mark"><Scale size={14} color="#fff" /></div>
            JustiMind
          </div>
          <span className="cs-case-title">Case Summarizer · Meridian Corp. v. Halbrook</span>
        </div>
        <div className="cs-actions">
          <button className="cs-icon-btn" onClick={toggleTheme}>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button>
          <button className="cs-btn"><FileText size={14} /> Export DOCX</button>
          <button className="cs-btn cs-btn--primary"><Download size={14} /> Export PDF</button>
        </div>
      </div>

      <div className="cs-layout">
        {/* ---------------- Left: documents ---------------- */}
        <aside className="cs-doc-panel">
          <div className="cs-dropzone">
            <Upload size={20} />
            <div>Drop a PDF, DOCX, or scanned image — OCR runs automatically.</div>
          </div>

          <div className="cs-panel-label">Source documents</div>
          <div className="cs-doc-item">
            <div className="cs-doc-icon"><File size={14} /></div>
            <div style={{ flex: 1 }}>
              <div>Service_Agreement.pdf</div>
              <div className="cs-doc-meta">14 pages · parsed</div>
            </div>
          </div>
          <div className="cs-doc-item">
            <div className="cs-doc-icon"><File size={14} /></div>
            <div style={{ flex: 1 }}>
              <div>Termination_Notice_Emails.pdf</div>
              <div className="cs-doc-meta">6 pages · OCR complete</div>
            </div>
          </div>
          <div className="cs-doc-item">
            <div className="cs-doc-icon"><File size={14} /></div>
            <div style={{ flex: 1 }}>
              <div>Witness_Statement.docx</div>
              <div className="cs-doc-meta">3 pages · parsed</div>
            </div>
          </div>

          <div className="cs-panel-label">Confidence score</div>
          <div className="cs-confidence-card">
            <div className="cs-confidence-num cs-mono">87%</div>
            <div className="cs-confidence-lbl">SUMMARY CONFIDENCE</div>
          </div>
        </aside>

        {/* ---------------- Right: content ---------------- */}
        <main className="cs-content">
          <div className="cs-header-row">
            <div>
              <span className="cs-kicker">Case Summarizer</span>
              <h1 className="cs-h1">Meridian Corp. v. Halbrook</h1>
              <p className="cs-sub">Contract dispute · Filed District Court · 3 source documents, 23 pages</p>
            </div>
          </div>

          <div className="cs-tabs">
            {TABS.map((t) => (
              <div key={t.id} className={`cs-tab ${tab === t.id ? "cs-tab-active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </div>
            ))}
          </div>

          {tab === "overview" && (
            <>
              <Section title="Executive summary" icon={Sparkles}>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: "var(--text)" }}>
                  The plaintiff alleges the defendant breached a service agreement by terminating it without the contractually
                  required 30-day notice, seeking $142,000 in lost revenue. The defendant counters that a prior breach by the
                  plaintiff voided the notice obligation. Documentary evidence favors the plaintiff on the notice question,
                  though a gap in the chain-of-custody record for one exhibit introduces moderate risk.
                </p>
              </Section>
              <Section title="Applicable laws" icon={BookOpen}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Contract Act, Sec. 73 (damages)", "Evidence Act, Sec. 45", "Commercial Courts Act"].map((a) => (
                    <span key={a} className="cs-mono" style={{ fontSize: 11.5, padding: "6px 12px", borderRadius: 100, background: "var(--surface)", border: "1px solid var(--card-border)", color: "var(--text-muted)" }}>{a}</span>
                  ))}
                </div>
              </Section>
            </>
          )}

          {tab === "facts" && (
            <>
              <Section title="Facts" icon={ListChecks}>
                <ul className="cs-list">
                  {FACTS.map((f) => <li key={f}><span className="cs-list-dot" />{f}</li>)}
                </ul>
              </Section>
              <Section title="Issues" icon={AlertTriangle}>
                <ul className="cs-list">
                  {ISSUES.map((f) => <li key={f}><span className="cs-list-dot" />{f}</li>)}
                </ul>
              </Section>
            </>
          )}

          {tab === "evidence" && (
            <Section title="Evidence strength" icon={FileSearch}>
              {EVIDENCE.map((e) => (
                <div className="cs-evidence-row" key={e.name}>
                  <div className="cs-evidence-top">
                    <span>{e.name}</span>
                    <span className="cs-mono" style={{ color: "var(--text-muted)" }}>{e.strength}%</span>
                  </div>
                  <div className="cs-evidence-track">
                    <div className="cs-evidence-fill" style={{ width: `${e.strength}%`, background: e.strength > 70 ? "linear-gradient(90deg, var(--royal), var(--cyan))" : "linear-gradient(90deg, var(--purple), var(--warn))" }} />
                  </div>
                </div>
              ))}
            </Section>
          )}

          {tab === "timeline" && (
            <Section title="Case timeline" icon={Clock}>
              <div className="cs-timeline">
                {TIMELINE.map((t) => (
                  <div className="cs-tl-item" key={t.date}>
                    <span className="cs-tl-dot" />
                    <div className="cs-tl-date">{t.date}</div>
                    <div className="cs-tl-label">{t.label}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {tab === "judgment" && (
            <>
              <div className="cs-verdict-card">
                <div className="cs-verdict-badge"><ShieldCheck size={13} /> Predicted favorable — 78% confidence</div>
                <p className="cs-verdict-text" style={{ margin: 0 }}>
                  On the documentary record, the notice clause is likely enforceable and the defendant's prior-breach
                  defense is not yet substantiated. A ruling for the plaintiff on the notice question is the most probable
                  outcome, with damages likely assessed below the full claimed amount.
                </p>
              </div>
              <Section title="Pros & cons" icon={Gavel}>
                <div className="cs-proscons">
                  <div>
                    <div className="cs-pc-head" style={{ color: "var(--good)" }}><CheckCircle2 size={15} /> Pros</div>
                    {PROS.map((p) => <div className="cs-pc-item" key={p}>{p}</div>)}
                  </div>
                  <div>
                    <div className="cs-pc-head" style={{ color: "var(--bad)" }}><XCircle size={15} /> Cons</div>
                    {CONS.map((p) => <div className="cs-pc-item" key={p}>{p}</div>)}
                  </div>
                </div>
              </Section>
            </>
          )}

          {tab === "risk" && (
            <>
              <Section title="Risk analysis" icon={AlertTriangle}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "var(--text-muted)" }}>
                  Overall risk is moderate. The primary exposure is the chain-of-custody gap on Exhibit C, which opposing
                  counsel could use to challenge admissibility. This is offset by a strong documentary trail on the
                  core notice-clause question.
                </p>
              </Section>
              <Section title="Recommendations" icon={Sparkles}>
                <ul className="cs-list">
                  {RECOMMENDATIONS.map((r) => <li key={r}><span className="cs-list-dot" />{r}</li>)}
                </ul>
              </Section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
