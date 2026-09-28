import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  Scale, Sun, Moon, Download, TrendingUp, TrendingDown, Gavel, Clock,
  Target, Percent, ChevronDown
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  JustiMind — Analytics Dashboard                                   */
/*  Same token system as the rest of the product.                     */
/* ------------------------------------------------------------------ */

const MONTHLY_CASES = [
  { month: "Feb", cases: 38 }, { month: "Mar", cases: 44 }, { month: "Apr", cases: 41 },
  { month: "May", cases: 52 }, { month: "Jun", cases: 58 }, { month: "Jul", cases: 63 },
];

const OUTCOME_TREND = [
  { month: "Feb", win: 58, settle: 24, loss: 18 },
  { month: "Mar", win: 61, settle: 23, loss: 16 },
  { month: "Apr", win: 63, settle: 22, loss: 15 },
  { month: "May", win: 65, settle: 21, loss: 14 },
  { month: "Jun", win: 68, settle: 20, loss: 12 },
  { month: "Jul", win: 71, settle: 18, loss: 11 },
];

const CATEGORIES = [
  { name: "Contract", value: 32, color: "#2547F4" },
  { name: "Civil", value: 24, color: "#4F8CFF" },
  { name: "IP", value: 16, color: "#22D3EE" },
  { name: "Family", value: 14, color: "#7B3FE4" },
  { name: "Criminal", value: 9, color: "#a855f7" },
  { name: "Other", value: 5, color: "#3a3a44" },
];

const ACCURACY_TREND = [
  { month: "Feb", accuracy: 88 }, { month: "Mar", accuracy: 89 }, { month: "Apr", accuracy: 91 },
  { month: "May", accuracy: 92 }, { month: "Jun", accuracy: 93 }, { month: "Jul", accuracy: 94 },
];

const COURT_ANALYTICS = [
  { court: "District Court", cases: 142, winRate: 71 },
  { court: "High Court", cases: 68, winRate: 64 },
  { court: "Commercial Tribunal", cases: 39, winRate: 79 },
  { court: "Family Court", cases: 31, winRate: 58 },
];

const JUDGE_ANALYTICS = [
  { judge: "Judge R. Anand", cases: 34, winRate: 74, avgDuration: "6.2 mo" },
  { judge: "Judge M. Sethi", cases: 28, winRate: 61, avgDuration: "8.1 mo" },
  { judge: "Judge P. Kwan", cases: 22, winRate: 82, avgDuration: "5.4 mo" },
  { judge: "Judge L. Okafor", cases: 19, winRate: 55, avgDuration: "9.3 mo" },
];

const RISK_DIST = [
  { name: "Low", value: 46, color: "#34d399" },
  { name: "Medium", value: 38, color: "#fbbf24" },
  { name: "High", value: 16, color: "#f87171" },
];

