import React, { useState, useEffect } from "react";
import {
  ShieldAlert, CheckCircle2, AlertTriangle, Cpu, Sparkles, Copy, Check,
  Sliders, ArrowRight, RefreshCw, FileText, Scale, BookOpen, Clock, Download,
  Layers, ChevronRight, Terminal, Info
} from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerificationPage() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [benchmarks, setBenchmarks] = useState([]);
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState("contract_liability_contradiction");
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [title, setTitle] = useState("TechVanguard MSA — Indemnity vs. Liability Cap Contradiction");
  const [text, setText] = useState("");
  const [domain, setDomain] = useState("contract_consistency");
  const [params, setParams] = useState({});

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [whatIfSolving, setWhatIfSolving] = useState(false);
  const [whatIfResult, setWhatIfResult] = useState(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [showSmtCode, setShowSmtCode] = useState(false);

  // Load benchmarks and user cases/docs
  useEffect(() => {
    api.getVerificationBenchmarks(token)
      .then((data) => {
        if (data && data.length > 0) {
          setBenchmarks(data);
          // Check if navigated from another page with pre-filled state
          if (location.state?.prefill) {
            setTitle(location.state.prefill.title || "Custom Verification Target");
            setText(location.state.prefill.text || "");
            setDomain(location.state.prefill.domain || "contract_consistency");
            setParams(location.state.prefill.params || {});
            setSelectedBenchmarkId("custom");
          } else {
            const first = data[0];
            setTitle(first.title);
            setText(first.sample_text);
            setDomain(first.domain);
            setParams(first.default_params || {});
          }
        }
      })
      .catch(() => {});

    api.listCases(token).then(setCases).catch(() => {});
    api.listDocuments(token).then(setDocuments).catch(() => {});
  }, [token]);

  // Run initial verification once data is loaded
  useEffect(() => {
    if (text && !result && !loading) {
      handleRunVerification();
    }
  }, [selectedBenchmarkId]);

  const handleBenchmarkSelect = (bId) => {
    setSelectedBenchmarkId(bId);
    setWhatIfResult(null);
    setError("");
    const bm = benchmarks.find((b) => b.id === bId);
    if (bm) {
      setTitle(bm.title);
      setText(bm.sample_text);
      setDomain(bm.domain);
      setParams(bm.default_params || {});
    }
  };

  const handleImportCase = (caseId) => {
    const c = cases.find((item) => String(item.id) === String(caseId));
    if (!c) return;
    setSelectedBenchmarkId("imported_case");
    setTitle(c.title);
    setText(c.raw_text);
    setDomain("evidence_chain");
    setParams({
      is_public_location: c.raw_text.toLowerCase().includes("park") || c.raw_text.toLowerCase().includes("public"),
      recovery_delay_days: 3,
      has_forensic_dna_or_fingerprint: false,
      contemporaneous_hash_logged: false,
      exclusive_possession_proven: false
    });
    setWhatIfResult(null);
  };

  const handleImportDocument = (docId) => {
    const d = documents.find((item) => String(item.id) === String(docId));
    if (!d) return;
    setSelectedBenchmarkId("imported_doc");
    setTitle(d.title);
    setText(d.raw_text);
    setDomain("contract_consistency");
    setParams({
      has_unconditional_indemnity: true,
      has_strict_cap: true,
      cap_amount: 1000,
      termination_notice_days: 5,
      mandatory_cure_days: 30
    });
    setWhatIfResult(null);
  };

  const handleRunVerification = async () => {
    setError("");
    setLoading(true);
    setWhatIfResult(null);
    try {
      const res = await api.verifyWithZ3(token, {
        title,
        text,
        domain,
        params
      });
      setResult(res);
    } catch (err) {
      setError(err.message || "Failed to execute Z3 solver verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleSolveWhatIf = async (targetParam) => {
    setWhatIfSolving(true);
    try {
      const sol = await api.solveWhatIf(token, {
        domain,
        current_params: params,
        target_param: targetParam
      });
      setWhatIfResult(sol);
      if (sol.recommended_value !== null && sol.recommended_value !== undefined) {
        // Auto-update parameter to test the fix
        setParams((prev) => ({
          ...prev,
          [targetParam]: sol.recommended_value
        }));
      }
    } catch (err) {
      setError(err.message || "What-if optimization failed.");
    } finally {
      setWhatIfSolving(false);
    }
  };

  const copySmtCode = () => {
    if (!result?.smt_lib_code) return;
    navigator.clipboard.writeText(result.smt_lib_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isSatisfiable = result?.status === "SATISFIABLE";

  return (
    <Layout title="Z3 Formal Verifier">
      {/* Header Banner */}
      <div
        className="jm-card"
        style={{
          marginBottom: 20,
          background: "var(--card)",
          border: "1px solid var(--card-border-glow)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 9px",
                  borderRadius: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "'IBM Plex Mono', monospace",
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "var(--blue)",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                }}
              >
                <Cpu size={12} /> MICROSOFT Z3 SMT THEOREM PROVER
              </span>
              <span
                className="jm-badge jm-badge-gold"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 9px",
                  borderRadius: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                FIRST-ORDER LOGIC SOUNDNESS
              </span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px 0", color: "var(--text)" }}>
              Formal Logic &amp; Contract Verification Engine
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              Unlike probabilistic LLMs, Microsoft Z3 SMT proves mathematically whether your contract clauses, statutory limitations, or evidence chains are logically satisfiable (<strong>SAT</strong>) or contain irreconcilable contradictions (<strong>UNSAT Core</strong>).
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleRunVerification}
              disabled={loading}
              className="jm-btn jm-btn--primary"
              style={{ padding: "10px 22px", display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="jm-spin" />
                  Running Z3 Solver...
                </>
              ) : (
                <>
                  <Cpu size={16} />
                  Execute Z3 Verification
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="jm-error" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Target Selector & Configuration */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Benchmark / Source Selector */}
        <div className="jm-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
              1. Select Verification Target
            </div>
            <span style={{ fontSize: 11, color: "var(--gold)" }} className="jm-mono">
              Presets &amp; Saved Data
            </span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Standard Verification Benchmarks
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {benchmarks.map((bm) => (
                <div
                  key={bm.id}
                  onClick={() => handleBenchmarkSelect(bm.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: selectedBenchmarkId === bm.id ? "var(--gold-glow)" : "var(--surface)",
                    border: `1px solid ${selectedBenchmarkId === bm.id ? "var(--gold)" : "var(--card-border)"}`,
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: selectedBenchmarkId === bm.id ? "var(--gold)" : "var(--text)" }}>
                      {bm.title}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 5px",
                        borderRadius: 3,
                        background: bm.domain === "contract_consistency" ? "rgba(56, 189, 248, 0.15)" : "rgba(129, 140, 248, 0.15)",
                        color: bm.domain === "contract_consistency" ? "var(--blue)" : "var(--indigo)",
                      }}
                      className="jm-mono"
                    >
                      {bm.domain}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-dim)", lineHeight: 1.4 }}>
                    {bm.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Saved Items Quick-Select */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 10, borderTop: "1px solid var(--card-border)" }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                Import Saved Case ({cases.length})
              </label>
              <select
                onChange={(e) => handleImportCase(e.target.value)}
                defaultValue=""
                style={{
                  width: "100%",
                  fontSize: 12,
                  padding: "6px 8px",
                  borderRadius: 4,
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--card-border)",
                }}
              >
                <option value="" disabled>Choose case...</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                Import Saved Document ({documents.length})
              </label>
              <select
                onChange={(e) => handleImportDocument(e.target.value)}
                defaultValue=""
                style={{
                  width: "100%",
                  fontSize: 12,
                  padding: "6px 8px",
                  borderRadius: 4,
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--card-border)",
                }}
              >
                <option value="" disabled>Choose document...</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Target Clause Text & Parameter Controls */}
        <div className="jm-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
              2. Contract Text &amp; Parameter Matrix
            </div>
            <span style={{ fontSize: 11, color: "var(--blue)" }} className="jm-mono">
              Live SMT Variables
            </span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
              Target Legal Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 6,
                background: "var(--input-bg)",
                border: "1px solid var(--card-border)",
                color: "var(--text)",
                fontSize: 12.5,
                lineHeight: 1.5,
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          {/* Interactive Parameters for What-If Simulation */}
          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: 10, borderRadius: 6, border: "1px solid var(--card-border)" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>ACTIVE MODEL PARAMETERS</span>
              <span className="jm-mono" style={{ color: "var(--gold)", fontSize: 10 }}>Auto-Sync with Z3</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {/* Parameter: Termination Notice Days */}
              {params.termination_notice_days !== undefined && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                    <span>Notice Window</span>
                    <strong className="jm-mono" style={{ color: "var(--gold)" }}>{params.termination_notice_days} days</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={params.termination_notice_days}
                    onChange={(e) => setParams({ ...params, termination_notice_days: parseInt(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <button
                      onClick={() => handleSolveWhatIf("termination_notice_days")}
                      disabled={whatIfSolving}
                      style={{
                        fontSize: 10,
                        background: "none",
                        border: "none",
                        color: "var(--blue)",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      {whatIfSolving ? "Solving..." : "⚡ Z3 Optimize Notice"}
                    </button>
                  </div>
                </div>
              )}

              {/* Parameter: Cure Period Days */}
              {params.mandatory_cure_days !== undefined && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                    <span>Cure Window</span>
                    <strong className="jm-mono" style={{ color: "var(--gold)" }}>{params.mandatory_cure_days} days</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={params.mandatory_cure_days}
                    onChange={(e) => setParams({ ...params, mandatory_cure_days: parseInt(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                </div>
              )}

              {/* Parameter: Liability Cap Amount */}
              {params.cap_amount !== undefined && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                    <span>Liability Cap</span>
                    <strong className="jm-mono" style={{ color: "var(--blue)" }}>${params.cap_amount.toLocaleString()}</strong>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="100000"
                    step="500"
                    value={params.cap_amount}
                    onChange={(e) => setParams({ ...params, cap_amount: parseInt(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                </div>
              )}

              {/* Parameter: Limitation Elapsed Days */}
              {params.cause_of_action_days_ago !== undefined && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                    <span>Elapsed Days</span>
                    <strong className="jm-mono" style={{ color: params.cause_of_action_days_ago > 1095 ? "var(--bad)" : "var(--good)" }}>
                      {params.cause_of_action_days_ago} days
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={params.cause_of_action_days_ago}
                    onChange={(e) => setParams({ ...params, cause_of_action_days_ago: parseInt(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <button
                      onClick={() => handleSolveWhatIf("statutory_limitation_days")}
                      disabled={whatIfSolving}
                      style={{
                        fontSize: 10,
                        background: "none",
                        border: "none",
                        color: "var(--blue)",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      {whatIfSolving ? "Solving..." : "⚡ Z3 Solve Required Window"}
                    </button>
                  </div>
                </div>
              )}

              {/* Parameter: Public Location Recovery */}
              {params.is_public_location !== undefined && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, gridColumn: "span 2" }}>
                  <input
                    type="checkbox"
                    id="chk_pub"
                    checked={params.is_public_location}
                    onChange={(e) => setParams({ ...params, is_public_location: e.target.checked })}
                  />
                  <label htmlFor="chk_pub" style={{ fontSize: 12, cursor: "pointer", color: "var(--text-secondary)" }}>
                    Recovery Made from Public / Open Area (Breaks Exclusive Knowledge Presumption)
                  </label>
                </div>
              )}
            </div>

            {whatIfResult && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 10px",
                  borderRadius: 4,
                  background: "rgba(56, 189, 248, 0.1)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  fontSize: 11.5,
                  color: "var(--text-secondary)",
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--blue)", marginBottom: 2 }}>
                  💡 Z3 Optimization Result ({whatIfResult.condition})
                </div>
                {whatIfResult.explanation}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Z3 Verification Results Display */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }}>
          {/* Main Verdict Card */}
          <div
            className="jm-card"
            style={{
              background: isSatisfiable
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 21, 36, 0.9) 100%)"
                : "linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(16, 21, 36, 0.9) 100%)",
              border: `1px solid ${isSatisfiable ? "var(--good-border)" : "var(--bad-border)"}`,
              boxShadow: isSatisfiable ? "0 0 25px rgba(16, 185, 129, 0.15)" : "0 0 25px rgba(244, 63, 94, 0.18)",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isSatisfiable ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)",
                    color: isSatisfiable ? "var(--good)" : "var(--bad)",
                  }}
                >
                  {isSatisfiable ? <CheckCircle2 size={28} /> : <ShieldAlert size={28} />}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 3,
                        fontWeight: 800,
                        background: isSatisfiable ? "var(--good)" : "var(--bad)",
                        color: "#FFFFFF",
                      }}
                      className="jm-mono"
                    >
                      {result.status}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-dim)" }} className="jm-mono">
                      Domain: {result.domain}
                    </span>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: "4px 0 0 0", color: "var(--text)" }}>
                    {isSatisfiable
                      ? "Formally Proven Satisfiable (No Contradictions Detected)"
                      : "Formal Mathematical Contradiction Proven (UNSAT Core Extracted)"}
                  </h2>
                </div>
              </div>

              {/* Execution Metrics */}
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ textAlign: "right", padding: "4px 12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: 4 }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>EXECUTION TIME</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)" }} className="jm-mono">
                    {result.execution_time_ms} ms
                  </div>
                </div>
                <div style={{ textAlign: "right", padding: "4px 12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: 4 }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>CONSTRAINTS</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }} className="jm-mono">
                    {result.constraints_evaluated?.length || 0}
                  </div>
                </div>
                {!isSatisfiable && (
                  <div style={{ textAlign: "right", padding: "4px 12px", background: "rgba(244, 63, 94, 0.15)", borderRadius: 4 }}>
                    <div style={{ fontSize: 10, color: "var(--bad)" }}>UNSAT CORE SIZE</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--bad)" }} className="jm-mono">
                      {result.unsat_core?.length || 0} Rules
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              {result.summary}
            </p>

            {/* Unsat Core Visualizer */}
            {!isSatisfiable && result.unsat_core && result.unsat_core.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--bad)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldAlert size={14} /> Conflicting Clauses in Z3 Unsat Core
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.constraints_evaluated
                    .filter((c) => result.unsat_core.includes(c.id))
                    .map((c) => (
                      <div
                        key={c.id}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 6,
                          background: "rgba(244, 63, 94, 0.08)",
                          borderLeft: "4px solid var(--bad)",
                          borderTop: "1px solid rgba(244, 63, 94, 0.2)",
                          borderRight: "1px solid rgba(244, 63, 94, 0.2)",
                          borderBottom: "1px solid rgba(244, 63, 94, 0.2)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--bad)" }}>
                            {c.name}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--bad)" }} className="jm-mono">
                            {c.id}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
                          {c.description}
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            padding: "3px 8px",
                            borderRadius: 3,
                            background: "rgba(0, 0, 0, 0.4)",
                            color: "var(--gold-light)",
                            display: "inline-block",
                          }}
                          className="jm-mono"
                        >
                          Mathematical Expression: {c.expression}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Satisfying Model Assignments (if SAT) */}
            {isSatisfiable && result.satisfying_model && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--good)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={14} /> Z3 Satisfying Valuation Model
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                  {Object.entries(result.satisfying_model).map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 4,
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }} className="jm-mono">{k}</span>
                      <strong style={{ fontSize: 12, color: "var(--good)" }} className="jm-mono">{String(v)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Remedies */}
            {result.remedy_recommendations && result.remedy_recommendations.length > 0 && (
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: 12, borderRadius: 6, border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={14} /> Strategic Legal Redline &amp; Remediation Directives
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {result.remedy_recommendations.map((rem, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{rem}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Evaluated Constraint System Table */}
          <div className="jm-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                Full Formal Constraint System ({result.constraints_evaluated?.length || 0})
              </div>
              <button
                onClick={() => setShowSmtCode(!showSmtCode)}
                className="jm-btn jm-btn-ghost"
                style={{ fontSize: 11, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Terminal size={13} />
                {showSmtCode ? "Hide SMT-LIB Code" : "Inspect SMT-LIB 2.0 Proof"}
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--card-border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", color: "var(--text-dim)", fontWeight: 600 }}>RULE ID</th>
                    <th style={{ padding: "8px 12px", color: "var(--text-dim)", fontWeight: 600 }}>NAME</th>
                    <th style={{ padding: "8px 12px", color: "var(--text-dim)", fontWeight: 600 }}>FIRST-ORDER SMT FORMULA</th>
                    <th style={{ padding: "8px 12px", color: "var(--text-dim)", fontWeight: 600 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {result.constraints_evaluated?.map((c) => {
                    const isConflicted = result.unsat_core?.includes(c.id);
                    return (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                          background: isConflicted ? "rgba(244, 63, 94, 0.05)" : "transparent",
                        }}
                      >
                        <td style={{ padding: "10px 12px", color: isConflicted ? "var(--bad)" : "var(--text-muted)" }} className="jm-mono">
                          {c.id}
                        </td>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text)" }}>
                          {c.name}
                        </td>
                        <td style={{ padding: "10px 12px", color: "var(--gold-light)" }} className="jm-mono">
                          {c.expression}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              fontSize: 10,
                              padding: "2px 6px",
                              borderRadius: 3,
                              fontWeight: 700,
                              background: isConflicted ? "rgba(244, 63, 94, 0.2)" : "rgba(16, 185, 129, 0.15)",
                              color: isConflicted ? "var(--bad)" : "var(--good)",
                            }}
                            className="jm-mono"
                          >
                            {isConflicted ? "CONFLICT" : "SATISFIED"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* SMT-LIB 2.0 Code Inspector */}
            {showSmtCode && result.smt_lib_code && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--card-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)" }} className="jm-mono">
                    RAW SMT-LIB 2.0 ENCODING GENERATED BY Z3
                  </span>
                  <button
                    onClick={copySmtCode}
                    className="jm-btn jm-btn-ghost"
                    style={{ fontSize: 11, padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    {copiedCode ? <Check size={12} style={{ color: "var(--good)" }} /> : <Copy size={12} />}
                    {copiedCode ? "Copied" : "Copy Code"}
                  </button>
                </div>
                <pre
                  style={{
                    background: "rgba(0, 0, 0, 0.6)",
                    padding: 14,
                    borderRadius: 6,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "var(--text-secondary)",
                    fontSize: 11.5,
                    lineHeight: 1.5,
                    overflowX: "auto",
                    margin: 0,
                  }}
                  className="jm-mono"
                >
                  {result.smt_lib_code}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
