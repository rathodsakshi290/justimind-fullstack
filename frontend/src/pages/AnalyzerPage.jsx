import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSearch2, Loader2, AlertCircle, Info, UploadCloud,
  CheckCircle2, X, Sparkles, Copy, Check, ShieldAlert, Cpu,
  Globe, Languages, ArrowRightLeft, BookOpen, Scale
} from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../lib/api";

function SafeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
}

const SAMPLE_CONTRACTS = [
  {
    title: "Master Services Agreement (MSA)",
    text: `MASTER SERVICES AGREEMENT
Between TechVanguard Corp ("Client") and Apex Global Solutions ("Vendor")

SECTION 8: INDEMNIFICATION & LIABILITY
8.1 Vendor shall unconditionally defend, indemnify, and hold harmless Client from any and all third-party claims, damages, liabilities, and expenses arising out of any breach of warranty, negligence, or willful misconduct.
8.2 IN NO EVENT SHALL CLIENT BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, OR PUNITIVE DAMAGES. CLIENT'S TOTAL LIABILITY SHALL NOT EXCEED $1,000, REGARDLESS OF THE CAUSE OF ACTION.

SECTION 11: DATA PRIVACY & SECURITY
11.1 Vendor processes user personal data on behalf of Client. Vendor may transfer user data to third-party sub-processors without prior written notice to Client.
11.2 Vendor shall retain all archived log data indefinitely for operational telemetry analysis.`
  },
  {
    title: "Mutual Non-Disclosure Agreement (NDA)",
    text: `MUTUAL NON-DISCLOSURE & PROPRIETARY RIGHTS AGREEMENT

1. DEFINITIONS: "Confidential Information" includes all business, technical, or financial data disclosed orally or in writing.
2. NON-SOLICITATION: For a period of five (5) years following the termination of this Agreement, neither party shall solicit, hire, or engage any employee or contractor of the other party worldwide without liquidated damages of $500,000.
3. GOVERNING LAW: This Agreement shall be governed exclusively by the laws of the State of Delaware without regard to conflict of law principles.`
  },
];

const SAMPLE_TRANSLATION_CLAUSES = [
  {
    title: "Indemnification & Defense Clause",
    text: `The indemnifying party shall defend, indemnify, and hold harmless the other party against any third-party claims arising under [[cite:Delaware General Corporation Law § 145]].`,
  },
  {
    title: "Limitation of Monetary Liability",
    text: `Neither party's aggregate liability under this Agreement shall exceed the total fees paid in the preceding twelve (12) months, subject to statutory exceptions under [[cite:BGB § 276]].`,
  },
  {
    title: "Confidentiality & Non-Disclosure",
    text: `The Receiving Party agrees to maintain confidential all proprietary legal disclosures pursuant to [[cite:GDPR Art. 28]] and trade secret statutes.`,
  },
  {
    title: "Termination Notice & Cure Period",
    text: `Either party may terminate this Agreement upon thirty (30) days written notice in the event of an uncured material breach under [[cite:UCC § 2-106]].`,
  }
];

