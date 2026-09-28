import React, { useState } from "react";
import {
  Scale, Sun, Moon, Download, FileText, AlertTriangle, AlertOctagon,
  Copy, GitMerge, ShieldAlert, ShieldCheck, Sparkles, CheckCircle2,
  XCircle, ArrowRight, File
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  JustiMind — Document Analyzer                                     */
/*  Same token system as the rest of the product.                     */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: "clauses", label: "Clause findings" },
  { id: "compliance", label: "Compliance" },
  { id: "draft", label: "Improved draft" },
];

const CLAUSE_FINDINGS = [
  {
    type: "missing", label: "Missing clause", icon: AlertOctagon, tone: "bad",
    title: "No limitation-of-liability clause",
    detail: "The agreement has no cap on damages, exposing either party to unbounded liability in a breach scenario.",
  },
  {
    type: "risky", label: "Risky clause", icon: AlertTriangle, tone: "warn",
    title: "Clause 7 — termination notice",
    detail: "30-day notice period is shorter than the 60-day standard for contracts of this value, weakening the terminating party's position if challenged.",
  },
  {
    type: "conflict", label: "Conflict", icon: GitMerge, tone: "warn",
    title: "Clause 4 vs. Clause 12",
    detail: "Clause 4 assigns exclusive jurisdiction to state courts; Clause 12 references arbitration for the same disputes. These directly conflict.",
  },
  {
    type: "duplicate", label: "Duplicate content", icon: Copy, tone: "muted",
    title: "Confidentiality obligations repeated",
    detail: "Sections 9.2 and 14.1 restate the same confidentiality terms with slightly different wording — consolidate to avoid interpretation disputes.",
  },
  {
    type: "weak", label: "Weak evidence support", icon: ShieldAlert, tone: "bad",
    title: "Indemnification clause (Clause 15)",
    detail: "References an exhibit that is not attached to the filed copy — this clause is currently unenforceable as drafted.",
  },
];

const COMPLIANCE = [
  { name: "GDPR", status: "gap", note: "No data retention period specified for personal data collected under Clause 6." },
  { name: "DPDP", status: "pass", note: "Consent language meets current requirements." },
  { name: "HIPAA", status: "not-applicable", note: "No health information processing identified in this document." },
  { name: "ISO 27001", status: "gap", note: "No reference to an information security management framework." },
  { name: "Cyber Laws", status: "pass", note: "Breach notification clause present and meets the 72-hour standard." },
];

const DRAFT_DIFFS = [
  {
    clause: "Clause 7 — Termination",
    before: "Either party may terminate this Agreement with thirty (30) days' written notice.",
    after: "Either party may terminate this Agreement with sixty (60) days' written notice, delivered in accordance with Clause 18.",
  },
  {
    clause: "New — Limitation of Liability",
    before: "— not present in original —",
    after: "Neither party's aggregate liability under this Agreement shall exceed the total fees paid in the twelve (12) months preceding the claim.",
  },
];

function statusMeta(status) {
  if (status === "pass") return { label: "Compliant", tone: "good", Icon: CheckCircle2 };
  if (status === "gap") return { label: "Gap found", tone: "bad", Icon: XCircle };
  return { label: "Not applicable", tone: "muted", Icon: ShieldCheck };
}

