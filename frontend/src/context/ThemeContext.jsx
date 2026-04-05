import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * ThemeContext: Force le mode "Clair" (Light Mode) dans toute l'application.
 * Le mode sombre a été retiré à la demande de l'utilisateur.
 */
const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
});

export const ThemeProvider = ({
  children,
  storageKey = "app-theme",
}) => {
  // On ignore le localstorage et on force le mode light
  const [theme] = useState("light");

  useEffect(() => {
    const root = window.document.documentElement;
    // On s'assure que seule la classe 'light' est présente et on retire 'dark'
    root.classList.remove("dark");
    root.classList.add("light");
    
    // On nettoie éventuellement le localStorage pour ne pas laisser de traces
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Le setter ne fait plus rien car le mode dark est désactivé
  const setTheme = () => {
    console.warn("Le changement de thème est désactivé (Mode Clair forcé).");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
