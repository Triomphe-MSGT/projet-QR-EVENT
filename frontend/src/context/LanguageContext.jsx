// This file is currently unused but kept for future language support implementation.
// To enable, uncomment and wrap the application with LanguageProvider.

/*
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";

// 1. Define supported languages
const supportedLanguages = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
];

// 2. Retrieve saved language or default to 'fr'
const getDefaultLanguage = () => {
  if (typeof window === "undefined") return "fr";
  const savedLang = localStorage.getItem("appLanguage");
  return savedLang || "fr";
};

// 3. Create Context
const LanguageContext = createContext(null);
LanguageContext.displayName = "LanguageContext";

// 4. Create Provider
export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getDefaultLanguage());

  // 5. Update HTML attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // 6. Function to change language
  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem("appLanguage", newLang);
  };

  // 7. Memoize value
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      supportedLanguages,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// 8. Create Hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error(
      "useLanguage must be used within a LanguageProvider"
    );
  }
  return context;
};
*/
