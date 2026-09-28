import React, { useState, useEffect, useRef } from "react";
import {
  FileText, Loader2, AlertCircle, Info, Clock, UploadCloud,
  CheckCircle2, X, Download, Sparkles, Scale, Check, ArrowRight
} from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../lib/api";

function SafeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
}

const SAMPLE_CASES = [
  {
    title: "Ferreira v. State of Maharashtra",
    tag: "Criminal Appeal",
    text: `IN THE HIGH COURT OF JUDICATURE AT BOMBAY
CRIMINAL APPELLATE JURISDICTION
CRIMINAL APPEAL NO. 412 OF 2024

Arun Ferreira ... Appellant
Versus
State of Maharashtra & Anr. ... Respondents

FACTS AND SUBMISSIONS:
1. The appellant was arraigned under Sections 120B, 121, 121A of the IPC and Sections 13, 16, 17, 18 of the Unlawful Activities (Prevention) Act, 1967.
2. The prosecution relies heavily upon digital evidence recovered from electronic devices (hard disk drive marked as Exhibit C).
3. The forensic clone of Exhibit C was prepared 14 days after seizure without contemporaneous hash logs (SHA-256) or chain-of-custody seals recorded in the panchnama.
4. The appellant has remained in continuous judicial custody for over 4 years without commencement of trial.

LEGAL ISSUES:
1. Whether non-compliance with standard digital chain-of-custody protocols invalidates electronic admissibility under Section 65B(4) of the Evidence Act.
2. Whether prolonged incarceration without trial violates fundamental rights under Article 21 of the Constitution.

PRAYER:
Grant of regular bail on parity and on the grounds of constitutional deprivation of speedy trial.`
  },
  {
    title: "Vanguard Tech Group Merger Dispute",
    tag: "Corporate / Antitrust",
    text: `BEFORE THE FEDERAL TRADE COMMISSION & APPELLATE TRIBUNAL
IN THE MATTER OF: VANGUARD TECH GROUP & AURA CLOUD INC.

BACKGROUND & FILING FACTS:
1. Vanguard Tech Group seeks approval for the $4.2B acquisition of Aura Cloud Inc., a leading provider of hybrid cloud orchestration.
2. Opposing coalitions claim the merger creates anti-competitive horizontal market concentration exceeding 45% in enterprise infrastructure.
3. Vanguard submits evidence demonstrating that hybrid orchestration is an open standard with over 14 international competitors possessing interchangeable APIs.
4. Independent economic analysis confirms customer churn rate is 18% annually, indicating low barriers to market entry.

LEGAL ISSUES:
1. Does the combined entity violate Section 7 of the Clayton Act?
2. Are behavioral remedies (open API guarantees for 5 years) sufficient to mitigate competitive foreclosure?`
  },
  {
    title: "MedTech Innovations v. Biosurge Surgical",
    tag: "Patent Infringement",
    text: `UNITED STATES DISTRICT COURT FOR THE DISTRICT OF DELAWARE
CIVIL ACTION NO. 24-CV-1089

MedTech Innovations LLC ... Plaintiff
v.
Biosurge Surgical Inc. ... Defendant

COMPLAINT FOR PATENT INFRINGEMENT & PRELIMINARY INJUNCTION:
1. MedTech is the assignee of U.S. Patent No. 9,845,231 entitled "Robotic Steerable Catheter with Real-Time Haptic Feedback Loops."
2. Biosurge has marketed and distributed the 'SurgeDrive-X' robotic system utilizing identical tactile sensor feedback arrays.
3. Biosurge asserts invalidity under 35 U.S.C. § 102, citing Japanese Patent Application JPO 2018-0924 as anticipatory prior art.
4. MedTech proves priority of invention dating back to laboratory prototype demonstrations in Q3 2017.`
  }
];

