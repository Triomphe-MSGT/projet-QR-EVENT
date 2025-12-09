// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   useMemo,
// } from "react";

// // 1. Définir les langues que vous supportez
// const supportedLanguages = [
//   { code: "fr", name: "Français" },
//   { code: "en", name: "English" },
// ];

// // 2. Tenter de récupérer la langue sauvegardée, sinon utiliser 'fr' par défaut
// const getDefaultLanguage = () => {
//   if (typeof window === "undefined") return "fr";
//   const savedLang = localStorage.getItem("appLanguage");
//   return savedLang || "fr";
// };

// // 3. Créer le Contexte
// const LanguageContext = createContext(null);
// LanguageContext.displayName = "LanguageContext"; // Pour le débogage

// // 4. Créer le Fournisseur (Provider)
// export const LanguageProvider = ({ children }) => {
//   const [language, setLanguageState] = useState(getDefaultLanguage());

//   // 5. Mettre à jour l'attribut HTML (bon pour l'accessibilité)
//   useEffect(() => {
//     document.documentElement.lang = language;
//   }, [language]);

//   // 6. Créer la fonction pour changer la langue
//   const setLanguage = (newLang) => {
//     setLanguageState(newLang);
//     localStorage.setItem("appLanguage", newLang);
//   };

//   // 7. Mémoriser la valeur pour éviter les re-rendus inutiles
//   const value = useMemo(
//     () => ({
//       language,
//       setLanguage,
//       supportedLanguages,
//     }),
//     [language]
//   );

//   return (
//     <LanguageContext.Provider value={value}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };

// // 8. Créer le Hook (que votre page de paramètres utilise)
// export const useLanguage = () => {
//   const context = useContext(LanguageContext);
//   if (!context) {
//     throw new Error(
//       "useLanguage doit être utilisé à l'intérieur d'un LanguageProvider"
//     );
//   }
//   return context;
// };
