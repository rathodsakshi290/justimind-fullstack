import React, { useState, useEffect } from "react";
import {
  Brain, Loader2, AlertCircle, Info, Sparkles, TrendingUp,
  Shield, Check, AlertTriangle, Sliders
} from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../lib/api";

function SafeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
}

function ProbabilityBar({ label, value, color, bg }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span className="jm-mono" style={{ fontWeight: 800, color: color }}>{value}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            borderRadius: 4,
            background: bg || color,
            boxShadow: `0 0 12px ${color}40`,
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}

export default function PredictionPage() {
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const [cases, setCases] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // What-If Scenario Simulator
  const [simulatedEvidenceBoost, setSimulatedEvidenceBoost] = useState(0);

  useEffect(() => {
    api.listCases(token).then(setCases).catch(() => {});
  }, [token]);

  const runPrediction = async () => {
    if (!selectedId) return;
    setError("");
    setPrediction(null);
    setLoading(true);
    try {
      const res = await api.predictCase(token, selectedId, language || "en");
      setPrediction(res);
      setSimulatedEvidenceBoost(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const parsed = prediction ? SafeParse(prediction.prediction_json) : null;

  const rawWin = parsed?.win_probability ?? 65;
  const rawLoss = parsed?.loss_probability ?? 15;
  const rawSettle = parsed?.settlement_probability ?? 20;

  const adjWin = Math.min(95, Math.max(5, rawWin + simulatedEvidenceBoost));
  const remaining = 100 - adjWin;
  const adjSettle = Math.round(remaining * (rawSettle / (rawSettle + rawLoss || 1)));
  const adjLoss = 100 - adjWin - adjSettle;

  return (
    <Layout title={t("prediction.title")}>
      <div className="jm-info">
        <Info size={15} style={{ flexShrink: 0, marginTop: 1, color: "var(--blue)" }} />
        Simulates litigation outcome probabilities, SWOT litigation matrix, and strategic positioning by analyzing case facts and precedent alignment via Google Gemini.
      </div>

      <div className="jm-card" style={{ marginBottom: 20 }}>
        {cases.length === 0 ? (
          <div style={{ fontSize: 13.5, color: "var(--text-muted)", textAlign: "center", padding: "10px 0" }}>
            You need to summarize a case first — head to <a href="/summarizer" style={{ color: "var(--gold)", fontWeight: 700 }}>Case Summarizer</a> to create your first brief.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--surface)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 8,
                  padding: "11px 14px",
                  color: "var(--text)",
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="">Select a summarized case…</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.confidence ?? "90"}% confidence)
                  </option>
                ))}
              </select>
            </div>
            <button className="jm-btn jm-btn--primary" onClick={runPrediction} disabled={!selectedId || loading} style={{ height: 44 }}>
              {loading ? <><Loader2 size={15} className="jm-spin" /> Simulating Precedents…</> : <><Brain size={15} /> Run Strategic Prediction</>}
            </button>
          </div>
        )}
      </div>

      {error && <div className="jm-error"><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{error}</div>}

      {parsed && (
        <div className="jm-animate-fade-in-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Outcome Probabilities Card */}
          <div className="jm-card">
            <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>
              <TrendingUp size={13} style={{ color: "var(--gold)" }} /> Judicial Outcome Probability
            </div>

            <ProbabilityBar
              label="Favorable Verdict / Win"
              value={adjWin}
              color="var(--good)"
              bg="linear-gradient(90deg, #059669, #10B981, #34D399)"
            />
            <ProbabilityBar
              label="Negotiated Settlement"
              value={adjSettle}
              color="var(--blue)"
              bg="linear-gradient(90deg, #0284C7, #38BDF8, #60A5FA)"
            />
            <ProbabilityBar
              label="Adverse Ruling / Loss"
              value={adjLoss}
              color="var(--bad)"
              bg="linear-gradient(90deg, #E11D48, #F43F5E, #FB7185)"
            />

            <div style={{ background: "var(--surface)", borderRadius: 8, padding: 14, marginTop: 18, border: "1px solid var(--card-border)" }}>
              <div style={{ fontSize: 11, color: "var(--gold-light)", textTransform: "uppercase", marginBottom: 4 }} className="jm-mono">
                Outcome Synthesis
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
                {parsed.expected_outcome_note}
              </p>
            </div>
          </div>

          {/* Strength Signals & What-If Simulator */}
          <div className="jm-card">
            <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>
              <Sliders size={13} style={{ color: "var(--gold)" }} /> Interactive What-If Scenario
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 8 }}>
                <span>Simulate New Evidence / Witness Credibility:</span>
                <span className="jm-mono" style={{ fontWeight: 800, color: "var(--gold-light)" }}>
                  {simulatedEvidenceBoost > 0 ? `+${simulatedEvidenceBoost}%` : `${simulatedEvidenceBoost}%`}
                </span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                value={simulatedEvidenceBoost}
                onChange={(e) => setSimulatedEvidenceBoost(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--gold)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
              <div style={{ background: "var(--surface)", padding: 12, borderRadius: 8, border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Risk Severity</div>
                <div style={{ fontWeight: 800, fontSize: 14, marginTop: 3, color: "var(--warn)" }}>
                  {parsed.risk_level || "Medium"}
                </div>
              </div>
              <div style={{ background: "var(--surface)", padding: 12, borderRadius: 8, border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Estimated Duration</div>
                <div style={{ fontWeight: 800, fontSize: 14, marginTop: 3, color: "var(--text)" }}>
                  {parsed.estimated_duration || "8-12 Months"}
                </div>
              </div>
            </div>
          </div>

          {/* Reasoning Chain */}
          <div className="jm-card">
            <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>
              <Shield size={13} style={{ color: "var(--gold)" }} /> Judicial Reasoning Chain
            </div>
            {(parsed.reasoning_chain || []).map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "11px 0",
                  borderBottom: "1px solid var(--card-border)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: "rgba(212, 175, 55, 0.12)",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    color: "var(--gold-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                  className="jm-mono"
                >
                  {i + 1}
                </span>
                <span style={{ color: "var(--text-secondary)" }}>{r}</span>
              </div>
            ))}
          </div>

          {/* SWOT Matrix */}
          <div className="jm-card">
            <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>
              <AlertTriangle size={13} style={{ color: "var(--gold)" }} /> Tactical SWOT Matrix
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "var(--surface)", padding: 10, borderRadius: 6, border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: "var(--bad)" }}>
                  • Weaknesses
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--text-muted)" }}>
                  {(parsed.weaknesses || []).map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>

              <div style={{ background: "var(--surface)", padding: 10, borderRadius: 6, border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: "var(--good)" }}>
                  • Opportunities
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--text-muted)" }}>
                  {(parsed.opportunities || []).map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              </div>

              <div style={{ background: "var(--surface)", padding: 10, borderRadius: 6, border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: "var(--warn)" }}>
                  • Threats
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--text-muted)" }}>
                  {(parsed.threats || []).map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommended Strategy */}
          <div className="jm-card" style={{ gridColumn: "span 2", background: "var(--surface)", border: "1px solid var(--card-border-glow)" }}>
            <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>
              <Sparkles size={13} style={{ color: "var(--gold)" }} /> Counsel Action Strategy
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)", margin: 0 }}>
              {parsed.recommended_strategy}
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