export default function SummarizerPage() {
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pastCases, setPastCases] = useState([]);
  const [activeTab, setActiveTab] = useState("summary");
  const fileInputRef = useRef(null);

  const loadPastCases = () => {
    api.listCases(token).then(setPastCases).catch(() => {});
  };

  useEffect(loadPastCases, [token]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const data = await api.extractCaseText(token, file);
      setTitle(data.title || file.name.replace(/\.[^/.]+$/, ""));
      setText(data.text);
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        charCount: data.char_count,
      });
    } catch (err) {
      setError(err.message || "Failed to parse case file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const syntheticEvent = { target: { files: [file] } };
      handleFileUpload(syntheticEvent);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setTitle("");
    setText("");
  };

  const loadSampleCase = (sample) => {
    setTitle(sample.title);
    setText(sample.text);
    setUploadedFile(null);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please upload a case file or enter case text to summarize.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await api.summarizeCase(token, {
        title: title || "Untitled Case",
        text,
        language: language || "en",
      });
      setResult(res);
      loadPastCases();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const parsed = SafeParse(result.summary_json);
    if (!parsed) return;

    const content = `# Case Summary: ${result.title}\nConfidence Score: ${parsed.confidence_score}%\nDate: ${new Date().toLocaleDateString()}\n\n## Executive Summary\n${parsed.executive_summary}\n\n## Key Facts\n${(parsed.facts || []).map(f => `- ${f}`).join("\n")}\n\n## Legal Issues\n${(parsed.issues || []).map(i => `- ${i}`).join("\n")}\n\n## Evidence Strength\n${(parsed.evidence || []).map(e => `- ${e.name}: ${e.strength}%`).join("\n")}\n\n## Judgment Prediction\n${parsed.judgment_prediction}\n\n## Strategic Recommendations\n${(parsed.recommendations || []).map(r => `- ${r}`).join("\n")}`;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, "_")}_Summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parsed = result ? SafeParse(result.summary_json) : null;

  return (
    <Layout title="Case Summarizer">
      <div className="jm-info">
        <Info size={15} style={{ flexShrink: 0, marginTop: 1, color: "var(--blue)" }} />
        Upload PDF, DOCX, or text filings to generate a structured AI case brief with facts, evidentiary strength, timeline, and judgment prediction.
      </div>

      {/* Pre-Loaded Sample Case Selector */}
      <div style={{ marginBottom: 18 }}>
        <div className="jm-card-label" style={{ marginBottom: 8, color: "var(--gold-light)" }}>
          <Sparkles size={13} style={{ color: "var(--gold)" }} /> Try Sample Precedent Case
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SAMPLE_CASES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              className="jm-btn"
              onClick={() => loadSampleCase(sample)}
              style={{
                fontSize: 12.5,
                padding: "7px 12px",
                background: title === sample.title ? "var(--grad-gold)" : "var(--surface)",
                borderColor: title === sample.title ? "var(--gold)" : "var(--card-border)",
                color: title === sample.title ? "var(--accent-contrast)" : "var(--text-secondary)",
                boxShadow: title === sample.title ? "0 2px 10px var(--gold-glow)" : "none",
              }}
            >
              <span>{sample.title}</span>
              <span className="jm-badge jm-badge-gold" style={{ fontSize: 10, padding: "1px 5px", background: title === sample.title ? "rgba(0,0,0,0.15)" : undefined, color: title === sample.title ? "var(--accent-contrast)" : undefined }}>
                {sample.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 20 }}>
        <div className="jm-card">
          {error && <div className="jm-error"><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{error}</div>}

          {/* Document Upload Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              border: "2px dashed var(--card-border)",
              borderRadius: 10,
              padding: "24px 16px",
              textAlign: "center",
              cursor: uploading ? "wait" : "pointer",
              background: "var(--surface)",
              marginBottom: 20,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc,.txt,.md,.rtf"
              style={{ display: "none" }}
            />
            {uploading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Loader2 size={26} className="jm-spin" style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>Extracting filing text via OCR pipeline…</span>
              </div>
            ) : uploadedFile ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(212, 175, 55, 0.12)", border: "1px solid rgba(212, 175, 55, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-light)" }}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{uploadedFile.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {uploadedFile.size} • {uploadedFile.charCount?.toLocaleString()} characters extracted
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearUploadedFile}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  title="Remove file"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <UploadCloud size={32} style={{ marginBottom: 2, color: "var(--gold)" }} />
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>Click to upload case brief or drag & drop</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>PDF (.pdf), Word (.docx), Plain Text (.txt, .md)</div>
              </div>
            )}
          </div>

          <form onSubmit={submit}>
            <div className="jm-field">
              <label>Case title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Ferreira v. State of Maharashtra" />
            </div>
            <div className="jm-field">
              <label>Case filings & pleadings text</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} required style={{ minHeight: 160 }} placeholder="Paste case facts, arguments, or select a sample case above…" />
            </div>
            <button className="jm-btn jm-btn--primary" disabled={loading || uploading || !text.trim()}>
              {loading ? <><Loader2 size={15} className="jm-spin" /> Summarizing with Gemini AI…</> : <><FileText size={15} /> Generate Case Summary</>}
            </button>
          </form>

          {/* Structured Analysis Results */}
          {parsed && (
            <div className="jm-animate-fade-in-up" style={{ marginTop: 28, borderTop: "1px solid var(--card-border)", paddingTop: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="jm-badge jm-badge-gold" style={{ fontSize: 12, padding: "4px 10px" }}>
                    Judicial Confidence: {parsed.confidence_score ?? 92}%
                  </span>
                </div>
                <button onClick={handleExport} className="jm-btn" style={{ padding: "5px 12px", fontSize: 12 }}>
                  <Download size={13} /> Export Report
                </button>
              </div>

              {/* Tab Navigation */}
              <div style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--card-border)", paddingBottom: 8, marginBottom: 16, overflowX: "auto" }}>
                {[
                  { id: "summary", label: "Executive Summary" },
                  { id: "facts", label: `Facts (${parsed.facts?.length || 0})` },
                  { id: "issues", label: `Legal Issues (${parsed.issues?.length || 0})` },
                  { id: "evidence", label: "Evidence Strength" },
                  { id: "judgment", label: "Judgment & Strategy" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      background: activeTab === t.id ? "var(--grad-gold)" : "transparent",
                      border: activeTab === t.id ? "1px solid var(--gold)" : "none",
                      color: activeTab === t.id ? "var(--accent-contrast)" : "var(--text-muted)",
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      boxShadow: activeTab === t.id ? "0 2px 8px var(--gold-glow)" : "none",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "summary" && (
                <div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>{parsed.executive_summary}</p>
                  {parsed.risk_analysis && (
                    <div style={{ background: "var(--surface)", border: "1px solid var(--card-border)", borderRadius: 8, padding: 14, marginTop: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 4, color: "var(--gold-light)" }}>Risk Assessment</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{parsed.risk_analysis}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "facts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(parsed.facts || []).map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--surface)", padding: "10px 14px", borderRadius: 6 }}>
                      <span className="jm-mono" style={{ color: "var(--gold)", fontWeight: 700, fontSize: 12 }}>#{i+1}</span>
                      <span style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "issues" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(parsed.issues || []).map((issue, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--surface)", padding: "12px 14px", borderRadius: 6, borderLeft: "3px solid var(--gold)" }}>
                      <Scale size={16} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.55 }}>{issue}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "evidence" && (
                <div>
                  {(parsed.evidence || []).length === 0 ? (
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No discrete evidence items extracted.</div>
                  ) : (
                    (parsed.evidence || []).map((ev, i) => (
                      <div key={i} style={{ marginBottom: 14, background: "var(--surface)", padding: 12, borderRadius: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                          <span>{ev.name}</span>
                          <span className="jm-mono" style={{ color: "var(--gold-light)" }}>{ev.strength}% Strength</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: "var(--card-border)" }}>
                          <div
                            style={{
                              width: `${ev.strength}%`,
                              height: "100%",
                              borderRadius: 3,
                              background: "var(--grad-gold)",
                              boxShadow: "0 0 10px var(--gold-glow)",
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "judgment" && (
                <div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--card-border)", borderRadius: 8, padding: 14, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6, color: "var(--gold-light)" }}>Predicted Judicial Outcome</div>
                    <p style={{ fontSize: 13.5, color: "var(--text)", margin: 0, lineHeight: 1.6 }}>{parsed.judgment_prediction}</p>
                  </div>

                  <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>Recommended Next Steps</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(parsed.recommendations || []).map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--text-secondary)" }}>
                        <Check size={14} style={{ color: "var(--good)", flexShrink: 0, marginTop: 2 }} />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Past Summarized Cases */}
        <div className="jm-card" style={{ alignSelf: "start" }}>
          <div className="jm-card-label">
            <Clock size={12} style={{ marginRight: 5, verticalAlign: -2 }} /> Past Case Summaries
          </div>
          {pastCases.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>No cases summarized yet. Run one to populate history.</div>
          ) : (
            pastCases.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setTitle(c.title);
                  setText(c.text);
                  setResult(c);
                }}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid var(--card-border)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--text)" }}>{c.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                  Confidence: <span style={{ color: "var(--gold-light)" }}>{c.confidence ?? "—"}%</span> • {new Date(c.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