export default function AnalyzerPage() {
  const { token } = useAuth();
  const { t, language, SUPPORTED_LANGUAGES, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("audit"); // "audit" | "translate"

  // Risk Audit state
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pastDocs, setPastDocs] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Cross-Jurisdiction Legal Translator state
  const [transSourceLang, setTransSourceLang] = useState("auto");
  const [transTargetLang, setTransTargetLang] = useState(language || "es");
  const [transText, setTransText] = useState("");
  const [transResult, setTransResult] = useState(null);
  const [transLoading, setTransLoading] = useState(false);
  const [transError, setTransError] = useState("");
  const [transCopied, setTransCopied] = useState(false);
  const [preserveCitations, setPreserveCitations] = useState(true);

  const fileInputRef = useRef(null);

  const loadPastDocs = () => {
    api.listDocuments(token).then(setPastDocs).catch(() => {});
  };

  useEffect(() => {
    loadPastDocs();
  }, [token]);

  // Keep translator target in sync with active app language if not manually set
  useEffect(() => {
    if (language && language !== transTargetLang) {
      setTransTargetLang(language);
    }
  }, [language]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const data = await api.extractDocumentText(token, file);
      setTitle(data.title || file.name.replace(/\.[^/.]+$/, ""));
      setText(data.text);
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        charCount: data.char_count,
      });
    } catch (err) {
      setError(err.message || "Failed to parse document file.");
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

  const loadSampleContract = (sample) => {
    setTitle(sample.title);
    setText(sample.text);
    setUploadedFile(null);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please upload a document or paste contract text to analyze.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await api.analyzeDocument(token, {
        title: title || "Untitled Document",
        text,
        language: language || "en",
      });
      setResult(res);
      loadPastDocs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRedline = (suggestedText, idx) => {
    navigator.clipboard.writeText(suggestedText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Translation handler
  const handleTranslateClause = async (e) => {
    if (e) e.preventDefault();
    if (!transText.trim()) {
      setTransError("Please enter a legal clause or statutory text to translate.");
      return;
    }
    setTransError("");
    setTransLoading(true);
    try {
      const res = await api.translateLegalText(token, {
        text: transText,
        source_lang: transSourceLang,
        target_lang: transTargetLang,
        preserve_citations: preserveCitations,
      });
      setTransResult(res);
    } catch (err) {
      setTransError(err.message || "Legal translation failed.");
    } finally {
      setTransLoading(false);
    }
  };

  const handleCopyTranslation = () => {
    if (!transResult?.translated_text) return;
    navigator.clipboard.writeText(transResult.translated_text);
    setTransCopied(true);
    setTimeout(() => setTransCopied(false), 2000);
  };

  const parsed = result ? SafeParse(result.analysis_json) : null;
  const filteredFindings = (parsed?.findings || []).filter(
    (f) => filterSeverity === "all" || f.severity?.toLowerCase() === filterSeverity
  );

  const targetLangMeta = SUPPORTED_LANGUAGES.find((l) => l.id === transTargetLang) || SUPPORTED_LANGUAGES[0];
  const isTargetRTL = targetLangMeta.dir === "rtl";

  return (
    <Layout title={t("analyzer.title")}>
      <div className="jm-info" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Info size={15} style={{ flexShrink: 0, color: "var(--blue)" }} />
          <span>{t("analyzer.subtitle")}</span>
        </div>
        <div className="jm-badge jm-badge-gold" style={{ fontSize: 10.5 }}>
          8 Jurisdictions Active
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, borderBottom: "1px solid var(--card-border)", paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab("audit")}
          className="jm-btn"
          style={{
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 700,
            background: activeTab === "audit" ? "var(--grad-gold)" : "var(--surface)",
            color: activeTab === "audit" ? "var(--accent-contrast)" : "var(--text)",
            borderColor: activeTab === "audit" ? "var(--gold)" : "var(--card-border)",
            boxShadow: activeTab === "audit" ? "0 2px 10px var(--gold-glow)" : "none",
          }}
        >
          <FileSearch2 size={14} />
          <span>{t("analyzer.riskAuditTab")}</span>
        </button>

        <button
          onClick={() => setActiveTab("translate")}
          className="jm-btn"
          style={{
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 700,
            background: activeTab === "translate" ? "var(--grad-gold)" : "var(--surface)",
            color: activeTab === "translate" ? "var(--accent-contrast)" : "var(--text)",
            borderColor: activeTab === "translate" ? "var(--gold)" : "var(--card-border)",
            boxShadow: activeTab === "translate" ? "0 2px 10px var(--gold-glow)" : "none",
          }}
        >
          <Languages size={14} />
          <span>{t("analyzer.translatorTab")}</span>
          <span className="jm-badge jm-badge-gold" style={{ fontSize: 9, padding: "1px 5px", marginInlineStart: 4 }}>
            Citation-Safe
          </span>
        </button>
      </div>

      {/* TAB 1: CONTRACT RISK AUDIT */}
      {activeTab === "audit" && (
        <>
          {/* Pre-Loaded Contract Samples */}
          <div style={{ marginBottom: 18 }}>
            <div className="jm-card-label" style={{ marginBottom: 8, color: "var(--gold-light)" }}>
              <Sparkles size={13} style={{ color: "var(--gold)" }} /> Load Sample Contract
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SAMPLE_CONTRACTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="jm-btn"
                  onClick={() => loadSampleContract(sample)}
                  style={{
                    fontSize: 12.5,
                    padding: "7px 12px",
                    background: title === sample.title ? "var(--grad-gold)" : "var(--surface)",
                    borderColor: title === sample.title ? "var(--gold)" : "var(--card-border)",
                    color: title === sample.title ? "var(--accent-contrast)" : "var(--text-secondary)",
                    boxShadow: title === sample.title ? "0 2px 10px var(--gold-glow)" : "none",
                  }}
                >
                  {sample.title}
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
                    <Loader2 size={24} className="jm-spin" style={{ color: "var(--gold)" }} />
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{t("common.processing")}</span>
                  </div>
                ) : uploadedFile ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CheckCircle2 size={18} style={{ color: "var(--good)" }} />
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{uploadedFile.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)" }} className="jm-mono">
                          {uploadedFile.size} • {uploadedFile.charCount} characters
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearUploadedFile(); }}
                      className="jm-icon-btn"
                      style={{ width: 26, height: 26 }}
                      title="Remove file"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={24} style={{ color: "var(--gold-light)", margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                      {t("analyzer.uploadTitle")}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 4 }}>
                      Drag and drop here or click to browse confidential agreement files
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={submit}>
                <div className="jm-field">
                  <label>Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Master Services Agreement (Apex v. TechVanguard)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="jm-field">
                  <label>Contract Text / Clauses</label>
                  <textarea
                    rows={8}
                    placeholder="Paste contract clauses, terms, or upload a document above..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button type="submit" className="jm-btn jm-btn--primary" disabled={loading} style={{ padding: "10px 22px" }}>
                    {loading ? (
                      <><Loader2 size={15} className="jm-spin" /> {t("common.processing")}</>
                    ) : (
                      <><FileSearch2 size={15} /> Audit Contract Risks</>
                    )}
                  </button>

                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                    Output Language: <strong>{SUPPORTED_LANGUAGES.find(l => l.id === language)?.nativeName || "English"}</strong>
                  </span>
                </div>
              </form>

              {/* Analysis Results View */}
              {result && parsed && (
                <div style={{ marginTop: 28, borderTop: "1px solid var(--card-border)", paddingTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <div className="jm-mono" style={{ fontSize: 11, color: "var(--gold-light)", textTransform: "uppercase" }}>
                        Formal Risk Audit Assessment
                      </div>
                      <h3 style={{ margin: "4px 0 0", fontSize: 18, color: "var(--text)" }}>{result.title}</h3>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={() => navigate("/verification")}
                        className="jm-btn"
                        style={{ fontSize: 11.5, padding: "5px 10px", borderColor: "rgba(56, 189, 248, 0.4)", color: "var(--blue)" }}
                      >
                        <Cpu size={12} /> Prove in Z3
                      </button>
                      <span className={`jm-badge ${result.risk_level === 'high' ? 'jm-badge-bad' : result.risk_level === 'medium' ? 'jm-badge-warn' : 'jm-badge-good'}`} style={{ fontSize: 12, padding: "4px 12px" }}>
                        {result.risk_level ? `${result.risk_level.toUpperCase()} RISK` : "AUDITED"}
                      </span>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                    {["all", "high", "medium", "low"].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setFilterSeverity(sev)}
                        style={{
                          background: filterSeverity === sev ? "var(--grad-gold)" : "var(--surface)",
                          border: filterSeverity === sev ? "1px solid var(--gold)" : "1px solid var(--card-border)",
                          color: filterSeverity === sev ? "var(--accent-contrast)" : "var(--text-muted)",
                          borderRadius: 6,
                          padding: "4px 10px",
                          fontSize: 11.5,
                          cursor: "pointer",
                          textTransform: "capitalize",
                          fontWeight: 700,
                        }}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>

                  {/* Findings List */}
                  <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>
                    {t("analyzer.findingsCount")} ({filteredFindings.length})
                  </div>
                  {filteredFindings.map((f, i) => (
                    <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--card-border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: 14, color: "var(--text)" }}>{f.title}</strong>
                        <span className={`jm-badge ${f.severity === 'high' ? 'jm-badge-bad' : f.severity === 'medium' ? 'jm-badge-warn' : 'jm-badge-good'}`}>
                          {f.severity}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", margin: "4px 0" }} className="jm-mono">
                        {f.type}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
                        {f.detail}
                      </p>
                    </div>
                  ))}

                  {/* Suggested Redlines Diff Box */}
                  {parsed.suggested_redlines?.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                      <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>
                        <Sparkles size={13} style={{ color: "var(--gold)" }} /> {t("analyzer.suggestedRedlines")}
                      </div>
                      {parsed.suggested_redlines.map((r, i) => (
                        <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--card-border)", borderRadius: 10, padding: 16, marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <strong style={{ fontSize: 14, color: "var(--gold-light)" }}>{r.clause}</strong>
                            <button
                              onClick={() => handleCopyRedline(r.suggested_text, i)}
                              className="jm-btn"
                              style={{ padding: "4px 10px", fontSize: 11.5 }}
                            >
                              {copiedIndex === i ? <Check size={12} style={{ color: "var(--good)" }} /> : <Copy size={12} />}
                              <span>{copiedIndex === i ? t("common.copied") : t("common.copy")}</span>
                            </button>
                          </div>
                          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 8 }}>
                            Issue Identified: {r.issue}
                          </div>
                          <div style={{ fontSize: 13, background: "rgba(16, 21, 36, 0.8)", border: "1px solid var(--card-border)", color: "var(--text)", borderRadius: 6, padding: 12, lineHeight: 1.55 }}>
                            <strong style={{ color: "var(--good)" }}>Suggested Draft:</strong> {r.suggested_text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar: Past Documents */}
            <div className="jm-card" style={{ alignSelf: "start" }}>
              <div className="jm-card-label">Past Documents Analyzed</div>
              {pastDocs.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>No documents analyzed yet. Run an analysis above.</div>
              ) : (
                pastDocs.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setTitle(d.title);
                      setText(d.text);
                      setResult(d);
                    }}
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid var(--card-border)",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "var(--text)" }}>{d.title}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                      Risk: <span style={{ textTransform: "capitalize", color: d.risk_level === 'high' ? 'var(--bad)' : d.risk_level === 'medium' ? 'var(--warn)' : 'var(--good)' }}>{d.risk_level ?? "—"}</span> • {new Date(d.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: CROSS-JURISDICTION LEGAL CLAUSE & DOCUMENT TRANSLATOR */}
      {activeTab === "translate" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          <div className="jm-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 17, margin: "0 0 4px", color: "var(--text)" }}>
                  {t("analyzer.translatorTab")}
                </h2>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)" }}>
                  Specialized legal translation engine with strict statutory citation preservation across 8 major judicial languages.
                </p>
              </div>
              <span className="jm-badge jm-badge-gold" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Scale size={12} /> LLM Legal Lexicon
              </span>
            </div>

            {transError && (
              <div className="jm-error" style={{ marginBottom: 16 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                {transError}
              </div>
            )}

            {/* Pre-Loaded Clauses */}
            <div style={{ marginBottom: 18 }}>
              <div className="jm-card-label" style={{ marginBottom: 8, color: "var(--gold-light)" }}>
                <Sparkles size={13} style={{ color: "var(--gold)" }} /> Load Sample Legal Clause with Citations
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SAMPLE_TRANSLATION_CLAUSES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="jm-btn"
                    onClick={() => {
                      setTransText(sample.text);
                      setTransError("");
                    }}
                    style={{
                      fontSize: 12,
                      padding: "6px 11px",
                      background: transText === sample.text ? "var(--grad-gold)" : "var(--surface)",
                      borderColor: transText === sample.text ? "var(--gold)" : "var(--card-border)",
                      color: transText === sample.text ? "var(--accent-contrast)" : "var(--text-secondary)",
                    }}
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div className="jm-field" style={{ margin: 0 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Globe size={13} style={{ color: "var(--gold)" }} /> {t("analyzer.sourceLanguage")}
                </label>
                <select
                  value={transSourceLang}
                  onChange={(e) => setTransSourceLang(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "var(--surface)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    fontSize: 13,
                  }}
                >
                  <option value="auto">Auto-Detect Language</option>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.flag} {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="jm-field" style={{ margin: 0 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Languages size={13} style={{ color: "var(--gold)" }} /> {t("analyzer.targetLanguage")}
                </label>
                <select
                  value={transTargetLang}
                  onChange={(e) => setTransTargetLang(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "var(--surface)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.flag} {l.nativeName} ({l.name}) {l.dir === "rtl" ? "• RTL" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Options Checkbox */}
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                id="preserveCites"
                checked={preserveCitations}
                onChange={(e) => setPreserveCitations(e.target.checked)}
                style={{ cursor: "pointer", accentColor: "var(--gold)" }}
              />
              <label htmlFor="preserveCites" style={{ fontSize: 12.5, color: "var(--text-secondary)", cursor: "pointer", margin: 0 }}>
                Preserve statutory citation tags verbatim (e.g. <code className="jm-mono" style={{ color: "var(--gold)" }}>[[cite:...]]</code>)
              </label>
            </div>

            {/* Text Input Area */}
            <div className="jm-field">
              <label>{t("analyzer.clauseToTranslate")}</label>
              <textarea
                rows={6}
                placeholder={t("analyzer.clausePlaceholder")}
                value={transText}
                onChange={(e) => setTransText(e.target.value)}
                style={{ fontSize: 13.5, lineHeight: 1.6 }}
              />
            </div>

            <button
              onClick={handleTranslateClause}
              disabled={transLoading || !transText.trim()}
              className="jm-btn jm-btn--primary"
              style={{ padding: "10px 24px", fontSize: 14, fontWeight: 700 }}
            >
              {transLoading ? (
                <><Loader2 size={16} className="jm-spin" /> {t("analyzer.translating")}</>
              ) : (
                <><Languages size={16} /> {t("analyzer.translateBtn")}</>
              )}
            </button>

            {/* Translation Output Result */}
            {transResult && (
              <div
                className="jm-card jm-animate-pop-in"
                style={{
                  marginTop: 24,
                  background: "var(--surface-elevated, var(--surface))",
                  border: "1px solid var(--card-border-glow)",
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{targetLangMeta.flag}</span>
                    <strong style={{ fontSize: 14, color: "var(--gold-light)" }}>
                      {t("analyzer.translatedResult")} ({targetLangMeta.nativeName})
                    </strong>
                    {isTargetRTL && (
                      <span className="jm-badge jm-badge-gold" style={{ fontSize: 9 }}>RTL Layout</span>
                    )}
                  </div>

                  <button
                    onClick={handleCopyTranslation}
                    className="jm-btn"
                    style={{ padding: "5px 12px", fontSize: 12 }}
                  >
                    {transCopied ? <Check size={13} style={{ color: "var(--good)" }} /> : <Copy size={13} />}
                    <span>{transCopied ? t("common.copied") : t("common.copy")}</span>
                  </button>
                </div>

                <div
                  dir={isTargetRTL ? "rtl" : "ltr"}
                  style={{
                    padding: 16,
                    background: "rgba(10, 13, 22, 0.9)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 8,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "var(--text)",
                    whiteSpace: "pre-wrap",
                    fontFamily: isTargetRTL ? "'Noto Sans Arabic', Tahoma, sans-serif" : "inherit",
                  }}
                >
                  {transResult.translated_text}
                </div>

                {/* Preserved Citations */}
                {transResult.detected_citations?.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>
                      {t("analyzer.detectedCitations")}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {transResult.detected_citations.map((cite, idx) => (
                        <span
                          key={idx}
                          className="jm-badge jm-mono"
                          style={{
                            background: "rgba(212, 175, 55, 0.12)",
                            border: "1px solid rgba(212, 175, 55, 0.3)",
                            color: "var(--gold)",
                            fontSize: 11,
                            padding: "2px 8px",
                          }}
                        >
                          {cite}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comparative Jurisdiction Notes */}
                {transResult.jurisdiction_notes && (
                  <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--surface)", borderRadius: 6, border: "1px solid var(--card-border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", marginBottom: 4 }}>
                      {t("analyzer.jurisdictionNotes")}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {transResult.jurisdiction_notes}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Translation Guide Sidebar */}
          <div className="jm-card" style={{ alignSelf: "start" }}>
            <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>
              <BookOpen size={13} style={{ color: "var(--gold)" }} /> Legal Lexicon Guidance
            </div>

            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
              Commercial agreements and court pleadings require exact legal term equivalents rather than general machine translation:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--card-border)", borderRadius: 6 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--gold)" }}>Indemnify & Hold Harmless</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  ES: <em>mantener indemne</em> • FR: <em>dégager de toute responsabilité</em> • AR: <em>التعويض والحماية من المسؤولية</em>
                </div>
              </div>

              <div style={{ padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--card-border)", borderRadius: 6 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--gold)" }}>Liquidated Damages</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  DE: <em>pauschalierter Schadensersatz</em> • ZH: <em>约定违约金</em> • PT: <em>perdas e danos prefixados</em>
                </div>
              </div>

              <div style={{ padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--card-border)", borderRadius: 6 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--gold)" }}>Cure Period</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  HI: <em>दोष निवारण अवधि</em> • ES: <em>período de subsanación</em> • FR: <em>délai de régularisation</em>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, padding: 10, background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--blue)", marginBottom: 4 }}>
                Citation Integrity
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                Statutory citations wrapped in <span className="jm-mono">[[cite:...]]</span> are guarded against syntax alteration to ensure compliance across civil and common law briefs.
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
