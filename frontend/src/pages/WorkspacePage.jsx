import React, { useState, useEffect, useRef } from "react";
import {
  Send, Loader2, AlertCircle, Info, Paperclip, X, Trash2, FileText,
  Sparkles, Download, Shield, ArrowRight, Scale, BookOpen, Clock
} from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import LegalMarkdown from "../components/LegalMarkdown";

const PROMPT_CATEGORIES = [
  {
    icon: Shield,
    title: "Contract Risk Review",
    prompt: "Review the indemnification and limitation of liability clauses in a SaaS agreement. What high-risk terms should I redline?",
  },
  {
    icon: Scale,
    title: "Statute Interpretation",
    prompt: "Explain the essential elements to establish liability under Section 138 of the Negotiable Instruments Act with latest case precedents.",
  },
  {
    icon: BookOpen,
    title: "Chain of Custody Analysis",
    prompt: "What are the evidentiary standards for digital chain of custody and forensic hash validation in criminal proceedings?",
  },
  {
    icon: Sparkles,
    title: "Drafting Assistance",
    prompt: "Draft an ironclad Non-Disclosure Agreement (NDA) non-solicitation and intellectual property assignment clause under Delaware law.",
  },
];

export default function WorkspacePage() {
  const { token, user } = useAuth();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [attachedDoc, setAttachedDoc] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api.getChatHistory(token)
      .then((h) => { if (!cancelled) setMessages(h); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoadingHistory(false); });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleFileAttach = async (file) => {
    if (!file) return;
    setError("");
    setUploadingDoc(true);
    try {
      const extracted = await api.extractDocumentText(token, file);
      setAttachedDoc({
        name: file.name,
        title: extracted.title,
        text: extracted.text,
        charCount: extracted.char_count,
        size: (file.size / 1024).toFixed(1) + " KB",
      });
    } catch (err) {
      setError(err.message || "Failed to parse attached document.");
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileAttach(file);
  };

  const handleClearHistory = async () => {
    try {
      await api.clearChatHistory(token);
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: "Chat history cleared. How may I assist your legal research and drafting today?",
          created_at: new Date().toISOString(),
        }
      ]);
      setShowClearModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map((m) => `### ${m.role === "user" ? "Client / Counsel" : "JustiMind Legal AI"} (${new Date(m.created_at || Date.now()).toLocaleTimeString()}):\n\n${m.content}\n\n---\n`)
      .join("\n");

    const blob = new Blob([`# JustiMind Legal AI Workspace Transcript\nDate: ${new Date().toLocaleDateString()}\nUser: ${user?.full_name || "User"}\n\n${transcript}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `JustiMind_Legal_Chat_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const send = async (e) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if ((!text && !attachedDoc) || sending) return;

    let fullPrompt = text;
    if (attachedDoc) {
      fullPrompt = `[Attached Document: ${attachedDoc.name}]\n\n--- DOCUMENT CONTENT ---\n${attachedDoc.text}\n--- END DOCUMENT ---\n\nUser Question/Instruction:\n${text || "Please analyze this attached document, summarize key clauses, and highlight potential risks and redlines."}`;
    }

    const displayMsg = text || (attachedDoc ? `📄 Analyzed document: ${attachedDoc.name}` : "");

    setError("");
    setInput("");
    const docToClear = attachedDoc;
    setAttachedDoc(null);

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: displayMsg + (docToClear ? `\n\n*Attached: ${docToClear.name} (${docToClear.size})*` : ""),
      created_at: new Date().toISOString(),
    };

    setMessages((m) => [...m, tempUserMsg]);
    setSending(true);

    try {
      const reply = await api.sendChatMessage(token, fullPrompt, language);
      setMessages((m) => [...m, reply]);
    } catch (err) {
      setError(err.message || "Failed to reach AI server.");
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Encountered an issue connecting to Gemini AI: ${err.message}.`,
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout title={t("workspace.title")}>
      {/* Information Header Banner */}
      <div className="jm-info" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
          <span>
            Connected to <strong>Google Gemini AI</strong> engine. Upload contracts or query statute precedents. Search rulings on our live <Link to="/search" style={{ color: "var(--gold)", fontWeight: 700, textDecoration: "underline" }}>Legal Search</Link>.
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {messages.length > 1 && (
            <>
              <button
                onClick={handleExportChat}
                className="jm-btn"
                style={{ padding: "5px 12px", fontSize: 12, height: 30 }}
                title="Export transcript"
              >
                <Download size={12} /> Export Transcript
              </button>
              <button
                onClick={() => setShowClearModal(true)}
                className="jm-btn"
                style={{ padding: "5px 12px", fontSize: 12, height: 30 }}
                title="Clear chat history"
              >
                <Trash2 size={12} /> Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <div
          className="jm-card"
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 230px)",
            padding: 0,
            border: isDragOver ? "2px dashed var(--gold)" : "1px solid var(--card-border)",
            transition: "all 0.2s ease",
          }}
        >
          {/* Messages Container */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "22px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: "var(--chat-area-bg)",
            }}
          >
            {loadingHistory && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, color: "var(--text-muted)", gap: 10 }}>
                <Loader2 size={18} className="jm-spin" style={{ color: "var(--gold)" }} /> Loading your legal conversation...
              </div>
            )}

            {!loadingHistory && messages.length <= 1 && (
              <div className="jm-animate-fade-in-up" style={{ margin: "20px auto 40px", maxWidth: 820, width: "100%" }}>
                <div style={{ textAlign: "center", marginBottom: 30 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "var(--grad-gold)",
                      color: "var(--accent-contrast)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      boxShadow: "0 4px 20px var(--gold-glow)",
                    }}
                  >
                    <Scale size={24} />
                  </div>
                  <h3 className="jm-display" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>
                    How can JustiMind assist your practice today?
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                    Select a prompt starter or upload a legal filing (PDF, DOCX) to get an instant AI analysis.
                  </p>
                </div>

                {/* Prompt Starters */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14 }}>
                  {PROMPT_CATEGORIES.map((cat, idx) => (
                    <div
                      key={idx}
                      onClick={() => { setInput(cat.prompt); }}
                      className="jm-card"
                      style={{
                        padding: "16px 18px",
                        cursor: "pointer",
                        background: "var(--surface)",
                        display: "flex",
                        gap: 14,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: "var(--gold-glow)",
                          border: "1px solid var(--card-border-glow)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--gold)",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <cat.icon size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: "var(--text)" }}>
                          {cat.title}
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
                          {cat.prompt}
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: "var(--gold)", alignSelf: "center" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Bubbles */}
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  className={`jm-animate-pop-in ${m.role === "user" ? "jm-chat-bubble-user" : "jm-chat-bubble-ai"}`}
                  style={{
                    maxWidth: m.role === "user" ? "75%" : "85%",
                    padding: "16px 20px",
                    position: "relative",
                  }}
                >
                  <LegalMarkdown content={m.content} role={m.role} />
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {sending && (
              <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-muted)", fontSize: 13, padding: "8px 4px" }}>
                <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 14px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--card-border)" }}>
                  <span className="jm-typing-dot" />
                  <span className="jm-typing-dot" />
                  <span className="jm-typing-dot" />
                  <span style={{ fontSize: 12.5, marginLeft: 8, color: "var(--text)", fontWeight: 600 }}>Gemini is formulating legal opinion...</span>
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="jm-error" style={{ margin: "0 24px 12px" }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          {/* Attached Document Preview */}
          {attachedDoc && (
            <div
              className="jm-animate-pop-in"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                borderRadius: 8,
                padding: "8px 14px",
                margin: "0 24px 10px",
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={16} style={{ color: "var(--blue)" }} />
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{attachedDoc.name}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  ({attachedDoc.size} • {attachedDoc.charCount?.toLocaleString()} chars)
                </span>
              </div>
              <button
                onClick={() => setAttachedDoc(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                title="Remove attachment"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Bottom Chat Input Form */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--card-border)",
              background: "var(--card)",
            }}
          >
            <form onSubmit={send} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileAttach(e.target.files?.[0])}
                accept=".pdf,.docx,.doc,.txt,.md,.rtf"
                style={{ display: "none" }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingDoc || sending}
                className="jm-icon-btn"
                title="Attach document (PDF, DOCX, TXT)"
                style={{ flexShrink: 0, height: 44, width: 44, borderRadius: 8 }}
              >
                {uploadingDoc ? <Loader2 size={16} className="jm-spin" style={{ color: "var(--gold)" }} /> : <Paperclip size={16} />}
              </button>

              <input
                style={{
                  flex: 1,
                  background: "var(--input-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  color: "var(--text)",
                  fontSize: 14,
                  outline: "none",
                }}
                placeholder={attachedDoc ? "Ask questions about the attached contract or draft..." : t("workspace.inputPlaceholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button
                type="submit"
                className="jm-btn jm-btn--primary"
                disabled={(!input.trim() && !attachedDoc) || sending || uploadingDoc}
                style={{ height: 44, padding: "0 18px", borderRadius: 8 }}
              >
                {sending ? <Loader2 size={16} className="jm-spin" /> : <><Send size={16} /> {t("workspace.send")}</>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div className="jm-card jm-animate-pop-in" style={{ maxWidth: 420, width: "100%", padding: 26, border: "1px solid var(--card-border-glow)" }}>
            <h3 className="jm-display" style={{ fontSize: 19, margin: "0 0 8px" }}>
              Clear Legal Chat History?
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginBottom: 22, lineHeight: 1.55 }}>
              This will permanently delete all prior messages in your session.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="jm-btn" onClick={() => setShowClearModal(false)}>
                Cancel
              </button>
              <button
                className="jm-btn jm-btn--primary"
                onClick={handleClearHistory}
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