export default function JustiMindAnalyzer() {
  const [theme, setTheme] = useState("dark");
  const [tab, setTab] = useState("clauses");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className={`da-root da-theme-${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .da-root {
          --bg: #050505; --surface: #0a0a0d; --card: #121212; --card-border: rgba(255,255,255,0.08);
          --text: #f5f6fa; --text-muted: #9a9db3;
          --royal: #2547F4; --purple: #7B3FE4; --cyan: #22D3EE; --neon: #4F8CFF;
          --grad: linear-gradient(120deg, var(--royal), var(--purple) 55%, var(--cyan));
          --good: #34d399; --warn: #fbbf24; --bad: #f87171;
          font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--text);
          min-height: 100vh; transition: background 0.4s, color 0.4s;
        }
        .da-root.da-theme-light {
          --bg: #f7f7fa; --surface: #ffffff; --card: #ffffff; --card-border: rgba(10,10,25,0.08);
          --text: #0c0c14; --text-muted: #5b5f76;
        }
        .da-root * { box-sizing: border-box; }
        .da-mono { font-family: 'IBM Plex Mono', monospace; }

        .da-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 26px; border-bottom: 1px solid var(--card-border);
          position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 75%, transparent);
          backdrop-filter: blur(14px); z-index: 10;
        }
        .da-logo { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 15.5px; }
        .da-logo-mark { width: 26px; height: 26px; border-radius: 7px; background: var(--grad); display: flex; align-items: center; justify-content: center; }
        .da-doc-title { font-size: 13.5px; color: var(--text-muted); margin-left: 18px; padding-left: 18px; border-left: 1px solid var(--card-border); }
        .da-actions { display: flex; align-items: center; gap: 10px; }
        .da-icon-btn { width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--card-border); background: var(--card); display: flex; align-items: center; justify-content: center; color: var(--text); cursor: pointer; }
        .da-icon-btn:hover { border-color: var(--neon); }
        .da-btn { display: inline-flex; align-items: center; gap: 7px; font-weight: 700; font-size: 13px; padding: 9px 15px; border-radius: 9px; border: 1px solid var(--card-border); background: var(--card); color: var(--text); cursor: pointer; }
        .da-btn--primary { background: var(--grad); border: none; color: white; }

        .da-header { padding: 28px 26px 4px; display: flex; align-items: flex-start; justify-content: space-between; }
        .da-kicker { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.07em; color: var(--purple); text-transform: uppercase; }
        .da-h1 { font-family: 'Fraunces', serif; font-weight: 500; font-size: 29px; margin: 8px 0 4px; }
        .da-sub { color: var(--text-muted); font-size: 14px; }

        .da-risk-badge { text-align: center; background: var(--card); border: 1px solid var(--card-border); border-radius: 14px; padding: 14px 20px; }
        .da-risk-num { font-family: 'IBM Plex Mono', monospace; font-size: 26px; color: var(--warn); }
        .da-risk-lbl { font-size: 10.5px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

        .da-summary-row { display: flex; gap: 14px; padding: 22px 26px 0; }
        .da-summary-chip { flex: 1; background: var(--card); border: 1px solid var(--card-border); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
        .da-summary-num { font-family: 'IBM Plex Mono', monospace; font-size: 20px; font-weight: 500; }
        .da-summary-lbl { font-size: 11.5px; color: var(--text-muted); }

        .da-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--card-border); margin: 22px 26px 0; }
        .da-tab { padding: 10px 16px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; }
        .da-tab.da-tab-active { color: var(--text); border-bottom-color: var(--cyan); }

        .da-content { padding: 22px 26px 60px; }

        .da-finding { background: var(--card); border: 1px solid var(--card-border); border-radius: 14px; padding: 18px; margin-bottom: 14px; display: flex; gap: 14px; }
        .da-finding-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .da-tone-bad .da-finding-icon { background: rgba(248,113,113,0.12); color: var(--bad); }
        .da-tone-warn .da-finding-icon { background: rgba(251,191,36,0.12); color: var(--warn); }
        .da-tone-muted .da-finding-icon { background: rgba(154,157,179,0.12); color: var(--text-muted); }
        .da-finding-tag { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; display: block; }
        .da-tone-bad .da-finding-tag { color: var(--bad); }
        .da-tone-warn .da-finding-tag { color: var(--warn); }
        .da-tone-muted .da-finding-tag { color: var(--text-muted); }
        .da-finding-title { font-size: 14.5px; font-weight: 700; margin-bottom: 5px; }
        .da-finding-detail { font-size: 13.5px; color: var(--text-muted); line-height: 1.6; }

        .da-compliance-row { display: flex; align-items: flex-start; gap: 14px; background: var(--card); border: 1px solid var(--card-border); border-radius: 14px; padding: 16px 18px; margin-bottom: 12px; }
        .da-compliance-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .da-compliance-name { font-size: 14px; font-weight: 700; }
        .da-compliance-note { font-size: 13px; color: var(--text-muted); margin-top: 3px; line-height: 1.55; }
        .da-status-pill { margin-left: auto; font-family: 'IBM Plex Mono', monospace; font-size: 11px; padding: 4px 10px; border-radius: 100px; white-space: nowrap; flex-shrink: 0; }
        .da-status-good { background: rgba(52,211,153,0.12); color: var(--good); }
        .da-status-bad { background: rgba(248,113,113,0.12); color: var(--bad); }
        .da-status-muted { background: rgba(154,157,179,0.12); color: var(--text-muted); }

        .da-diff-card { background: var(--card); border: 1px solid var(--card-border); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
        .da-diff-title { font-size: 13.5px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .da-diff-block { border-radius: 10px; padding: 12px 14px; font-size: 13px; line-height: 1.6; margin-bottom: 10px; }
        .da-diff-before { background: rgba(248,113,113,0.06); border: 1px solid rgba(248,113,113,0.2); color: var(--text-muted); }
        .da-diff-after { background: rgba(52,211,153,0.06); border: 1px solid rgba(52,211,153,0.2); color: var(--text); }
        .da-diff-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px; display: block; }

        @media (max-width: 760px) {
          .da-summary-row { flex-wrap: wrap; }
          .da-doc-title { display: none; }
          .da-header { flex-direction: column; gap: 14px; }
        }
      `}</style>

      {/* ---------------- Top bar ---------------- */}
      <div className="da-topbar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="da-logo">
            <div className="da-logo-mark"><Scale size={14} color="#fff" /></div>
            JustiMind
          </div>
          <span className="da-doc-title"><File size={12} style={{ verticalAlign: -1, marginRight: 4 }} />Service_Agreement_v3.pdf</span>
        </div>
        <div className="da-actions">
          <button className="da-icon-btn" onClick={toggleTheme}>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button>
          <button className="da-btn"><FileText size={14} /> Export DOCX</button>
          <button className="da-btn da-btn--primary"><Download size={14} /> Export PDF</button>
        </div>
      </div>

      {/* ---------------- Header ---------------- */}
      <div className="da-header">
        <div>
          <span className="da-kicker">Document Analyzer</span>
          <h1 className="da-h1">Service_Agreement_v3.pdf</h1>
          <p className="da-sub">14 pages · analyzed against 5 finding categories and 5 compliance frameworks</p>
        </div>
        <div className="da-risk-badge">
          <div className="da-risk-num da-mono">Moderate</div>
          <div className="da-risk-lbl">Overall risk</div>
        </div>
      </div>

      {/* ---------------- Summary row ---------------- */}
      <div className="da-summary-row">
        <div className="da-summary-chip">
          <AlertOctagon size={18} color="var(--bad)" />
          <div><div className="da-summary-num da-mono">2</div><div className="da-summary-lbl">High-risk findings</div></div>
        </div>
        <div className="da-summary-chip">
          <AlertTriangle size={18} color="var(--warn)" />
          <div><div className="da-summary-num da-mono">2</div><div className="da-summary-lbl">Medium-risk findings</div></div>
        </div>
        <div className="da-summary-chip">
          <ShieldCheck size={18} color="var(--good)" />
          <div><div className="da-summary-num da-mono">2/5</div><div className="da-summary-lbl">Compliance frameworks passed</div></div>
        </div>
      </div>

      {/* ---------------- Tabs ---------------- */}
      <div className="da-tabs">
        {TABS.map((t) => (
          <div key={t.id} className={`da-tab ${tab === t.id ? "da-tab-active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      <div className="da-content">
        {tab === "clauses" && CLAUSE_FINDINGS.map((f) => (
          <div className={`da-finding da-tone-${f.tone}`} key={f.title}>
            <div className="da-finding-icon"><f.icon size={17} /></div>
            <div>
              <span className="da-finding-tag">{f.label}</span>
              <div className="da-finding-title">{f.title}</div>
              <div className="da-finding-detail">{f.detail}</div>
            </div>
          </div>
        ))}

        {tab === "compliance" && COMPLIANCE.map((c) => {
          const meta = statusMeta(c.status);
          return (
            <div className="da-compliance-row" key={c.name}>
              <div className="da-compliance-icon" style={{ background: meta.tone === "good" ? "rgba(52,211,153,0.12)" : meta.tone === "bad" ? "rgba(248,113,113,0.12)" : "rgba(154,157,179,0.12)", color: meta.tone === "good" ? "var(--good)" : meta.tone === "bad" ? "var(--bad)" : "var(--text-muted)" }}>
                <meta.Icon size={16} />
              </div>
              <div>
                <div className="da-compliance-name">{c.name}</div>
                <div className="da-compliance-note">{c.note}</div>
              </div>
              <span className={`da-status-pill da-status-${meta.tone}`}>{meta.label}</span>
            </div>
          );
        })}

        {tab === "draft" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <Sparkles size={16} color="var(--cyan)" />
              <span style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Suggested redlines based on the findings above — review before sending to the counterparty.</span>
            </div>
            {DRAFT_DIFFS.map((d) => (
              <div className="da-diff-card" key={d.clause}>
                <div className="da-diff-title"><ArrowRight size={14} color="var(--cyan)" />{d.clause}</div>
                <span className="da-diff-label" style={{ color: "var(--bad)" }}>Original</span>
                <div className="da-diff-block da-diff-before">{d.before}</div>
                <span className="da-diff-label" style={{ color: "var(--good)" }}>Suggested</span>
                <div className="da-diff-block da-diff-after">{d.after}</div>
              </div>
            ))}
            <button className="da-btn da-btn--primary" style={{ marginTop: 4 }}><Download size={14} /> Export improved draft</button>
          </>
        )}
      </div>
    </div>
  );
}
