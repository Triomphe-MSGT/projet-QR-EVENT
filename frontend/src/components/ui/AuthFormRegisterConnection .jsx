import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "./Button/"; // Assurez-vous que le chemin vers Button est correct
import Togglable from "./Togglable"; // Assurez-vous que le chemin vers Togglable est correct
import authService from "../../services/authService";
import { login } from "../../slices/authSlice";
import { GoogleLogin } from "@react-oauth/google";

// 1. Importer le hook de React Query
import { useQueryClient } from "@tanstack/react-query";

const AuthFormRegisterConnection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 2. Initialiser le client de query
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Inscription");

  // ------------------------
  // États pour connexion
  // ------------------------
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ------------------------
  // États pour inscription (simplifié)
  // ------------------------
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ------------------------
  // Gestion Connexion
  // ------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.login(loginEmail, loginPassword);

      // Mettre à jour Redux (et localStorage)
      dispatch(login(data));

      // --- FORCER LE NETTOYAGE DU CACHE ---
      // Dit à React Query que les données "visiteur" sont périmées
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["userEvents"] });
      // --- FIN CORRECTION ---

      const role = data.user.role;
      // Redirige en fonction du rôle
      if (role === "Organisateur")
        navigate("/dashboard"); // Vers le dashboard Orga
      else if (role === "Administrateur")
        navigate("/admin"); // Vers le dashboard Admin
      else navigate("/home"); // Pour les Participants
    } catch (err) {
      setError(err.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Gestion Inscription
  // ------------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (registerPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      // Le payload est simplifié (pas de rôle, sexe, etc.)
      const payload = {
        nom: registerUsername,
        email: registerEmail,
        password: registerPassword,
      };

      const data = await authService.register(payload);

      // Mettre à jour Redux (et localStorage)
      dispatch(login(data));

      // --- FORCER LE NETTOYAGE DU CACHE ---
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["userEvents"] });
      // --- FIN CORRECTION ---

      // Redirige le nouveau participant vers la page d'accueil connectée
      navigate("/home");
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Gestion Google
  // ------------------------
  const handleGoogle = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Impossible de récupérer le token Google");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.googleLogin(credentialResponse.credential);

      // Mettre à jour Redux (et localStorage)
      dispatch(login(data));

      // --- FORCER LE NETTOYAGE DU CACHE ---
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["userEvents"] });
      // --- FIN CORRECTION ---

      const roleUser = data.user.role;
      // Redirige en fonction du rôle
      if (roleUser === "Organisateur") navigate("/dashboard");
      else if (roleUser === "Administrateur") navigate("/admin");
      else navigate("/home");
    } catch (err) {
      console.error(err);
      setError(
        activeTab === "Inscription"
          ? "Erreur lors de l'inscription avec Google"
          : "Erreur lors de la connexion avec Google"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Le JSX complet ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#18191A] p-4 transition-colors duration-500">
      <Togglable
        title="Qr-Event"
        firstTabLabel="Inscription"
        secondTabLabel="Connexion"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        firstTabContent={
          <form
            onSubmit={handleRegister}
            className="space-y-6 w-full max-w-md bg-white dark:bg-[#242526] p-6 rounded-xl shadow-md dark:shadow-none transition-colors duration-500"
          >
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-[#E4E6EB]">
              S'inscrire
            </h2>

            {error && (
              <p className="text-red-500 text-center text-sm mb-2">{error}</p>
            )}

            <input
              type="text"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              placeholder="Nom et Prénom"
              required
              className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
            />
            <input
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="Adresse e-mail"
              required
              className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
            />

            {/* Les champs 'role', 'sexe', etc. sont retirés pour l'inscription simplifiée */}

            <input
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              placeholder="Mot de passe (min. 6 caractères)"
              required
              className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez le mot de passe"
              required
              className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
            />

            <Button type="submit" variant="inscrire" disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>

            <div className="text-center my-6 text-gray-400 dark:text-[#B0B3B8]">
              - OU -
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setError("Échec de l'inscription Google")}
                text="signup_with" // Texte pour s'inscrire
              />
            </div>
          </form>
        }
        secondTabContent={
          <form
            onSubmit={handleLogin}
            className="space-y-6 w-full max-w-md bg-white dark:bg-[#242526] p-6 rounded-xl shadow-md dark:shadow-none transition-colors duration-500"
          >
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-[#E4E6EB]">
              Se connecter
            </h2>

            {error && (
              <p className="text-red-500 text-center text-sm mb-2">{error}</p>
            )}

            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Adresse e-mail"
              required
              className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
            />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
            />

            <Button type="submit" variant="connecter" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="text-center my-6 text-gray-400 dark:text-[#B0B3B8]">
              - OU -
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setError("Échec de la connexion Google")}
                useOneTap
                text="signin_with"
              />
            </div>
          </form>
        }
      />
    </div>
  );
};

export default AuthFormRegisterConnection;
