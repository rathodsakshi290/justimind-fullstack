import React, { useState } from "react";
import {
  Search, Loader2, AlertCircle, Info, ExternalLink,
  BookOpen, Scale, Sparkles, Copy, Check
} from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const QUICK_TOPICS = [
  "Section 65B electronic evidence chain of custody",
  "Clayton Act horizontal merger market concentration",
  "Patent subject matter eligibility 35 USC 101",
  "Cheque bounce statutory notice Section 138",
  "Arbitration emergency arbitrator interim injunction",
];

export default function SearchPage() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    setError("");
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.searchCases(token, query);
      setResults(data.results || []);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      setError(err.message || "Failed to query case law.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCitation = (c, idx) => {
    const text = `${c.case_name} (${c.court || "Court"}, ${c.year || "Year"})${c.citation ? ` • Citation: ${c.citation}` : ""}`;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <Layout title="Legal Precedent Search">
      <div className="jm-info">
        <Info size={15} style={{ flexShrink: 0, marginTop: 1, color: "var(--blue)" }} />
        Search millions of judicial opinions and statutory rulings indexed via CourtListener & Supreme Court repositories with Gemini AI query enhancement.
      </div>

      {/* Quick Search Chips */}
      <div style={{ marginBottom: 18 }}>
        <div className="jm-card-label" style={{ marginBottom: 8, color: "var(--gold-light)" }}>
          <Sparkles size={13} style={{ color: "var(--gold)" }} /> Common Research Topics
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK_TOPICS.map((topic, i) => (
            <button
              key={i}
              className="jm-btn"
              onClick={() => { setQuery(topic); }}
              style={{
                fontSize: 12,
                padding: "6px 12px",
                background: query === topic ? "var(--grad-gold)" : "var(--surface)",
                borderColor: query === topic ? "var(--gold)" : "var(--card-border)",
                color: query === topic ? "var(--accent-contrast)" : "var(--text-secondary)",
                boxShadow: query === topic ? "0 2px 8px var(--gold-glow)" : "none",
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Box */}
      <div className="jm-card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--gold)" }} />
            <input
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                fontSize: 14,
                background: "var(--input-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 8,
                color: "var(--text)",
                outline: "none",
              }}
              placeholder="Search case name, statutory section, legal principle, or judge name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="jm-btn jm-btn--primary"
            disabled={!query.trim() || loading}
            style={{ height: 46, padding: "0 22px", borderRadius: 8 }}
          >
            {loading ? <Loader2 size={16} className="jm-spin" /> : <><Search size={15} /> Search Decisions</>}
          </button>
        </form>
      </div>

      {error && <div className="jm-error"><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{error}</div>}

      {/* Search Results */}
      {searched && !loading && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span className="jm-card-label" style={{ margin: 0, color: "var(--gold-light)" }}>
              Found {results.length} Indexed Judicial Decisions
            </span>
          </div>

          {results.length === 0 ? (
            <div className="jm-card" style={{ textAlign: "center", padding: 44, color: "var(--text-muted)" }}>
              No precedent matches found for "{query}". Try broadening your search query or using statutory citations.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {results.map((r, idx) => (
                <div key={idx} className="jm-card jm-animate-fade-in-up" style={{ padding: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <h3 className="jm-display" style={{ fontSize: 17, fontWeight: 600, margin: 0, color: "var(--text)" }}>
                      {r.case_name}
                    </h3>
                    <button
                      onClick={() => handleCopyCitation(r, idx)}
                      className="jm-btn"
                      style={{ padding: "4px 10px", fontSize: 11.5 }}
                    >
                      {copiedIdx === idx ? <Check size={12} style={{ color: "var(--good)" }} /> : <Copy size={12} />}
                      <span>{copiedIdx === idx ? "Copied" : "Copy Cite"}</span>
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                    <span className="jm-badge jm-badge-gold">
                      {r.court || "Appellate Court"}
                    </span>
                    {r.year && (
                      <span className="jm-mono" style={{ fontSize: 11.5, color: "var(--text-dim)" }}>
                        Year: {r.year}
                      </span>
                    )}
                    {r.citation && (
                      <span className="jm-mono" style={{ fontSize: 11.5, color: "var(--gold-light)" }}>
                        Cite: {r.citation}
                      </span>
                    )}
                  </div>

                  {r.snippet && (
                    <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                      "...{r.snippet.replace(/<\/?em>/g, "")}..."
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
