import React, { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  Scale, MessageSquare, FileText, Brain, FileSearch2, BarChart3,
  Network, ShieldCheck, Sun, Moon, LogOut, Newspaper, Search,
  Sparkles, Bell, CheckCircle2, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import FloatingCopilot from "./FloatingCopilot";
import LanguageSelector from "./LanguageSelector";

const SAMPLE_NOTIFICATIONS = [
  { id: 1, text: "Google Gemini legal model connected", time: "Just now" },
  { id: 2, text: "CourtListener judicial repository synced", time: "12m ago" },
  { id: 3, text: "Automated OCR & parser pipeline online", time: "1h ago" },
];

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);

  const navGroups = [
    {
      title: t("nav.aiWorkflows"),
      items: [
        { to: "/workspace", label: t("nav.workspace"), icon: MessageSquare, badge: "Live" },
        { to: "/summarizer", label: t("nav.summarizer"), icon: FileText },
        { to: "/prediction", label: t("nav.prediction"), icon: Brain },
        { to: "/analyzer", label: t("nav.analyzer"), icon: FileSearch2 },
        { to: "/verification", label: t("nav.verification"), icon: CheckCircle2, badge: "SMT" },
      ]
    },
    {
      title: t("nav.researchIntelligence"),
      items: [
        { to: "/search", label: t("nav.search"), icon: Search },
        { to: "/knowledge-graph", label: t("nav.knowledgeGraph"), icon: Network },
        { to: "/news", label: t("nav.news"), icon: Newspaper },
        { to: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "JM";

  return (
    <div className={`app-shell ${isRTL ? "rtl-mode" : ""}`} data-theme={theme} dir={isRTL ? "rtl" : "ltr"}>
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <Link to="/workspace" className="app-logo">
          <div className="app-logo-mark">
            <Scale size={18} />
          </div>
          <div>
            <div style={{ lineHeight: 1.1 }}>JustiMind</div>
            <div style={{ fontSize: 10, color: "var(--gold-light)", fontWeight: 600, letterSpacing: "0.06em" }} className="jm-mono">
              {t("common.tagline")}
            </div>
          </div>
          <span className="jm-badge jm-badge-gold" style={{ fontSize: 9.5, padding: "1px 5px", marginInlineStart: "auto" }}>
            {t("common.enterprise")}
          </span>
        </Link>

        <div style={{ flex: 1, overflowY: "auto", margin: "0 -6px", padding: "0 6px" }}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: 16 }}>
              <div className="app-nav-section-title">{group.title}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `app-nav-item ${isActive ? "active" : ""}`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        marginInlineStart: "auto",
                        fontSize: 9.5,
                        background: "rgba(56, 189, 248, 0.15)",
                        color: "var(--blue)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontWeight: 700,
                        fontFamily: "'IBM Plex Mono', monospace"
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}

          {user?.role === "Admin" && (
            <div style={{ marginBottom: 16 }}>
              <div className="app-nav-section-title">{t("nav.administration")}</div>
              <NavLink to="/admin" className={({ isActive }) => `app-nav-item ${isActive ? "active" : ""}`}>
                <ShieldCheck size={16} />
                <span>{t("nav.admin")}</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* User Profile Row */}
        <div className="app-user-row">
          <div className="app-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="app-user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.full_name || t("topbar.counselRole")}
            </div>
            <div className="app-user-role">{user?.role || t("topbar.attorneyRole")}</div>
          </div>
          <button
            onClick={handleLogout}
            className="jm-icon-btn"
            style={{ width: 28, height: 28, border: "none", background: "transparent", color: "var(--sidebar-text)" }}
            title={t("topbar.signOut")}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main App Content */}
      <main className="app-main">
        {/* Top Header */}
        <header className="app-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <h1 className="app-h1">{title}</h1>
            <div
              className="jm-badge jm-badge-gold"
              style={{ fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <Sparkles size={11} />
              <span>{t("topbar.geminiActive")}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Quick Search Button */}
            <Link
              to="/search"
              className="jm-btn"
              style={{
                padding: "6px 14px",
                fontSize: 12.5,
                color: "var(--text-secondary)",
                background: "var(--surface)",
                borderColor: "var(--card-border)",
                textDecoration: "none",
              }}
            >
              <Search size={13} style={{ color: "var(--gold)" }} />
              <span className="jm-mono" style={{ fontSize: 11 }}>{t("topbar.searchPrecedents")}</span>
            </Link>

            {/* Jurisdiction Multi-Language Selector */}
            <LanguageSelector variant="topbar" />

            {/* Notifications Menu */}
            <div style={{ position: "relative" }}>
              <button
                className="jm-icon-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title={t("topbar.notifications")}
              >
                <Bell size={15} />
              </button>

              {showNotifications && (
                <div
                  className="jm-card jm-animate-pop-in"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 44,
                    width: 300,
                    padding: 16,
                    zIndex: 100,
                    boxShadow: "var(--shadow-lg)",
                    border: "1px solid var(--card-border-glow)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{t("topbar.notifications")}</div>
                    <X size={14} style={{ cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setShowNotifications(false)} />
                  </div>
                  {SAMPLE_NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "8px 0",
                        borderBottom: "1px solid var(--card-border)",
                        fontSize: 12,
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <CheckCircle2 size={14} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ color: "var(--text)" }}>{n.text}</div>
                        <div style={{ color: "var(--text-dim)", fontSize: 10.5 }} className="jm-mono">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Switcher */}
            <button
              className="jm-icon-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? t("topbar.switchThemeLight") : t("topbar.switchThemeDark")}
            >
              {theme === "dark" ? <Sun size={15} style={{ color: "var(--gold)" }} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* Content View */}
        <div className="app-content jm-animate-fade-in-up" key={title}>
          {children}
        </div>
      </main>

      {/* Global Floating AI Legal Copilot */}
      <FloatingCopilot />
    </div>
  );
}
