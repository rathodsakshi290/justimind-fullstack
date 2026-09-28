import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Scale, MessageSquare, FileText, Brain, Search, BarChart3, Settings,
  Plus, Send, Paperclip, Mic, Sun, Moon, Pin, Folder, Bell, Bookmark,
  Clock, TrendingUp, ChevronDown, Sparkles, FileCheck2, AlertTriangle,
  MoreHorizontal, Star
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  JustiMind — AI Workspace / Dashboard                              */
/*  Same token system as the landing page, for brand continuity.      */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { icon: MessageSquare, label: "Workspace", active: true },
  { icon: FileText, label: "Case Summarizer" },
  { icon: Brain, label: "Prediction Engine" },
  { icon: FileCheck2, label: "Document Analyzer" },
  { icon: Search, label: "Legal Research" },
  { icon: BarChart3, label: "Analytics" },
];

const PINNED_CHATS = [
  { id: "p1", title: "Ferreira v. State — evidence review" },
  { id: "p2", title: "Meridian Corp. NDA draft risk" },
];

const RECENT_CHATS = [
  { id: "r1", title: "Sec. 138 NI Act — cheque bounce case" },
  { id: "r2", title: "Carlson custody dispute summary" },
  { id: "r3", title: "GDPR Art. 17 compliance check" },
  { id: "r4", title: "Landlord-tenant eviction timeline" },
  { id: "r5", title: "Patent infringement — prior art search" },
];

const RECENT_CASES = [
  { name: "Ferreira v. State", court: "High Court", status: "Hearing today", risk: "low" },
  { name: "Meridian Corp. NDA", court: "Contract review", status: "Pending", risk: "medium" },
  { name: "Carlson v. Carlson", court: "Family Court", status: "Disposed", risk: "low" },
  { name: "Whitfield Patent Co.", court: "IP Tribunal", status: "Next: Jul 14", risk: "high" },
];

const NOTIFICATIONS = [
  { text: "Prediction complete for Whitfield Patent Co.", time: "12m ago", icon: Brain },
  { text: "New Supreme Court ruling matches your bookmark", time: "1h ago", icon: Bell },
  { text: "Document analysis flagged 2 risky clauses", time: "3h ago", icon: AlertTriangle },
  { text: "Ferreira v. State hearing moved to 10:30 AM", time: "5h ago", icon: Clock },
];

const BOOKMARKS = [
  "Art. 21 · Right to life and liberty",
  "Sec. 138 · Negotiable Instruments Act",
  "GDPR Art. 17 · Right to erasure",
];

const SEARCH_HISTORY = [
  "chain of custody precedent India",
  "GDPR right to erasure exceptions",
  "average settlement time NI Act 138",
];

const CANNED_RESPONSE = [
  "Reviewed the uploaded filing against **3 similar precedents** in the jurisdiction.",
  "",
  "- Chain-of-custody documentation for Exhibit C is incomplete — this is the weakest point in the current filing.",
  "- Section 3 testimony is internally consistent with the police report timeline.",
  "- Applicable precedent leans favorably: two of three comparable rulings found for the plaintiff on similar evidence strength.",
  "",
  "Recommended next step: request the original custody log before the hearing on the 14th — this single document moves the win probability from 61% to an estimated 78%.",
  "",
  "[[cite:State v. Ferreira, 2023]] [[cite:Art. 21 · Constitution]]",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}

