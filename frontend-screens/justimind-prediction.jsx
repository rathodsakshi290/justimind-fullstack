import React, { useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip,
} from "recharts";
import {
  Scale, Sun, Moon, Download, FileText, TrendingUp, TrendingDown, Minus,
  AlertTriangle, ShieldCheck, Sparkles, Gavel, Clock, DollarSign,
  CheckCircle2, XCircle, ArrowRight, Users, BookOpen
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  JustiMind — Prediction Engine results screen                      */
/*  Same token system as the rest of the product.                     */
/* ------------------------------------------------------------------ */

const PROB_DATA = [
  { name: "Win", value: 78, color: "#22D3EE" },
  { name: "Settlement", value: 15, color: "#7B3FE4" },
  { name: "Loss", value: 7, color: "#3a3a44" },
];

const CONFIDENCE_TREND = [
  { stage: "Filing", confidence: 52 },
  { stage: "Discovery", confidence: 61 },
  { stage: "Depositions", confidence: 69 },
  { stage: "Pre-trial", confidence: 74 },
  { stage: "Now", confidence: 78 },
];

const REASONING_CHAIN = [
  { step: "Extracted 4 exhibits and cross-checked timeline consistency against the police report.", weight: "Facts" },
  { step: "Matched fact pattern against 214 precedent cases in the same jurisdiction and evidence class.", weight: "Precedent" },
  { step: "Flagged Exhibit C (chain of custody) as the single weakest evidentiary link.", weight: "Risk" },
  { step: "Weighed judge's historical ruling pattern on similar evidence-strength cases (62% plaintiff-favorable).", weight: "Judge pattern" },
  { step: "Combined signals into a calibrated win/settlement/loss distribution.", weight: "Synthesis" },
];

const SWOT = {
  weaknesses: ["Chain-of-custody gap on Exhibit C", "One witness statement contradicts the timeline by 40 minutes"],
  opportunities: ["Precedent trend has shifted favorably in the last 18 months", "Opposing counsel has settled 3 of last 4 similar cases"],
  threats: ["Judge has ruled against similar plaintiffs twice this year", "Statute of limitations question raised by opposing brief"],
};

const TOP_ARGUMENTS = {
  for: ["Documented timeline is corroborated by 2 independent witnesses", "Precedent in Ferreira (2023) closely mirrors these facts"],
  against: ["Custody gap on Exhibit C could be used to challenge admissibility", "Defense may argue contributory circumstances"],
};

const SIMILAR_CASES = [
  { name: "Ferreira v. State (2023)", similarity: 91, outcome: "Plaintiff" },
  { name: "Whitmore v. County Board (2022)", similarity: 84, outcome: "Settled" },
  { name: "Reyes v. Northgate Ltd. (2021)", similarity: 77, outcome: "Plaintiff" },
  { name: "Dunbar v. State (2020)", similarity: 69, outcome: "Defendant" },
];

const RELEVANT_ACTS = ["Art. 21 · Constitution", "Sec. 138 · NI Act", "Evidence Act, Sec. 45"];

function GaugeBar({ label, value, tone = "cyan" }) {
  return (
    <div className="jp-gaugebar">
      <div className="jp-gaugebar-top">
        <span>{label}</span>
        <span className="jp-mono">{value}%</span>
      </div>
      <div className="jp-gaugebar-track">
        <div className={`jp-gaugebar-fill jp-tone-${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function JustiMindPrediction() {
  const [theme, setTheme] = useState("dark");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const topProb = PROB_DATA[0];

  return (
    <div className={`jp-root jp-theme-${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .jp-root {
          --bg: #050505; --surface: #0a0a0d; --card: #121212; --card-border: rgba(255,255,255,0.08);
          --text: #f5f6fa; --text-muted: #9a9db3;
          --royal: #2547F4; --purple: #7B3FE4; --cyan: #22D3EE; --neon: #4F8CFF;
          --grad: linear-gradient(120deg, var(--royal), var(--purple) 55%, var(--cyan));
          --good: #34d399; --warn: #fbbf24; --bad: #f87171;
          font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--text);
          min-height: 100vh; transition: background 0.4s, color 0.4s;
        }
        .jp-root.jp-theme-light {
          --bg: #f7f7fa; --surface: #ffffff; --card: #ffffff; --card-border: rgba(10,10,25,0.08);
          --text: #0c0c14; --text-muted: #5b5f76;
        }
        .jp-root * { box-sizing: border-box; }
        .jp-mono { font-family: 'IBM Plex Mono', monospace; }
        .jp-wrap { max-width: 1180px; margin: 0 auto; padding: 0 26px 60px; }

        .jp-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 26px; border-bottom: 1px solid var(--card-border);
          position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 75%, transparent);
          backdrop-filter: blur(14px); z-index: 10;
        }
        .jp-logo { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 15.5px; }
        .jp-logo-mark { width: 26px; height: 26px; border-radius: 7px; background: var(--grad); display: flex; align-items: center; justify-content: center; }
        .jp-case-title { font-size: 13.5px; color: var(--text-muted); margin-left: 18px; padding-left: 18px; border-left: 1px solid var(--card-border); }
        .jp-topbar-actions { display: flex; align-items: center; gap: 10px; }
        .jp-icon-btn { width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--card-border); background: var(--card); display: flex; align-items: center; justify-content: center; color: var(--text); cursor: pointer; }
        .jp-icon-btn:hover { border-color: var(--neon); }
        .jp-btn { display: inline-flex; align-items: center; gap: 7px; font-weight: 700; font-size: 13px; padding: 9px 15px; border-radius: 9px; border: 1px solid var(--card-border); background: var(--card); color: var(--text); cursor: pointer; }
        .jp-btn--primary { background: var(--grad); border: none; color: white; }

        .jp-header { padding: 34px 26px 6px; }
        .jp-kicker { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.07em; color: var(--purple); text-transform: uppercase; }
        .jp-h1 { font-family: 'Fraunces', serif; font-weight: 500; font-size: 32px; margin: 8px 0 6px; }
        .jp-sub { color: var(--text-muted); font-size: 14.5px; }

        .jp-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; padding: 26px; }
        .jp-card { background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; padding: 22px; }
        .jp-card-label { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 14px; }

        /* hero donut card */
        .jp-col-5 { grid-column: span 5; }
        .jp-col-7 { grid-column: span 7; }
        .jp-col-4 { grid-column: span 4; }
        .jp-col-6 { grid-column: span 6; }
        .jp-col-8 { grid-column: span 8; }
        .jp-col-12 { grid-column: span 12; }

        .jp-donut-wrap { position: relative; display: flex; align-items: center; gap: 20px; }
        .jp-donut-center { position: absolute; left: 0; right: 0; top: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
        .jp-donut-num { font-family: 'IBM Plex Mono', monospace; font-size: 30px; font-weight: 500; color: var(--cyan); }
        .jp-donut-lbl { font-size: 11px; color: var(--text-muted); }
        .jp-legend { display: flex; flex-direction: column; gap: 10px; }
        .jp-legend-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .jp-legend-dot { width: 9px; height: 9px; border-radius: 50%; }
        .jp-legend-val { margin-left: auto; font-family: 'IBM Plex Mono', monospace; color: var(--text-muted); }

        .jp-metric-row { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
        .jp-metric-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, rgba(37,71,244,0.18), rgba(123,63,228,0.18)); display: flex; align-items: center; justify-content: center; color: var(--cyan); flex-shrink: 0; }
        .jp-metric-val { font-family: 'IBM Plex Mono', monospace; font-size: 22px; font-weight: 500; }
        .jp-metric-lbl { font-size: 12px; color: var(--text-muted); }

        .jp-gaugebar { margin-bottom: 16px; }
        .jp-gaugebar:last-child { margin-bottom: 0; }
        .jp-gaugebar-top { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
        .jp-gaugebar-track { height: 7px; border-radius: 4px; background: var(--card-border); overflow: hidden; }
        .jp-gaugebar-fill { height: 100%; border-radius: 4px; }
        .jp-tone-cyan { background: linear-gradient(90deg, var(--royal), var(--cyan)); }
        .jp-tone-warn { background: linear-gradient(90deg, var(--purple), var(--warn)); }
        .jp-tone-bad { background: linear-gradient(90deg, var(--purple), var(--bad)); }

        .jp-chain-item { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--card-border); }
        .jp-chain-item:last-child { border-bottom: none; }
        .jp-chain-num { width: 26px; height: 26px; border-radius: 8px; background: var(--surface); border: 1px solid var(--card-border); display: flex; align-items: center; justify-content: center; font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--cyan); flex-shrink: 0; }
        .jp-chain-tag { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: var(--purple); text-transform: uppercase; margin-bottom: 4px; display: block; }
        .jp-chain-text { font-size: 13.5px; line-height: 1.55; color: var(--text); }

        .jp-swot-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        .jp-swot-col h4 { font-size: 12.5px; margin: 0 0 10px; display: flex; align-items: center; gap: 6px; }
        .jp-swot-col ul { list-style: none; padding: 0; margin: 0; }
        .jp-swot-col li { font-size: 12.5px; line-height: 1.55; color: var(--text-muted); padding: 8px 0; border-bottom: 1px solid var(--card-border); }
        .jp-swot-col li:last-child { border-bottom: none; }

        .jp-arg-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .jp-arg-head { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; margin-bottom: 10px; }
        .jp-arg-item { display: flex; gap: 8px; font-size: 13px; color: var(--text-muted); padding: 7px 0; line-height: 1.5; }

        .jp-case-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--card-border); }
        .jp-case-row:last-child { border-bottom: none; }
        .jp-case-name { font-size: 13.5px; font-weight: 600; }
        .jp-case-sim { font-size: 11.5px; color: var(--text-muted); font-family: 'IBM Plex Mono', monospace; }
        .jp-outcome-badge { font-size: 11px; font-family: 'IBM Plex Mono', monospace; padding: 4px 10px; border-radius: 100px; }
        .jp-outcome-Plaintiff { background: rgba(52,211,153,0.12); color: var(--good); }
        .jp-outcome-Settled { background: rgba(123,63,228,0.12); color: var(--purple); }
        .jp-outcome-Defendant { background: rgba(248,113,113,0.12); color: var(--bad); }

        .jp-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .jp-chip { font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; padding: 6px 12px; border-radius: 100px; background: var(--surface); border: 1px solid var(--card-border); color: var(--text-muted); }

        .jp-strategy { background: linear-gradient(135deg, rgba(37,71,244,0.12), rgba(123,63,228,0.12)); border: 1px solid var(--card-border); border-radius: 16px; padding: 24px; display: flex; gap: 18px; align-items: flex-start; }
        .jp-strategy-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--grad); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .jp-strategy h3 { margin: 0 0 8px; font-size: 16px; }
        .jp-strategy p { margin: 0; font-size: 14px; color: var(--text-muted); line-height: 1.65; }

        @media (max-width: 900px) {
          .jp-grid { grid-template-columns: 1fr; padding: 18px; }
          .jp-col-5, .jp-col-7, .jp-col-4, .jp-col-6, .jp-col-8, .jp-col-12 { grid-column: span 1; }
          .jp-swot-grid, .jp-arg-cols { grid-template-columns: 1fr; }
          .jp-case-title { display: none; }
        }
      `}</style>

      {/* ---------------- Top bar ---------------- */}
      <div className="jp-topbar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="jp-logo">
            <div className="jp-logo-mark"><Scale size={14} color="#fff" /></div>
            JustiMind
          </div>
          <span className="jp-case-title">Prediction · Ferreira v. State</span>
        </div>
        <div className="jp-topbar-actions">
          <button className="jp-icon-btn" onClick={toggleTheme}>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button>
          <button className="jp-btn"><FileText size={14} /> Export DOCX</button>
          <button className="jp-btn jp-btn--primary"><Download size={14} /> Export PDF report</button>
        </div>
      </div>

      {/* ---------------- Header ---------------- */}
      <div className="jp-header">
        <span className="jp-kicker">Prediction Engine · AI Confidence 91%</span>
        <h1 className="jp-h1">Ferreira v. State</h1>
        <p className="jp-sub">Civil claim · Filed District Court · Evidence class: documentary + witness testimony</p>
      </div>

      {/* ---------------- Grid ---------------- */}
      <div className="jp-grid">

        {/* Hero probability donut */}
        <div className="jp-card jp-col-7">
          <div className="jp-card-label">Outcome probability</div>
          <div className="jp-donut-wrap">
            <div style={{ width: 190, height: 190, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PROB_DATA} dataKey="value" innerRadius={62} outerRadius={90} paddingAngle={3} stroke="none">
                    {PROB_DATA.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="jp-donut-center">
                <div className="jp-donut-num">{topProb.value}%</div>
                <div className="jp-donut-lbl">WIN</div>
              </div>
            </div>
            <div className="jp-legend">
              {PROB_DATA.map((d) => (
                <div className="jp-legend-row" key={d.name}>
                  <span className="jp-legend-dot" style={{ background: d.color }} />
                  {d.name}
                  <span className="jp-legend-val">{d.value}%</span>
                </div>
              ))}
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)", maxWidth: 220, lineHeight: 1.5 }}>
                Calibrated against 214 comparable cases in this jurisdiction.
              </div>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="jp-col-5" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="jp-card" style={{ flex: 1 }}>
            <div className="jp-metric-row">
              <div className="jp-metric-icon"><DollarSign size={18} /></div>
              <div>
                <div className="jp-metric-val">$142K</div>
                <div className="jp-metric-lbl">Expected compensation</div>
              </div>
            </div>
          </div>
          <div className="jp-card" style={{ flex: 1 }}>
            <div className="jp-metric-row">
              <div className="jp-metric-icon"><Clock size={18} /></div>
              <div>
                <div className="jp-metric-val">7–9 mo</div>
                <div className="jp-metric-lbl">Estimated case duration</div>
              </div>
            </div>
          </div>
          <div className="jp-card" style={{ flex: 1 }}>
            <div className="jp-metric-row">
              <div className="jp-metric-icon"><Gavel size={18} /></div>
              <div>
                <div className="jp-metric-val">Moderate</div>
                <div className="jp-metric-lbl">Judge pattern risk</div>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence trend */}
        <div className="jp-card jp-col-8">
          <div className="jp-card-label">Confidence over case timeline</div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <AreaChart data={CONFIDENCE_TREND} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="conf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="stage" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#121212", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="confidence" stroke="#22D3EE" strokeWidth={2} fill="url(#conf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evidence / risk gauges */}
        <div className="jp-card jp-col-4">
          <div className="jp-card-label">Strength signals</div>
          <GaugeBar label="Evidence strength" value={82} tone="cyan" />
          <GaugeBar label="Precedent alignment" value={66} tone="warn" />
          <GaugeBar label="Judge fit" value={74} tone="cyan" />
          <GaugeBar label="Risk level" value={28} tone="bad" />
        </div>

        {/* Reasoning chain */}
        <div className="jp-card jp-col-6">
          <div className="jp-card-label">Reasoning chain</div>
          {REASONING_CHAIN.map((r, i) => (
            <div className="jp-chain-item" key={i}>
              <div className="jp-chain-num jp-mono">{i + 1}</div>
              <div>
                <span className="jp-chain-tag">{r.weight}</span>
                <div className="jp-chain-text">{r.step}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SWOT */}
        <div className="jp-card jp-col-6">
          <div className="jp-card-label">Risk breakdown</div>
          <div className="jp-swot-grid">
            <div className="jp-swot-col">
              <h4><AlertTriangle size={13} color="var(--bad)" /> Weaknesses</h4>
              <ul>{SWOT.weaknesses.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
            <div className="jp-swot-col">
              <h4><TrendingUp size={13} color="var(--good)" /> Opportunities</h4>
              <ul>{SWOT.opportunities.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
            <div className="jp-swot-col">
              <h4><TrendingDown size={13} color="var(--warn)" /> Threats</h4>
              <ul>{SWOT.threats.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
          </div>
        </div>

        {/* Top arguments */}
        <div className="jp-card jp-col-6">
          <div className="jp-card-label">Top arguments</div>
          <div className="jp-arg-cols">
            <div>
              <div className="jp-arg-head" style={{ color: "var(--good)" }}><CheckCircle2 size={15} /> For</div>
              {TOP_ARGUMENTS.for.map((a) => <div className="jp-arg-item" key={a}><ArrowRight size={13} style={{ marginTop: 3, flexShrink: 0 }} />{a}</div>)}
            </div>
            <div>
              <div className="jp-arg-head" style={{ color: "var(--bad)" }}><XCircle size={15} /> Against</div>
              {TOP_ARGUMENTS.against.map((a) => <div className="jp-arg-item" key={a}><ArrowRight size={13} style={{ marginTop: 3, flexShrink: 0 }} />{a}</div>)}
            </div>
          </div>
        </div>

        {/* Similar cases */}
        <div className="jp-card jp-col-6">
          <div className="jp-card-label"><Users size={12} style={{ marginRight: 5, verticalAlign: -2 }} />Similar cases</div>
          {SIMILAR_CASES.map((c) => (
            <div className="jp-case-row" key={c.name}>
              <div>
                <div className="jp-case-name">{c.name}</div>
                <div className="jp-case-sim">{c.similarity}% similar</div>
              </div>
              <span className={`jp-outcome-badge jp-outcome-${c.outcome}`}>{c.outcome}</span>
            </div>
          ))}
        </div>

        {/* Relevant acts */}
        <div className="jp-card jp-col-12">
          <div className="jp-card-label"><BookOpen size={12} style={{ marginRight: 5, verticalAlign: -2 }} />Relevant acts & sections</div>
          <div className="jp-chip-row">
            {RELEVANT_ACTS.map((a) => <span className="jp-chip" key={a}>{a}</span>)}
          </div>
        </div>

        {/* Strategy */}
        <div className="jp-col-12">
          <div className="jp-strategy">
            <div className="jp-strategy-icon"><Sparkles size={20} color="#fff" /></div>
            <div>
              <h3>Recommended strategy</h3>
              <p>Request the original chain-of-custody log for Exhibit C before the July 14th hearing — closing this single gap moves the win probability from 78% toward an estimated 88%. Given the opposing counsel's recent settlement pattern, a structured settlement offer at this stage may also be worth raising in parallel.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
