import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, Loader2, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";

export default function AuthPage({ isLogin = true }) {
  const { login, signup } = useAuth();
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [mode, setMode] = useState(isLogin ? "login" : "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password, fullName);
      }
      navigate("/workspace");
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail("admin@justimind.ai");
    setPassword("password123");
  };

  return (
    <div
      data-theme={theme}
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bg)",
        color: "var(--text)",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 24, insetInlineStart: 32, display: "flex", alignItems: "center", gap: 16 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--text)" }}>
          <div className="app-logo-mark">
            <Scale size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: "var(--text)" }}>JustiMind</span>
        </Link>
      </div>

      <div style={{ position: "absolute", top: 24, insetInlineEnd: 32 }}>
        <LanguageSelector variant="topbar" />
      </div>

      <div
        className="jm-card jm-animate-pop-in"
        style={{
          maxWidth: 430,
          width: "100%",
          padding: 34,
          border: "1px solid var(--card-border-glow)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 26 }}>
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
              boxShadow: "0 4px 18px var(--gold-glow)",
            }}
          >
            <Scale size={24} />
          </div>
          <h2 className="jm-display" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 6px", color: "var(--text)" }}>
            {mode === "login" ? t("auth.signInTitle") : t("auth.signUpTitle")}
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            {mode === "login" ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
          </p>
        </div>

        {error && (
          <div className="jm-error" style={{ marginBottom: 16 }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="jm-field">
              <label>{t("auth.fullName")}</label>
              <input
                type="text"
                required
                placeholder="Elena Rostova"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div className="jm-field">
            <label>{t("auth.email")}</label>
            <input
              type="email"
              required
              placeholder="counsel@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="jm-field">
            <label>{t("auth.password")}</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="jm-btn jm-btn--primary jm-btn--full"
            disabled={loading}
            style={{ height: 44, marginTop: 8, fontSize: 14 }}
          >
            {loading ? (
              <Loader2 size={16} className="jm-spin" />
            ) : mode === "login" ? (
              <>{t("auth.signInBtn")} <ArrowRight size={15} /></>
            ) : (
              <>{t("auth.signUpBtn")} <ArrowRight size={15} /></>
            )}
          </button>
        </form>

        {mode === "login" && (
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="jm-btn"
              style={{ width: "100%", justifyContent: "center", fontSize: 12.5, padding: "9px 12px", borderColor: "var(--card-border-glow)" }}
            >
              <Sparkles size={13} style={{ color: "var(--gold)" }} /> {t("auth.demoTitle")}
            </button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "var(--text-muted)" }}>
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              style={{ background: "none", border: "none", color: "var(--gold-light)", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}
            >
              {t("auth.noAccount")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              style={{ background: "none", border: "none", color: "var(--gold-light)", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}
            >
              {t("auth.haveAccount")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
