import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Scale, FileText, Search, BarChart3, Network, Sparkles,
  ArrowRight, ShieldCheck, Sun, Moon, Check, Quote,
  Brain, FileSearch2, Clock, Award, Users, Lock, Globe
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";

const ROTATING_WORDS = ["the verdict", "the settlement", "the ruling", "the outcome"];

const FEATURES = [
  {
    icon: Brain,
    title: "Prediction Engine",
    desc: "Feed in a case file and get a reasoned probability of how it resolves — win, loss, or settlement — with the chain of reasoning attached.",
    tag: "01 · Core",
  },
  {
    icon: FileText,
    title: "Case Summarizer",
    desc: "Facts, issues, evidence, and judgment distilled from a 300-page filing into something you can read before your next meeting.",
    tag: "02 · Core",
  },
  {
    icon: FileSearch2,
    title: "Document Analyzer",
    desc: "Surfaces missing clauses, contradictions, and compliance gaps against GDPR, DPDP, and HIPAA before they become your problem.",
    tag: "03 · Core",
  },
  {
    icon: Search,
    title: "Research Engine",
    desc: "Semantic search across statutes, sections, and precedent — retrieval-augmented, cited, and cross-referenced with CourtListener.",
    tag: "04 · Research",
  },
  {
    icon: Network,
    title: "Knowledge Graph",
    desc: "Cases, judges, acts, and evidence as a graph you can pull apart — trace precedent the way it actually connects.",
    tag: "05 · Research",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Win rate by judge, court, and case category — the pattern behind the docket, not just the headline number.",
    tag: "06 · Insight",
  },
];

