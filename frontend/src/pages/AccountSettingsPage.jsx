import React, { useState } from "react";
import MainLayout from "../components/layouts/MainLayout";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext"; // (Vous l'aviez)
import { useChangePassword, useDeleteMyAccount } from "../hooks/useUserProfile"; // (Hooks du backend)
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button"; // (Votre composant bouton)
import { Sun, Moon, Bell, Globe, Key, Trash2, Loader2 } from "lucide-react";

// --- Section 1: Formulaire de Changement de Mot de Passe ---
const ChangePasswordForm = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const mutation = useChangePassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", message: "" });

    if (newPassword.length < 6) {
      setFeedback({
        type: "error",
        message: "Le nouveau mot de passe doit faire au moins 6 caractères.",
      });
      return;
    }

    mutation.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: (data) => {
          setFeedback({ type: "success", message: data.message });
          setOldPassword("");
          setNewPassword("");
        },
        onError: (error) => {
          setFeedback({
            type: "error",
            message: error.response?.data?.error || "Une erreur est survenue.",
          });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Ancien mot de passe
        </label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Nouveau mot de passe
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
      </div>

      {feedback.message && (
        <p
          className={`text-sm ${
            feedback.type === "success"
              ? "text-green-600 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
          }`}
        >
          {feedback.message}
        </p>
      )}

      <div className="text-right">
        <Button type="submit" variant="primary" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Changer le mot de passe"
          )}
        </Button>
      </div>
    </form>
  );
};

// --- Section 2: Zone de Danger (Suppression de compte) ---
const DeleteAccountSection = () => {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const mutation = useDeleteMyAccount(); // Ce hook gère la déconnexion

  const handleDelete = () => {
    if (confirmText !== "SUPPRIMER") {
      alert("Veuillez taper 'SUPPRIMER' pour confirmer.");
      return;
    }

    mutation.mutate(undefined, {
      onSuccess: () => {
        // Le hook (useDeleteMyAccount) gère la déconnexion
        // On redirige vers l'accueil public
        navigate("/", { replace: true });
      },
      onError: (error) => {
        alert(
          `Erreur: ${
            error.response?.data?.error || "Impossible de supprimer le compte."
          }`
        );
      },
    });
  };

  return (
    <div className="space-y-4 p-4 border border-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg">
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
        Supprimer le compte
      </h3>
      <p className="text-sm text-red-600 dark:text-red-200">
        Cette action est irréversible. Toutes vos données, y compris vos
        événements organisés et vos tickets, seront définitivement supprimées.
      </p>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Pour confirmer, veuillez taper "SUPPRIMER" (en majuscules) ci-dessous
          :
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="SUPPRIMER"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700"
        />
      </div>
      <Button
        variant="danger"
        onClick={handleDelete}
        disabled={mutation.isPending || confirmText !== "SUPPRIMER"}
      >
        {mutation.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Trash2 className="w-5 h-5 mr-2" /> Supprimer mon compte
          </>
        )}
      </Button>
    </div>
  );
};

// --- Section 3: Page Principale des Paramètres ---
// (Fusionne votre 'SettingsPage' et 'AccountSettingsPage')
const AccountSettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, supportedLanguages } = useLanguage();

  const handleThemeChange = (newTheme) => {
    if (theme !== newTheme) setTheme(newTheme);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Paramètres
        </h1>

        <div className="space-y-8">
          {/* --- Section Thème (Votre code) --- */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
              <Sun className="w-5 h-5 mr-2 text-yellow-500" />/
              <Moon className="w-5 h-5 ml-2 mr-2 text-indigo-400" />
              Apparence
            </h2>
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

          {/* --- Section Langue (Votre code) --- */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-green-600" />
              Langue
            </h2>
            <div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* --- Section Sécurité (Nouvelle) --- */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
              <Key className="w-5 h-5 mr-2 text-gray-500" />
              Sécurité
            </h2>
            <ChangePasswordForm />
          </section>

          {/* --- Section Zone de Danger (Nouvelle) --- */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Zone de Danger
            </h2>
            <DeleteAccountSection />
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountSettingsPage;
