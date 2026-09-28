import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelector({ variant = "topbar" }) {
  const { language, setLanguage, currentLangMeta, SUPPORTED_LANGUAGES, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLanding = variant === "landing";

  return (
    <div className="jm-lang-selector-container" ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="jm-lang-btn"
        aria-label="Select Language"
        title={t("common.selectLanguage")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: isLanding ? "7px 13px" : "6px 11px",
          background: isLanding ? "rgba(255, 255, 255, 0.06)" : "var(--surface)",
          border: isLanding ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid var(--card-border)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: isLanding ? 13 : 12,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.18s ease",
        }}
      >
        <Globe size={14} style={{ color: "var(--gold)" }} />
        <span style={{ fontSize: 13 }}>{currentLangMeta.flag}</span>
        <span style={{ fontFamily: "inherit" }}>{currentLangMeta.nativeName}</span>
        <ChevronDown
          size={12}
          style={{
            color: "var(--text-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {isOpen && (
        <div
          className="jm-lang-dropdown jm-animate-pop-in"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 220,
            background: "var(--surface-elevated, var(--surface))",
            border: "1px solid var(--card-border-glow, var(--card-border))",
            borderRadius: 10,
            boxShadow: "var(--shadow-lg, 0 12px 30px rgba(0,0,0,0.35))",
            padding: 6,
            zIndex: 1000,
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              padding: "6px 10px 8px",
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              borderBottom: "1px solid var(--card-border)",
              marginBottom: 4,
            }}
          >
            {t("common.selectLanguage")}
          </div>

          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.id === language;
              return (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id);
                    setIsOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    background: isSelected ? "var(--gold-glow, rgba(212, 175, 55, 0.12))" : "transparent",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    textAlign: "left",
                    color: isSelected ? "var(--gold-light, var(--text))" : "var(--text)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "var(--surface-hover, rgba(255, 255, 255, 0.05))";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ fontSize: 16 }}>{lang.flag}</span>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: isSelected ? 700 : 500 }}>
                        {lang.nativeName}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                        {lang.name} {lang.dir === "rtl" ? "• RTL" : ""}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check size={14} style={{ color: "var(--gold)" }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
