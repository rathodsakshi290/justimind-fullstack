import React, { useState } from "react";
import {
  Scale, Sun, Moon, Users, ShieldCheck, Activity, CreditCard, FileWarning,
  Search, MoreHorizontal, TrendingUp, ServerCog, Bell, Lock, LayoutGrid
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  JustiMind — Admin Panel                                           */
/*  Same token system as the rest of the product.                     */
/* ------------------------------------------------------------------ */

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "users", label: "Users", icon: Users },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "logs", label: "System logs", icon: ServerCog },
];

const USERS = [
  { name: "Sakshi Rao", email: "sakshi@chambers.io", role: "Admin", status: "active", lastActive: "2m ago" },
  { name: "D. Whitfield", email: "d.whitfield@chambers.io", role: "Counsel", status: "active", lastActive: "18m ago" },
  { name: "M. Okonkwo", email: "m.okonkwo@chambers.io", role: "Associate", status: "active", lastActive: "1h ago" },
  { name: "R. Alvarez", email: "r.alvarez@chambers.io", role: "Associate", status: "invited", lastActive: "—" },
  { name: "T. Nakamura", email: "t.nakamura@chambers.io", role: "Viewer", status: "suspended", lastActive: "12d ago" },
];

const AUDIT_LOG = [
  { action: "Prediction generated", user: "D. Whitfield", target: "Whitfield Patent Co.", time: "12m ago" },
  { action: "Document exported (PDF)", user: "M. Okonkwo", target: "Meridian Corp. NDA", time: "48m ago" },
  { action: "Role changed: Associate → Counsel", user: "Sakshi Rao", target: "D. Whitfield", time: "3h ago" },
  { action: "Failed login attempt", user: "unknown", target: "r.alvarez@chambers.io", time: "6h ago" },
  { action: "API key regenerated", user: "Sakshi Rao", target: "Production key", time: "1d ago" },
];

const SECURITY_ITEMS = [
  { label: "Two-factor authentication", status: "Enforced for all seats", tone: "good" },
  { label: "SSO (SAML)", status: "Not configured", tone: "warn" },
  { label: "Session timeout", status: "8 hours, idle logout enabled", tone: "good" },
  { label: "Audit log retention", status: "12 months", tone: "good" },
  { label: "IP allow-list", status: "Disabled", tone: "warn" },
];

function statusPillClass(status) {
  if (status === "active") return "ap-status-good";
  if (status === "invited") return "ap-status-warn";
  return "ap-status-bad";
}