function KpiCard({ icon: Icon, label, value, delta, positive = true }) {
  return (
    <div className="ja-card ja-kpi">
      <div className="ja-kpi-icon"><Icon size={17} /></div>
      <div style={{ flex: 1 }}>
        <div className="ja-kpi-value">{value}</div>
        <div className="ja-kpi-label">{label}</div>
      </div>
      <div className={`ja-kpi-delta ${positive ? "ja-delta-up" : "ja-delta-down"}`}>
        {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {delta}
      </div>
    </div>
  );
}

export default function JustiMindAnalytics() {
  const [theme, setTheme] = useState("dark");
  const [range, setRange] = useState("6 months");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className={`ja-root ja-theme-${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .ja-root {
          --bg: #050505; --surface: #0a0a0d; --card: #121212; --card-border: rgba(255,255,255,0.08);
          --text: #f5f6fa; --text-muted: #9a9db3;
          --royal: #2547F4; --purple: #7B3FE4; --cyan: #22D3EE; --neon: #4F8CFF;
          --grad: linear-gradient(120deg, var(--royal), var(--purple) 55%, var(--cyan));
          --good: #34d399; --warn: #fbbf24; --bad: #f87171;
          font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--text);
          min-height: 100vh; transition: background 0.4s, color 0.4s;
        }
        .ja-root.ja-theme-light {
          --bg: #f7f7fa; --surface: #ffffff; --card: #ffffff; --card-border: rgba(10,10,25,0.08);
          --text: #0c0c14; --text-muted: #5b5f76;
        }
        .ja-root * { box-sizing: border-box; }
        .ja-mono { font-family: 'IBM Plex Mono', monospace; }

        .ja-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 26px; border-bottom: 1px solid var(--card-border);
          position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 75%, transparent);
          backdrop-filter: blur(14px); z-index: 10;
        }
        .ja-logo { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 15.5px; }
        .ja-logo-mark { width: 26px; height: 26px; border-radius: 7px; background: var(--grad); display: flex; align-items: center; justify-content: center; }
        .ja-actions { display: flex; align-items: center; gap: 10px; }
        .ja-icon-btn { width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--card-border); background: var(--card); display: flex; align-items: center; justify-content: center; color: var(--text); cursor: pointer; }
        .ja-icon-btn:hover { border-color: var(--neon); }
        .ja-btn { display: inline-flex; align-items: center; gap: 7px; font-weight: 700; font-size: 13px; padding: 9px 15px; border-radius: 9px; border: 1px solid var(--card-border); background: var(--card); color: var(--text); cursor: pointer; }
        .ja-btn--primary { background: var(--grad); border: none; color: white; }
        .ja-range-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; padding: 8px 13px; border-radius: 9px; background: var(--card); border: 1px solid var(--card-border); color: var(--text); cursor: pointer; }

        .ja-header { padding: 28px 26px 4px; }
        .ja-kicker { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.07em; color: var(--purple); text-transform: uppercase; }
        .ja-h1 { font-family: 'Fraunces', serif; font-weight: 500; font-size: 30px; margin: 8px 0 4px; }
        .ja-sub { color: var(--text-muted); font-size: 14px; }

        .ja-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; padding: 24px 26px 60px; }
        .ja-card { background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; padding: 20px; }
        .ja-card-label { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }

        .ja-col-3 { grid-column: span 3; }
        .ja-col-4 { grid-column: span 4; }
        .ja-col-6 { grid-column: span 6; }
        .ja-col-8 { grid-column: span 8; }
        .ja-col-12 { grid-column: span 12; }

        .ja-kpi { display: flex; align-items: center; gap: 12px; }
        .ja-kpi-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, rgba(37,71,244,0.18), rgba(123,63,228,0.18)); display: flex; align-items: center; justify-content: center; color: var(--cyan); flex-shrink: 0; }
        .ja-kpi-value { font-family: 'IBM Plex Mono', monospace; font-size: 21px; font-weight: 500; }
        .ja-kpi-label { font-size: 11.5px; color: var(--text-muted); }
        .ja-kpi-delta { font-size: 11.5px; font-family: 'IBM Plex Mono', monospace; display: flex; align-items: center; gap: 3px; padding: 4px 8px; border-radius: 100px; }
        .ja-delta-up { color: var(--good); background: rgba(52,211,153,0.1); }
        .ja-delta-down { color: var(--bad); background: rgba(248,113,113,0.1); }

        .ja-legend { display: flex; flex-direction: column; gap: 9px; margin-top: 14px; }
        .ja-legend-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-muted); }
        .ja-legend-dot { width: 9px; height: 9px; border-radius: 50%; }
        .ja-legend-val { margin-left: auto; font-family: 'IBM Plex Mono', monospace; color: var(--text); }

        .ja-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ja-table th { text-align: left; font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; padding: 0 0 10px; border-bottom: 1px solid var(--card-border); }
        .ja-table td { padding: 11px 0; border-bottom: 1px solid var(--card-border); color: var(--text); }
        .ja-table tr:last-child td { border-bottom: none; }
        .ja-wr-pill { font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; padding: 3px 9px; border-radius: 100px; }

        @media (max-width: 900px) {
          .ja-grid { grid-template-columns: 1fr; padding: 18px; }
          .ja-col-3, .ja-col-4, .ja-col-6, .ja-col-8, .ja-col-12 { grid-column: span 1; }
        }
      `}</style>

      {/* ---------------- Top bar ---------------- */}
      <div className="ja-topbar">
        <div className="ja-logo">
          <div className="ja-logo-mark"><Scale size={14} color="#fff" /></div>
          JustiMind
        </div>
        <div className="ja-actions">
          <button className="ja-range-pill">{range} <ChevronDown size={13} /></button>
          <button className="ja-icon-btn" onClick={toggleTheme}>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button>
          <button className="ja-btn ja-btn--primary"><Download size={14} /> Export report</button>
        </div>
      </div>

      {/* ---------------- Header ---------------- */}
      <div className="ja-header">
        <span className="ja-kicker">Analytics</span>
        <h1 className="ja-h1">Docket performance</h1>
        <p className="ja-sub">Across 296 cases analyzed in the last 6 months</p>
      </div>

      <div className="ja-grid">
        {/* KPI row */}
        <div className="ja-col-3"><KpiCard icon={Target} label="Prediction accuracy" value="94%" delta="+2.1%" /></div>
        <div className="ja-col-3"><KpiCard icon={Percent} label="Overall win rate" value="71%" delta="+3.4%" /></div>
        <div className="ja-col-3"><KpiCard icon={Clock} label="Avg. case duration" value="6.8 mo" delta="-0.4 mo" /></div>
        <div className="ja-col-3"><KpiCard icon={Gavel} label="Cases this month" value="63" delta="+8.6%" /></div>

        {/* Monthly cases */}
        <div className="ja-card ja-col-8">
          <div className="ja-card-label">Monthly case volume</div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={MONTHLY_CASES} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#121212", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="cases" radius={[6, 6, 0, 0]} fill="#4F8CFF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case categories */}
        <div className="ja-card ja-col-4">
          <div className="ja-card-label">Case categories</div>
          <div style={{ width: "100%", height: 150 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={CATEGORIES} dataKey="value" innerRadius={44} outerRadius={68} paddingAngle={2} stroke="none">
                  {CATEGORIES.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="ja-legend">
            {CATEGORIES.map((c) => (
              <div className="ja-legend-row" key={c.name}>
                <span className="ja-legend-dot" style={{ background: c.color }} />
                {c.name}
                <span className="ja-legend-val">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome trend */}
        <div className="ja-card ja-col-6">
          <div className="ja-card-label">Outcome distribution over time</div>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <AreaChart data={OUTCOME_TREND} margin={{ left: -20 }}>
                <defs>
                  <linearGradient id="winG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22D3EE" stopOpacity={0.5} /><stop offset="100%" stopColor="#22D3EE" stopOpacity={0} /></linearGradient>
                  <linearGradient id="settleG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7B3FE4" stopOpacity={0.4} /><stop offset="100%" stopColor="#7B3FE4" stopOpacity={0} /></linearGradient>
                  <linearGradient id="lossG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f87171" stopOpacity={0.3} /><stop offset="100%" stopColor="#f87171" stopOpacity={0} /></linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#121212", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="win" stackId="1" stroke="#22D3EE" fill="url(#winG)" />
                <Area type="monotone" dataKey="settle" stackId="1" stroke="#7B3FE4" fill="url(#settleG)" />
                <Area type="monotone" dataKey="loss" stackId="1" stroke="#f87171" fill="url(#lossG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction accuracy trend */}
        <div className="ja-card ja-col-6">
          <div className="ja-card-label">Prediction accuracy trend</div>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={ACCURACY_TREND} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#121212", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="accuracy" stroke="#22D3EE" strokeWidth={2.5} dot={{ r: 3, fill: "#22D3EE" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Court analytics table */}
        <div className="ja-card ja-col-8">
          <div className="ja-card-label">Court analytics</div>
          <table className="ja-table">
            <thead><tr><th>Court</th><th>Cases</th><th>Win rate</th></tr></thead>
            <tbody>
              {COURT_ANALYTICS.map((c) => (
                <tr key={c.court}>
                  <td>{c.court}</td>
                  <td className="ja-mono">{c.cases}</td>
                  <td><span className="ja-wr-pill ja-mono" style={{ background: c.winRate > 70 ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)", color: c.winRate > 70 ? "var(--good)" : "var(--warn)" }}>{c.winRate}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risk distribution */}
        <div className="ja-card ja-col-4">
          <div className="ja-card-label">Risk distribution</div>
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={RISK_DIST} dataKey="value" innerRadius={40} outerRadius={64} paddingAngle={2} stroke="none">
                  {RISK_DIST.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="ja-legend">
            {RISK_DIST.map((c) => (
              <div className="ja-legend-row" key={c.name}>
                <span className="ja-legend-dot" style={{ background: c.color }} />
                {c.name} risk
                <span className="ja-legend-val">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Judge analytics table */}
        <div className="ja-card ja-col-12">
          <div className="ja-card-label">Judge analytics</div>
          <table className="ja-table">
            <thead><tr><th>Judge</th><th>Cases</th><th>Win rate</th><th>Avg. duration</th></tr></thead>
            <tbody>
              {JUDGE_ANALYTICS.map((j) => (
                <tr key={j.judge}>
                  <td>{j.judge}</td>
                  <td className="ja-mono">{j.cases}</td>
                  <td><span className="ja-wr-pill ja-mono" style={{ background: j.winRate > 70 ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)", color: j.winRate > 70 ? "var(--good)" : "var(--warn)" }}>{j.winRate}%</span></td>
                  <td className="ja-mono">{j.avgDuration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