function MessageBody({ lines }) {
  return (
    <div className="jd-msg-body">
      {lines.map((line, i) => {
        if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
        if (line.startsWith("- ")) {
          return (
            <div className="jd-bullet" key={i}>
              <span className="jd-bullet-dot" />
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        if (line.includes("[[cite:")) {
          const cites = [...line.matchAll(/\[\[cite:([^\]]+)\]\]/g)].map((m) => m[1]);
          return (
            <div className="jd-cite-row" key={i}>
              {cites.map((c) => (
                <span className="jd-cite-chip" key={c}>{c}</span>
              ))}
            </div>
          );
        }
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function JustiMindWorkspace() {
  const [theme, setTheme] = useState("dark");
  const [rightTab, setRightTab] = useState("insights");
  const [activeNav, setActiveNav] = useState("Workspace");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      lines: [
        "Hi — I'm ready when you are. Upload a filing or ask me directly about a case, a section, or a precedent.",
      ],
      done: true,
    },
  ]);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || streaming) return;
    setMessages((m) => [...m, { role: "user", lines: [text], done: true }]);
    setInput("");
    setStreaming(true);

    setMessages((m) => [...m, { role: "assistant", lines: [""], done: false }]);

    const fullLines = CANNED_RESPONSE;
    let lineIdx = 0;
    let charIdx = 0;
    const interval = setInterval(() => {
      setMessages((m) => {
        const copy = [...m];
        const last = { ...copy[copy.length - 1] };
        const builtLines = fullLines.slice(0, lineIdx);
        const currentLine = fullLines[lineIdx] ? fullLines[lineIdx].slice(0, charIdx) : "";
        last.lines = [...builtLines, currentLine];
        copy[copy.length - 1] = last;
        return copy;
      });

      const curFull = fullLines[lineIdx] || "";
      charIdx += 3;
      if (charIdx >= curFull.length) {
        lineIdx += 1;
        charIdx = 0;
      }
      if (lineIdx >= fullLines.length) {
        clearInterval(interval);
        setStreaming(false);
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", lines: fullLines, done: true };
          return copy;
        });
      }
    }, 18);
  }, [input, streaming]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`jd-root jd-theme-${theme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .jd-root {
          --bg: #050505;
          --surface: #0a0a0d;
          --card: #121212;
          --card-hover: #17171b;
          --card-border: rgba(255,255,255,0.08);
          --text: #f5f6fa;
          --text-muted: #9a9db3;
          --royal: #2547F4;
          --purple: #7B3FE4;
          --cyan: #22D3EE;
          --neon: #4F8CFF;
          --grad: linear-gradient(120deg, var(--royal), var(--purple) 55%, var(--cyan));
          font-family: 'Manrope', sans-serif;
          background: var(--bg);
          color: var(--text);
          height: 100vh;
          display: flex;
          overflow: hidden;
          transition: background 0.4s ease, color 0.4s ease;
        }
        .jd-root.jd-theme-light {
          --bg: #f7f7fa;
          --surface: #ffffff;
          --card: #ffffff;
          --card-hover: #f1f1f6;
          --card-border: rgba(10,10,25,0.08);
          --text: #0c0c14;
          --text-muted: #5b5f76;
        }
        .jd-root * { box-sizing: border-box; }
        .jd-mono { font-family: 'IBM Plex Mono', monospace; }

        /* ---------- Left sidebar ---------- */
        .jd-left {
          width: 272px; flex-shrink: 0; background: var(--surface);
          border-right: 1px solid var(--card-border);
          display: flex; flex-direction: column; padding: 18px 14px;
        }
        .jd-logo { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 16px; padding: 0 6px 18px; }
        .jd-logo-mark {
          width: 26px; height: 26px; border-radius: 7px; background: var(--grad);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 14px rgba(79,140,255,0.5);
        }
        .jd-newchat {
          display: flex; align-items: center; gap: 8px; justify-content: center;
          background: var(--grad); color: white; border: none; border-radius: 10px;
          padding: 10px; font-weight: 700; font-size: 13.5px; cursor: pointer; margin-bottom: 16px;
          transition: transform 0.15s;
        }
        .jd-newchat:hover { transform: translateY(-1px); }

        .jd-nav-group { margin-bottom: 18px; }
        .jd-nav-item {
          display: flex; align-items: center; gap: 11px; padding: 9px 10px; border-radius: 9px;
          font-size: 13.5px; color: var(--text-muted); cursor: pointer; transition: all 0.15s; margin-bottom: 2px;
        }
        .jd-nav-item:hover { background: var(--card-hover); color: var(--text); }
        .jd-nav-item.jd-active { background: var(--card); color: var(--text); }
        .jd-nav-item.jd-active svg { color: var(--cyan); }
        .jd-nav-icon-anim { transition: transform 0.25s ease; }
        .jd-nav-item:hover .jd-nav-icon-anim { transform: scale(1.15) rotate(-4deg); }

        .jd-side-label {
          font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: 0.08em;
          color: var(--text-muted); text-transform: uppercase; padding: 0 10px; margin-bottom: 6px; opacity: 0.7;
        }
        .jd-chat-item {
          display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px;
          font-size: 13px; color: var(--text-muted); cursor: pointer; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis; transition: all 0.15s;
        }
        .jd-chat-item:hover { background: var(--card-hover); color: var(--text); }
        .jd-chat-scroll { flex: 1; overflow-y: auto; margin: 0 -4px; padding: 0 4px; }
        .jd-chat-scroll::-webkit-scrollbar { width: 5px; }
        .jd-chat-scroll::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 4px; }

        .jd-user-row {
          display: flex; align-items: center; gap: 10px; padding: 10px; border-top: 1px solid var(--card-border);
          margin-top: 10px;
        }
        .jd-avatar { width: 30px; height: 30px; border-radius: 8px; background: var(--grad); flex-shrink: 0; }
        .jd-user-name { font-size: 13px; font-weight: 700; }
        .jd-user-role { font-size: 11.5px; color: var(--text-muted); }

        /* ---------- Center ---------- */
        .jd-center { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .jd-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 26px; border-bottom: 1px solid var(--card-border);
        }
        .jd-topbar-title { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14.5px; }
        .jd-model-pill {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--cyan);
          background: rgba(34,211,238,0.08); border: 1px solid rgba(34,211,238,0.25);
          padding: 4px 10px; border-radius: 100px;
        }
        .jd-icon-btn {
          width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--card-border);
          background: var(--card); display: flex; align-items: center; justify-content: center;
          color: var(--text); cursor: pointer; transition: all 0.2s;
        }
        .jd-icon-btn:hover { border-color: var(--neon); }

        .jd-thread { flex: 1; overflow-y: auto; padding: 26px; }
        .jd-thread::-webkit-scrollbar { width: 6px; }
        .jd-thread::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 4px; }
        .jd-msg-row { display: flex; gap: 12px; max-width: 760px; margin: 0 auto 22px; }
        .jd-msg-row.jd-user { flex-direction: row-reverse; }
        .jd-msg-avatar { width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; margin-top: 2px; }
        .jd-msg-avatar.jd-assistant { background: var(--grad); }
        .jd-msg-avatar.jd-user-av { background: var(--card); border: 1px solid var(--card-border); }
        .jd-msg-bubble {
          background: var(--card); border: 1px solid var(--card-border); border-radius: 14px;
          padding: 14px 16px; font-size: 14px; line-height: 1.65; max-width: 560px;
        }
        .jd-msg-row.jd-user .jd-msg-bubble { background: var(--royal); border-color: transparent; color: white; }
        .jd-msg-body p { margin: 0 0 6px; }
        .jd-bullet { display: flex; gap: 8px; margin: 4px 0; }
        .jd-bullet-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--cyan); margin-top: 8px; flex-shrink: 0; }
        .jd-cite-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
        .jd-cite-chip {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; padding: 4px 10px; border-radius: 100px;
          background: rgba(123,63,228,0.1); border: 1px solid rgba(123,63,228,0.3); color: var(--purple);
        }
        .jd-cursor { display: inline-block; width: 2px; height: 14px; background: var(--cyan); margin-left: 2px; animation: jd-blink 1s step-start infinite; vertical-align: middle; }
        @keyframes jd-blink { 50% { opacity: 0; } }

        .jd-composer { padding: 16px 26px 22px; }
        .jd-composer-inner {
          max-width: 760px; margin: 0 auto; display: flex; align-items: flex-end; gap: 10px;
          background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; padding: 10px 12px;
        }
        .jd-composer-inner:focus-within { border-color: var(--neon); }
        .jd-composer textarea {
          flex: 1; background: transparent; border: none; outline: none; resize: none;
          color: var(--text); font-family: 'Manrope', sans-serif; font-size: 14px; line-height: 1.5;
          max-height: 120px; padding: 6px 4px;
        }
        .jd-composer textarea::placeholder { color: var(--text-muted); }
        .jd-send-btn {
          width: 34px; height: 34px; border-radius: 9px; border: none; background: var(--grad);
          display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; flex-shrink: 0;
        }
        .jd-send-btn:disabled { opacity: 0.4; cursor: default; }
        .jd-composer-hint { text-align: center; font-size: 11.5px; color: var(--text-muted); margin-top: 8px; }

        /* ---------- Right sidebar ---------- */
        .jd-right { width: 300px; flex-shrink: 0; background: var(--surface); border-left: 1px solid var(--card-border); display: flex; flex-direction: column; }
        .jd-tabs { display: flex; padding: 14px 14px 0; gap: 6px; }
        .jd-tab {
          flex: 1; text-align: center; padding: 8px 4px; font-size: 12px; font-weight: 700; border-radius: 8px;
          cursor: pointer; color: var(--text-muted); transition: all 0.15s;
        }
        .jd-tab.jd-tab-active { background: var(--card); color: var(--text); }
        .jd-right-content { flex: 1; overflow-y: auto; padding: 16px; }
        .jd-right-content::-webkit-scrollbar { width: 5px; }
        .jd-right-content::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 4px; }

        .jd-panel-label { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin: 18px 0 10px; }
        .jd-panel-label:first-child { margin-top: 0; }

        .jd-gauge-card { background: var(--card); border: 1px solid var(--card-border); border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 4px; }
        .jd-gauge-num { font-family: 'IBM Plex Mono', monospace; font-size: 32px; color: var(--cyan); font-weight: 500; }
        .jd-gauge-lbl { font-size: 11.5px; color: var(--text-muted); font-family: 'IBM Plex Mono', monospace; margin-top: 2px; }

        .jd-case-card { background: var(--card); border: 1px solid var(--card-border); border-radius: 12px; padding: 12px; margin-bottom: 8px; cursor: pointer; transition: border-color 0.15s; }
        .jd-case-card:hover { border-color: var(--neon); }
        .jd-case-name { font-size: 13px; font-weight: 700; margin-bottom: 3px; }
        .jd-case-meta { font-size: 11.5px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; }
        .jd-risk-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 5px; }
        .jd-risk-low { background: #34d399; }
        .jd-risk-medium { background: #fbbf24; }
        .jd-risk-high { background: #f87171; }

        .jd-notif-row { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--card-border); }
        .jd-notif-row:last-child { border-bottom: none; }
        .jd-notif-icon { width: 30px; height: 30px; border-radius: 8px; background: var(--card); border: 1px solid var(--card-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--cyan); }
        .jd-notif-text { font-size: 12.5px; line-height: 1.5; }
        .jd-notif-time { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

        .jd-bm-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; padding: 8px 0; border-bottom: 1px solid var(--card-border); color: var(--text-muted); }
        .jd-bm-row:last-child { border-bottom: none; }
        .jd-search-row { font-size: 12px; color: var(--text-muted); padding: 6px 0; font-family: 'IBM Plex Mono', monospace; }

        @media (max-width: 1000px) {
          .jd-right { display: none; }
        }
        @media (max-width: 760px) {
          .jd-left { display: none; }
        }
      `}</style>

      {/* ---------------- Left sidebar ---------------- */}
      <aside className="jd-left">
        <div className="jd-logo">
          <div className="jd-logo-mark"><Scale size={14} color="#fff" /></div>
          JustiMind
        </div>

        <button className="jd-newchat" onClick={() => setMessages([{ role: "assistant", lines: ["New workspace ready. What are we looking at?"], done: true }])}>
          <Plus size={15} /> New chat
        </button>

        <div className="jd-nav-group">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`jd-nav-item ${activeNav === item.label ? "jd-active" : ""}`}
              onClick={() => setActiveNav(item.label)}
            >
              <item.icon size={16} className="jd-nav-icon-anim" />
              {item.label}
            </div>
          ))}
        </div>

        <div className="jd-side-label">Pinned</div>
        <div style={{ marginBottom: 12 }}>
          {PINNED_CHATS.map((c) => (
            <div className="jd-chat-item" key={c.id}><Pin size={13} />{c.title}</div>
          ))}
        </div>

        <div className="jd-side-label">Recent</div>
        <div className="jd-chat-scroll">
          {RECENT_CHATS.map((c) => (
            <div className="jd-chat-item" key={c.id}><MessageSquare size={13} />{c.title}</div>
          ))}
          <div className="jd-chat-item"><Folder size={13} />Folders</div>
        </div>

        <div className="jd-user-row">
          <div className="jd-avatar" />
          <div style={{ flex: 1 }}>
            <div className="jd-user-name">Sakshi</div>
            <div className="jd-user-role">Data Analyst plan</div>
          </div>
          <Settings size={16} color="var(--text-muted)" style={{ cursor: "pointer" }} />
        </div>
      </aside>

      {/* ---------------- Center ---------------- */}
      <main className="jd-center">
        <div className="jd-topbar">
          <div className="jd-topbar-title">
            {activeNav}
            <span className="jd-model-pill jd-mono">JUSTIMIND-CORE</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="jd-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button className="jd-icon-btn"><MoreHorizontal size={15} /></button>
          </div>
        </div>

        <div className="jd-thread" ref={scrollRef}>
          {messages.map((m, i) => (
            <div className={`jd-msg-row ${m.role === "user" ? "jd-user" : ""}`} key={i}>
              <div className={`jd-msg-avatar ${m.role === "user" ? "jd-user-av" : "jd-assistant"}`} />
              <div className="jd-msg-bubble">
                <MessageBody lines={m.lines} />
                {!m.done && <span className="jd-cursor" />}
              </div>
            </div>
          ))}
        </div>

        <div className="jd-composer">
          <div className="jd-composer-inner">
            <button className="jd-icon-btn" style={{ border: "none", background: "transparent" }} aria-label="Attach file">
              <Paperclip size={17} color="var(--text-muted)" />
            </button>
            <textarea
              rows={1}
              placeholder="Ask about a case, section, or upload a filing…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="jd-icon-btn" style={{ border: "none", background: "transparent" }} aria-label="Voice input">
              <Mic size={17} color="var(--text-muted)" />
            </button>
            <button className="jd-send-btn" onClick={sendMessage} disabled={!input.trim() || streaming} aria-label="Send">
              <Send size={15} />
            </button>
          </div>
          <div className="jd-composer-hint">JustiMind can be wrong about legal outcomes — verify before advising a client.</div>
        </div>
      </main>

      {/* ---------------- Right sidebar ---------------- */}
      <aside className="jd-right">
        <div className="jd-tabs">
          {["insights", "activity", "saved"].map((t) => (
            <div key={t} className={`jd-tab ${rightTab === t ? "jd-tab-active" : ""}`} onClick={() => setRightTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
          ))}
        </div>

        <div className="jd-right-content">
          {rightTab === "insights" && (
            <>
              <div className="jd-gauge-card">
                <div className="jd-gauge-num jd-mono">78%</div>
                <div className="jd-gauge-lbl">CURRENT WIN PROBABILITY</div>
              </div>
              <div className="jd-panel-label">Recent cases</div>
              {RECENT_CASES.map((c) => (
                <div className="jd-case-card" key={c.name}>
                  <div className="jd-case-name">{c.name}</div>
                  <div className="jd-case-meta">
                    <span><span className={`jd-risk-dot jd-risk-${c.risk}`} />{c.court}</span>
                    <span>{c.status}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {rightTab === "activity" && (
            <>
              <div className="jd-panel-label">Notifications</div>
              {NOTIFICATIONS.map((n, i) => (
                <div className="jd-notif-row" key={i}>
                  <div className="jd-notif-icon"><n.icon size={14} /></div>
                  <div>
                    <div className="jd-notif-text">{n.text}</div>
                    <div className="jd-notif-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {rightTab === "saved" && (
            <>
              <div className="jd-panel-label">Bookmarks</div>
              {BOOKMARKS.map((b) => (
                <div className="jd-bm-row" key={b}><Bookmark size={13} color="var(--purple)" />{b}</div>
              ))}
              <div className="jd-panel-label">Search history</div>
              {SEARCH_HISTORY.map((s) => (
                <div className="jd-search-row" key={s}>{s}</div>
              ))}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
