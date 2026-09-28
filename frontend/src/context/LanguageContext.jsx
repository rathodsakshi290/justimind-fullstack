import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { translations, SUPPORTED_LANGUAGES } from "../locales/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("justimind_language");
    if (saved && translations[saved]) {
      return saved;
    }
    // Check browser language
    const browserLang = (navigator.language || "").slice(0, 2).toLowerCase();
    return translations[browserLang] ? browserLang : "en";
  });

  const currentLangMeta = useMemo(() => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.id === language) ||
      SUPPORTED_LANGUAGES[0]
    );
  }, [language]);

  const setLanguage = (langCode) => {
    if (!translations[langCode]) return;
    setLanguageState(langCode);
    try {
      localStorage.setItem("justimind_language", langCode);
    } catch (e) {
      console.warn("Could not write language to localStorage", e);
    }
  };

  // Keep HTML document attributes in sync (for accessibility and RTL layouts)
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = currentLangMeta.dir;
    if (currentLangMeta.dir === "rtl") {
      document.body.classList.add("rtl-layout");
    } else {
      document.body.classList.remove("rtl-layout");
    }
  }, [language, currentLangMeta]);

  /**
   * Helper function to translate keys using dot notation
   * e.g., t("nav.workspace"), t("common.save", "Save")
   */
  const t = (keyPath, fallback = "") => {
    if (!keyPath) return fallback;
    const parts = keyPath.split(".");

    // 1. Try active language
    let activeVal = translations[language];
    for (const p of parts) {
      if (activeVal && typeof activeVal === "object" && p in activeVal) {
        activeVal = activeVal[p];
      } else {
        activeVal = undefined;
        break;
      }
    }

    if (activeVal !== undefined && typeof activeVal === "string") {
      return activeVal;
    }

    // 2. Fallback to English
    let enVal = translations.en;
    for (const p of parts) {
      if (enVal && typeof enVal === "object" && p in enVal) {
        enVal = enVal[p];
      } else {
        enVal = undefined;
        break;
      }
    }

    if (enVal !== undefined && typeof enVal === "string") {
      return enVal;
    }

    return fallback || keyPath;
  };

  const isRTL = currentLangMeta.dir === "rtl";

  const value = {
    language,
    setLanguage,
    currentLangMeta,
    isRTL,
    SUPPORTED_LANGUAGES,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