export default function JustiMindAdmin() {
  const [theme, setTheme] = useState("dark");
  const [nav, setNav] = useState("overview");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className={`ap-root ap-theme-${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .ap-root {
          --bg: #050505; --surface: #0a0a0d; --card: #121212; --card-border: rgba(255,255,255,0.08);
          --text: #f5f6fa; --text-muted: #9a9db3;
          --royal: #2547F4; --purple: #7B3FE4; --cyan: #22D3EE; --neon: #4F8CFF;
          --grad: linear-gradient(120deg, var(--royal), var(--purple) 55%, var(--cyan));
          --good: #34d399; --warn: #fbbf24; --bad: #f87171;
          font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--text);
          min-height: 100vh; display: flex; transition: background 0.4s, color 0.4s;
        }
        .ap-root.ap-theme-light {
          --bg: #f7f7fa; --surface: #ffffff; --card: #ffffff; --card-border: rgba(10,10,25,0.08);
          --text: #0c0c14; --text-muted: #5b5f76;
        }
        .ap-root * { box-sizing: border-box; }
        .ap-mono { font-family: 'IBM Plex Mono', monospace; }

        .ap-side { width: 230px; flex-shrink: 0; border-right: 1px solid var(--card-border); background: var(--surface); padding: 18px 14px; }
        .ap-logo { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 15px; padding: 0 6px 8px; }
        .ap-logo-mark { width: 25px; height: 25px; border-radius: 7px; background: var(--grad); display: flex; align-items: center; justify-content: center; }
        .ap-badge { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--purple); text-transform: uppercase; padding: 0 6px 18px; letter-spacing: 0.06em; }
        .ap-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 10px; border-radius: 9px; font-size: 13.5px; color: var(--text-muted); cursor: pointer; margin-bottom: 2px; }
        .ap-nav-item:hover { background: var(--card); color: var(--text); }
        .ap-nav-item.ap-active { background: var(--card); color: var(--text); }
        .ap-nav-item.ap-active svg { color: var(--cyan); }

        .ap-main { flex: 1; min-width: 0; }
        .ap-topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 26px; border-bottom: 1px solid var(--card-border); }
        .ap-h1 { font-family: 'Fraunces', serif; font-weight: 500; font-size: 22px; }
        .ap-icon-btn { width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--card-border); background: var(--card); display: flex; align-items: center; justify-content: center; color: var(--text); cursor: pointer; }
        .ap-icon-btn:hover { border-color: var(--neon); }

        .ap-content { padding: 24px 26px 60px; }

        .ap-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px; }
        .ap-kpi { background: var(--card); border: 1px solid var(--card-border); border-radius: 14px; padding: 18px; display: flex; align-items: center; gap: 12px; }
        .ap-kpi-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, rgba(37,71,244,0.18), rgba(123,63,228,0.18)); display: flex; align-items: center; justify-content: center; color: var(--cyan); flex-shrink: 0; }
        .ap-kpi-val { font-family: 'IBM Plex Mono', monospace; font-size: 19px; font-weight: 500; }
        .ap-kpi-lbl { font-size: 11.5px; color: var(--text-muted); }

        .ap-card { background: var(--card); border: 1px solid var(--card-border); border-radius: 14px; padding: 20px; margin-bottom: 18px; }
        .ap-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .ap-card-title { font-size: 13.5px; font-weight: 700; }

        .ap-search { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--card-border); border-radius: 9px; padding: 7px 11px; width: 220px; }
        .ap-search input { border: none; background: transparent; outline: none; color: var(--text); font-size: 12.5px; flex: 1; font-family: 'Manrope', sans-serif; }

        .ap-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ap-table th { text-align: left; font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; padding: 0 10px 10px 0; border-bottom: 1px solid var(--card-border); }
        .ap-table td { padding: 12px 10px 12px 0; border-bottom: 1px solid var(--card-border); }
        .ap-table tr:last-child td { border-bottom: none; }
        .ap-user-name { font-weight: 700; font-size: 13px; }
        .ap-user-email { font-size: 11.5px; color: var(--text-muted); }
        .ap-status-pill { font-family: 'IBM Plex Mono', monospace; font-size: 11px; padding: 3px 10px; border-radius: 100px; }
        .ap-status-good { background: rgba(52,211,153,0.12); color: var(--good); }
        .ap-status-warn { background: rgba(251,191,36,0.12); color: var(--warn); }
        .ap-status-bad { background: rgba(248,113,113,0.12); color: var(--bad); }

        .ap-log-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--card-border); font-size: 12.5px; }
        .ap-log-row:last-child { border-bottom: none; }
        .ap-log-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); flex-shrink: 0; }
        .ap-log-action { font-weight: 600; }
        .ap-log-meta { color: var(--text-muted); }
        .ap-log-time { margin-left: auto; color: var(--text-muted); font-family: 'IBM Plex Mono', monospace; font-size: 11px; flex-shrink: 0; }

        .ap-sec-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--card-border); }
        .ap-sec-row:last-child { border-bottom: none; }
        .ap-sec-label { font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .ap-sec-status { font-size: 12.5px; }

        .ap-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

        @media (max-width: 900px) {
          .ap-side { display: none; }
          .ap-kpi-row { grid-template-columns: 1fr 1fr; }
          .ap-two-col { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ---------------- Sidebar ---------------- */}
      <aside className="ap-side">
        <div className="ap-logo">
          <div className="ap-logo-mark"><Scale size={13} color="#fff" /></div>
          JustiMind
        </div>
        <div className="ap-badge">ADMIN PANEL</div>
        {NAV.map((item) => (
          <div key={item.id} className={`ap-nav-item ${nav === item.id ? "ap-active" : ""}`} onClick={() => setNav(item.id)}>
            <item.icon size={16} />
            {item.label}
          </div>
        ))}
      </aside>

      {/* ---------------- Main ---------------- */}
      <main className="ap-main">
        <div className="ap-topbar">
          <div className="ap-h1">{NAV.find((n) => n.id === nav)?.label}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ap-icon-btn"><Bell size={15} /></button>
            <button className="ap-icon-btn" onClick={toggleTheme}>{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button>
          </div>
        </div>

        <div className="ap-content">
          {nav === "overview" && (
            <>
              <div className="ap-kpi-row">
                <div className="ap-kpi"><div className="ap-kpi-icon"><Users size={17} /></div><div><div className="ap-kpi-val ap-mono">48</div><div className="ap-kpi-lbl">Active seats</div></div></div>
                <div className="ap-kpi"><div className="ap-kpi-icon"><Activity size={17} /></div><div><div className="ap-kpi-val ap-mono">1,204</div><div className="ap-kpi-lbl">Actions this week</div></div></div>
                <div className="ap-kpi"><div className="ap-kpi-icon"><CreditCard size={17} /></div><div><div className="ap-kpi-val ap-mono">$4,272</div><div className="ap-kpi-lbl">MRR</div></div></div>
                <div className="ap-kpi"><div className="ap-kpi-icon"><FileWarning size={17} /></div><div><div className="ap-kpi-val ap-mono">3</div><div className="ap-kpi-lbl">Open feedback items</div></div></div>
              </div>
              <div className="ap-two-col">
                <div className="ap-card">
                  <div className="ap-card-head"><span className="ap-card-title">Recent audit log</span></div>
                  {AUDIT_LOG.map((l, i) => (
                    <div className="ap-log-row" key={i}>
                      <span className="ap-log-dot" />
                      <div><span className="ap-log-action">{l.action}</span> <span className="ap-log-meta">· {l.user} → {l.target}</span></div>
                      <span className="ap-log-time">{l.time}</span>
                    </div>
                  ))}
                </div>
                <div className="ap-card">
                  <div className="ap-card-head"><span className="ap-card-title">Security posture</span></div>
                  {SECURITY_ITEMS.map((s) => (
                    <div className="ap-sec-row" key={s.label}>
                      <span className="ap-sec-label"><Lock size={13} color="var(--text-muted)" />{s.label}</span>
                      <span className="ap-sec-status" style={{ color: s.tone === "good" ? "var(--good)" : "var(--warn)" }}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {nav === "users" && (
            <div className="ap-card">
              <div className="ap-card-head">
                <span className="ap-card-title">Team members ({USERS.length})</span>
                <div className="ap-search"><Search size={13} color="var(--text-muted)" /><input placeholder="Search users…" /></div>
              </div>
              <table className="ap-table">
                <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Last active</th><th></th></tr></thead>
                <tbody>
                  {USERS.map((u) => (
                    <tr key={u.email}>
                      <td><div className="ap-user-name">{u.name}</div><div className="ap-user-email">{u.email}</div></td>
                      <td>{u.role}</td>
                      <td><span className={`ap-status-pill ${statusPillClass(u.status)}`}>{u.status}</span></td>
                      <td className="ap-mono" style={{ color: "var(--text-muted)" }}>{u.lastActive}</td>
                      <td><MoreHorizontal size={15} color="var(--text-muted)" style={{ cursor: "pointer" }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {nav === "security" && (
            <div className="ap-card">
              <div className="ap-card-head"><span className="ap-card-title">Security posture</span></div>
              {SECURITY_ITEMS.map((s) => (
                <div className="ap-sec-row" key={s.label}>
                  <span className="ap-sec-label"><Lock size={13} color="var(--text-muted)" />{s.label}</span>
                  <span className="ap-sec-status" style={{ color: s.tone === "good" ? "var(--good)" : "var(--warn)" }}>{s.status}</span>
                </div>
              ))}
            </div>
          )}

          {nav === "billing" && (
            <div className="ap-card">
              <div className="ap-card-head"><span className="ap-card-title">Subscription</span></div>
              <div className="ap-sec-row"><span className="ap-sec-label">Plan</span><span className="ap-sec-status">Chambers (Custom)</span></div>
              <div className="ap-sec-row"><span className="ap-sec-label">Seats</span><span className="ap-sec-status">48 / 60</span></div>
              <div className="ap-sec-row"><span className="ap-sec-label">Next invoice</span><span className="ap-sec-status">Aug 1, 2026 — $4,272</span></div>
              <div className="ap-sec-row"><span className="ap-sec-label">Payment method</span><span className="ap-sec-status">Visa •••• 4471</span></div>
            </div>
          )}

          {nav === "logs" && (
            <div className="ap-card">
              <div className="ap-card-head"><span className="ap-card-title">System logs</span></div>
              {AUDIT_LOG.map((l, i) => (
                <div className="ap-log-row" key={i}>
                  <span className="ap-log-dot" />
                  <div><span className="ap-log-action">{l.action}</span> <span className="ap-log-meta">· {l.user} → {l.target}</span></div>
                  <span className="ap-log-time">{l.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
