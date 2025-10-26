import React from "react";
import MainLayout from "../components/layouts/MainLayout";
import { useTheme } from "../context/ThemeContext";

import { Sun, Moon, Bell, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, supportedLanguages } = useLanguage();

  const handleThemeChange = (newTheme) => {
    if (theme !== newTheme) setTheme(newTheme);
  };

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    if (language !== newLang) setLanguage(newLang);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Paramètres
        </h1>

        <div className="space-y-8">
          {/* --- Section Thème --- */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
              <Sun className="w-5 h-5 mr-2 text-yellow-500" />/
              <Moon className="w-5 h-5 ml-2 mr-2 text-indigo-400" />
              Apparence (Thème)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choisissez l'apparence visuelle de l'application.
            </p>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex-1 p-3 rounded-md border-2 transition-colors ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Sun className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Clair
                </span>
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex-1 p-3 rounded-md border-2 transition-colors ${
                  theme === "dark"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Moon className="w-6 h-6 mx-auto mb-1 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Sombre
                </span>
              </button>
            </div>
          </section>

          {/* --- Section Langue --- */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-green-600" />
              Langue de l'application
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choisissez la langue d'affichage de l'interface.
            </p>

            <div>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition"
                aria-label="Sélectionner la langue"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Certains contenus pourraient ne pas être traduits immédiatement.
            </p>
          </section>

          {/* ---- Section Notifications ---- */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-red-500" />
              Notifications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Gérez vos préférences de notification. (Fonctionnalité à venir)
            </p>

            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-md cursor-not-allowed opacity-60">
              <span className="text-gray-700 dark:text-gray-300">
                Activer les notifications push
              </span>
              <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full p-0.5">
                <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
