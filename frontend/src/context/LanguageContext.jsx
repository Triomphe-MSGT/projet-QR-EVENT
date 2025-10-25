import React, { createContext, useState, useContext, useEffect } from "react";

// Création du contexte
const LanguageContext = createContext();

// Liste des langues supportées
export const SUPPORTED_LANGUAGES = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "it", name: "Italiano" },
];

// Fournisseur du contexte
export const LanguageProvider = ({ children }) => {
  // Fonction pour obtenir la langue initiale
  const getInitialLanguage = () => {
    try {
      const storedLang = localStorage.getItem("appLanguage");
      return SUPPORTED_LANGUAGES.some((lang) => lang.code === storedLang)
        ? storedLang
        : "fr";
    } catch {
      // En cas d’erreur d’accès à localStorage (ex: SSR)
      return "fr";
    }
  };

  const [language, setLanguage] = useState(getInitialLanguage);

  // Met à jour localStorage et <html lang="">
  useEffect(() => {
    try {
      localStorage.setItem("appLanguage", language);
    } catch {
      console.warn("Impossible d'enregistrer la langue dans localStorage");
    }
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personnalisé pour consommer le contexte
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
