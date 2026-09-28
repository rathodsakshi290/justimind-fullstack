import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, Minimize2, Maximize2, Scale, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import LegalMarkdown from "./LegalMarkdown";

const QUICK_PROMPTS = [
  "What is the statute of limitations for debt recovery?",
  "Draft a mutual confidentiality clause with a 2-year term.",
  "What standard of proof is required in civil fraud?",
];

export default function FloatingCopilot() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I am your **JustiMind Legal Copilot** powered by Google Gemini. Ask me any legal query, statute check, or contract question from any page.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && isOpen && !isMinimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError("");
    setInput("");
    const userMsg = { id: `u-${Date.now()}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const reply = await api.sendChatMessage(token, text);
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setError(err.message || "Failed to reach AI assistant.");
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Could not connect to Gemini service: ${err.message}.`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
  };

  if (!isOpen) {
    return (
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999 }}>
        <button
          onClick={() => setIsOpen(true)}
          className="jm-animate-pop-in jm-pulse-gold"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--grad-gold)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            color: "var(--accent-contrast)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.6), 0 0 20px var(--gold-glow)",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          title="Open JustiMind AI Legal Copilot"
        >
          <Sparkles size={24} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="jm-animate-pop-in"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: isMinimized ? 290 : 390,
        height: isMinimized ? 48 : 540,
        background: "var(--card)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--card-border-glow)",
        borderRadius: 14,
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px var(--gold-glow)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 999,
        transition: "height 0.25s ease, width 0.25s ease",
      }}
    >
      {/* Copilot Header */}
      <div
        style={{
          background: "var(--surface)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--card-border)",
          color: "var(--text)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--grad-gold)", color: "var(--accent-contrast)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Scale size={13} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              JustiMind Copilot
              <span className="jm-badge jm-badge-gold" style={{ fontSize: 9, padding: "1px 5px" }}>AI</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
          <button
            onClick={() => setMessages([messages[0]])}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
            title="Clear Chat History"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
            title="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: 14,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "var(--bg)",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  className={m.role === "user" ? "jm-chat-bubble-user" : "jm-chat-bubble-ai"}
                  style={{
                    maxWidth: "88%",
                    padding: "12px 16px",
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                >
                  <LegalMarkdown content={m.content} role={m.role} />
                </div>
              </div>
            ))}

            {sending && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gold)", fontSize: 12, padding: "4px 8px" }}>
                <Loader2 size={13} className="jm-spin" /> JustiMind Copilot is analyzing statutes...
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div style={{ padding: "8px 12px", background: "var(--surface)", borderTop: "1px solid var(--card-border)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 5 }} className="jm-mono">
                Suggested Quick Inquiries
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {QUICK_PROMPTS.map((qp, i) => (
                  <div
                    key={i}
                    onClick={() => handleQuickPrompt(qp)}
                    style={{
                      fontSize: 11.5,
                      padding: "5px 8px",
                      borderRadius: 4,
                      background: "var(--card)",
                      border: "1px solid var(--card-border)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--text)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                  >
                    • {qp}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              gap: 8,
              padding: 10,
              borderTop: "1px solid var(--card-border)",
              background: "var(--card)",
              alignItems: "center",
            }}
          >
            <input
              style={{
                flex: 1,
                background: "var(--input-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 8,
                padding: "9px 12px",
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
              }}
              placeholder="Ask Copilot a legal question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="jm-btn jm-btn--primary"
              disabled={!input.trim() || sending}
              style={{ height: 36, padding: "0 12px", borderRadius: 8 }}
            >
              <Send size={13} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