const HIGHLIGHTS = [
  { value: "AI Reasoning", label: "Powered by Google Gemini & CourtListener" },
  { value: "Local & Private", label: "Self-hosted FastAPI & SQLite database" },
  { value: "Formal Logic", label: "Mathematical verification via Z3 SMT" },
  { value: "Multi-Jurisdiction", label: "US, UK, Indian, and EU legal frameworks" },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [wordIndex, setWordIndex] = useState(0);

  const rotatingWords = [
    t("landing.rotatingVerdict"),
    t("landing.rotatingSettlement"),
    t("landing.rotatingRuling"),
    t("landing.rotatingOutcome"),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  return (
    <div data-theme={theme} dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", position: "relative", overflow: "hidden" }}>
      {/* Navigation Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          background: theme === "light" ? "rgba(240, 236, 221, 0.92)" : "rgba(2, 18, 47, 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--card-border)",
          padding: "16px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="app-logo-mark">
            <Scale size={18} />
          </div>
          <div>
            <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>JustiMind</span>
            <span className="jm-badge jm-badge-gold" style={{ fontSize: 10, padding: "2px 6px", marginInlineStart: 8 }}>{t("common.enterprise")}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Multi-Language Jurisdiction Selector */}
          <LanguageSelector variant="landing" />

          <button className="jm-icon-btn" onClick={toggleTheme} title={theme === "dark" ? t("topbar.switchThemeLight") : t("topbar.switchThemeDark")}>
            {theme === "dark" ? <Sun size={15} style={{ color: "var(--gold)" }} /> : <Moon size={15} />}
          </button>
          {user ? (
            <Link to="/workspace" className="jm-btn jm-btn--primary" style={{ textDecoration: "none" }}>
              {t("landing.launchApp")} <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="jm-btn" style={{ textDecoration: "none" }}>
                {t("auth.signInBtn")}
              </Link>
              <Link to="/login" className="jm-btn jm-btn--primary" style={{ textDecoration: "none" }}>
                {t("landing.launchApp")} <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: "90px 24px 70px",
          maxWidth: 1200,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div>
          <div
            className="jm-badge jm-badge-gold jm-animate-fade-in-up"
            style={{ marginBottom: 22, padding: "6px 16px", fontSize: 12.5 }}
          >
            <Sparkles size={13} style={{ color: "var(--gold)" }} /> Enterprise Legal Intelligence &amp; Judicial Reasoning
          </div>

          <h1
            className="jm-display jm-animate-fade-in-up"
            style={{
              fontSize: "clamp(36px, 5.5vw, 68px)",
              fontWeight: 600,
              lineHeight: 1.15,
              maxWidth: 920,
              margin: "0 auto 24px",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            Know <span style={{ color: "var(--gold-light)", textDecoration: "underline", textUnderlineOffset: 8 }}>{ROTATING_WORDS[wordIndex]}</span> before you step into court.
          </h1>

          <p
            className="jm-animate-fade-in-up"
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              color: "var(--text-muted)",
              maxWidth: 740,
              margin: "0 auto 38px",
              lineHeight: 1.65,
            }}
          >
            JustiMind combines advanced LLMs, real-time precedent retrieval, and strategic litigation SWOT modeling to give attorneys and counsel an unfair tactical advantage.
          </p>

          <div
            className="jm-animate-fade-in-up"
            style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}
          >
            <Link
              to="/login"
              className="jm-btn jm-btn--primary"
              style={{ padding: "14px 30px", fontSize: 15, borderRadius: 8, textDecoration: "none" }}
            >
              Launch Live Workspace <ArrowRight size={16} />
            </Link>
            <Link
              to="/search"
              className="jm-btn"
              style={{ padding: "14px 26px", fontSize: 15, borderRadius: 8, textDecoration: "none" }}
            >
              <Search size={16} style={{ color: "var(--gold)" }} /> Search Precedent Database
            </Link>
          </div>

          {/* Simulation Dashboard Card */}
          <div
            className="jm-card jm-animate-fade-in-up"
            style={{
              maxWidth: 980,
              margin: "0 auto",
              padding: 30,
              textAlign: "left",
              border: "1px solid var(--card-border-glow)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(212,175,55,0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="jm-mono" style={{ fontSize: 12.5, color: "var(--gold-light)" }}>
                  Case_Filing_Simulation_Analysis.gemini
                </span>
              </div>
              <span className="jm-badge jm-badge-gold">Judicial Confidence: 92%</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              <div>
                <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>Predicted Outcome Probability</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <div style={{ flex: 68, background: "var(--grad-gold)", color: "var(--accent-contrast)", height: 30, borderRadius: 6, display: "flex", alignItems: "center", padding: "0 10px", fontSize: 12.5, fontWeight: 800 }}>
                    Win: 68%
                  </div>
                  <div style={{ flex: 22, background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "var(--blue)", height: 30, borderRadius: 6, display: "flex", alignItems: "center", padding: "0 8px", fontSize: 12, fontWeight: 700 }}>
                    Settle: 22%
                  </div>
                  <div style={{ flex: 10, background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", color: "var(--bad)", height: 30, borderRadius: 6, display: "flex", alignItems: "center", padding: "0 6px", fontSize: 11, fontWeight: 700 }}>
                    Loss: 10%
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                  Strong precedent alignment with <em>Ferreira v. State</em> regarding electronic chain of custody exclusions under Sec. 65B.
                </p>
              </div>

              <div>
                <div className="jm-card-label" style={{ color: "var(--gold-light)" }}>Strategic Recommendation</div>
                <div style={{ background: "var(--surface)", border: "1px solid var(--card-border)", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4, color: "var(--text)" }}>
                    File Preliminary Motion to Suppress Exhibit C
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>
                    Unregistered server SHA-256 hash hashes invalidate the digital evidentiary chain, forcing early settlement negotiations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section style={{ borderTop: "1px solid var(--card-border)", borderBottom: "1px solid var(--card-border)", background: "var(--surface)", padding: "44px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, textAlign: "center" }}>
          {HIGHLIGHTS.map((s, i) => (
            <div key={i} className="jm-animate-pop-in">
              <div className="jm-display" style={{ fontSize: 30, fontWeight: 700, marginBottom: 4, color: "var(--gold-light)" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text-muted)", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: "85px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span className="jm-card-label" style={{ justifyContent: "center", color: "var(--gold)" }}>Enterprise Suite</span>
          <h2 className="jm-display" style={{ fontSize: 32, fontWeight: 600, margin: "6px 0 12px", color: "var(--text)" }}>
            The Full Spectrum of AI Legal Intelligence
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 15.5, maxWidth: 640, margin: "0 auto" }}>
            Engineered specifically for litigators, in-house counsel, and legal scholars.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 22 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="jm-card" style={{ padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(212, 175, 55, 0.12)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <f.icon size={20} />
                </div>
                <span className="jm-mono" style={{ fontSize: 11, color: "var(--text-dim)" }}>{f.tag}</span>
              </div>
              <h3 className="jm-display" style={{ fontSize: 19, fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--card-border)", background: "var(--surface)", padding: "50px 24px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto 30px" }}>
          <h3 className="jm-display" style={{ fontSize: 25, fontWeight: 600, margin: "0 0 10px" }}>
            Ready to explore legal intelligence?
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 22 }}>
            Start analyzing cases with Gemini AI immediately.
          </p>
          <Link to="/login" className="jm-btn jm-btn--primary" style={{ padding: "12px 28px", fontSize: 14.5, textDecoration: "none" }}>
            Get Started Now <ArrowRight size={15} />
          </Link>
        </div>

        <div style={{ fontSize: 11.5, color: "var(--text-dim)" }} className="jm-mono">
          © {new Date().getFullYear()} JustiMind. Legal Intelligence Platform.
        </div>
      </footer>
    </div>
  );
}
