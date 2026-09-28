import React, { useState } from "react";
import { Copy, Check, Volume2, VolumeX, Scale } from "lucide-react";

export default function LegalMarkdown({ content, role = "assistant", onCitationClick }) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const cleanText = content
      .replace(/\[\[cite:[^\]]+\]\]/g, "")
      .replace(/[#*_`~-]/g, " ")
      .trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const lines = content.split("\n");

  const renderInlineText = (text) => {
    const citeRegex = /\[\[cite:([^\]]+)\]\]/g;
    const elements = [];
    let lastIdx = 0;
    let match;

    while ((match = citeRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        elements.push(parseFormatting(text.substring(lastIdx, match.index)));
      }
      const citeName = match[1];
      elements.push(
        <span
          key={`cite-${match.index}`}
          onClick={() => onCitationClick ? onCitationClick(citeName) : null}
          className="jm-badge jm-badge-gold"
          style={{
            cursor: "pointer",
            margin: "0 4px",
            fontSize: 11,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            transition: "all 0.2s ease",
          }}
          title={`Click to inspect legal precedent: ${citeName}`}
        >
          <Scale size={11} />
          {citeName}
        </span>
      );
      lastIdx = citeRegex.lastIndex;
    }
    if (lastIdx < text.length) {
      elements.push(parseFormatting(text.substring(lastIdx)));
    }
    return elements.length > 0 ? elements : parseFormatting(text);
  };

  const parseFormatting = (text) => {
    const boldCodeParts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return boldCodeParts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <strong key={i} style={{ color: role === "user" ? "#FFFFFF" : "var(--text)", fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
      }
      if (p.startsWith("`") && p.endsWith("`")) {
        return (
          <code
            key={i}
            className="jm-mono"
            style={{
              background: role === "user" ? "rgba(255, 255, 255, 0.15)" : "rgba(56, 189, 248, 0.08)",
              color: role === "user" ? "#FFFFFF" : "var(--blue)",
              border: role === "user" ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid rgba(56, 189, 248, 0.2)",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: "0.9em",
            }}
          >
            {p.slice(1, -1)}
          </code>
        );
      }
      return <span key={i}>{p}</span>;
    });
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div style={{ fontSize: 14, lineHeight: 1.68, color: role === "user" ? "#FFFFFF" : "var(--text)" }}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={idx} style={{ height: 10 }} />;
          }

          if (trimmed.startsWith("### ")) {
            return (
              <h4
                key={idx}
                className="jm-display"
                style={{
                  fontSize: 15.5,
                  fontWeight: 600,
                  color: "var(--gold-light)",
                  margin: "16px 0 6px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {renderInlineText(trimmed.slice(4))}
              </h4>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h3
                key={idx}
                className="jm-display"
                style={{
                  fontSize: 17.5,
                  fontWeight: 600,
                  color: "var(--text)",
                  margin: "18px 0 8px",
                  borderBottom: "1px solid var(--card-border)",
                  paddingBottom: 5,
                }}
              >
                {renderInlineText(trimmed.slice(3))}
              </h3>
            );
          }
          if (trimmed.startsWith("# ")) {
            return (
              <h2
                key={idx}
                className="jm-display"
                style={{ fontSize: 20, fontWeight: 700, margin: "22px 0 10px", color: "var(--text)" }}
              >
                {renderInlineText(trimmed.slice(2))}
              </h2>
            );
          }

          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  margin: "4px 0",
                  paddingLeft: 4,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: role === "user" ? "#FFFFFF" : "var(--gold)",
                    marginTop: 8,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>{renderInlineText(trimmed.slice(2))}</div>
              </div>
            );
          }

          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+)\.\s(.*)/);
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  margin: "5px 0",
                  paddingLeft: 4,
                }}
              >
                <span className="jm-mono" style={{ color: role === "user" ? "#FFFFFF" : "var(--gold)", fontWeight: 700, fontSize: 13, minWidth: 20 }}>
                  {match[1]}.
                </span>
                <div style={{ flex: 1 }}>{renderInlineText(match[2])}</div>
              </div>
            );
          }

          if (trimmed.startsWith("> ")) {
            return (
              <div
                key={idx}
                style={{
                  borderLeft: "3px solid var(--gold)",
                  background: "rgba(212, 175, 55, 0.06)",
                  padding: "10px 16px",
                  borderRadius: "0 8px 8px 0",
                  margin: "10px 0",
                  fontSize: 13.5,
                  fontStyle: "italic",
                  color: "var(--text-secondary)",
                }}
              >
                {renderInlineText(trimmed.slice(2))}
              </div>
            );
          }

          return (
            <p key={idx} style={{ margin: "4px 0" }}>
              {renderInlineText(trimmed)}
            </p>
          );
        })}
      </div>

      {role === "assistant" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 14,
            paddingTop: 10,
            borderTop: "1px solid var(--card-border)",
            fontSize: 11.5,
            color: "var(--text-muted)",
          }}
        >
          <button
            onClick={handleCopy}
            style={{
              background: "transparent",
              border: "none",
              color: copied ? "var(--gold)" : "var(--text-muted)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 11.5,
              fontWeight: 600,
              transition: "all 0.15s ease",
            }}
            title="Copy opinion to clipboard"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy Brief"}</span>
          </button>

          {("speechSynthesis" in window) && (
            <button
              onClick={handleSpeak}
              style={{
                background: speaking ? "rgba(212, 175, 55, 0.15)" : "transparent",
                border: "none",
                color: speaking ? "var(--gold)" : "var(--text-muted)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: 11.5,
                fontWeight: 600,
                transition: "all 0.15s ease",
              }}
              title="Listen to legal brief"
            >
              {speaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span>{speaking ? "Stop Audio" : "Read Aloud"}</span>
            </button>
          )}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
            <span className="jm-mono" style={{ fontSize: 10.5, color: "var(--text-dim)" }}>
              Gemini Legal Intelligence
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
