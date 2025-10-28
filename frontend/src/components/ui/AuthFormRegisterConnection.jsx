import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "./Button/";
import Togglable from "./Togglable";
import authService from "../../services/authService";
import { login } from "../../slices/authSlice";
import { GoogleLogin } from "@react-oauth/google";

const AuthFormRegisterConnection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Inscription");

  // ------------------------
  // États pour connexion
  // ------------------------
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ------------------------
  // États pour inscription
  // ------------------------
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("visiteur");
  const [sexe, setSexe] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");

  // ------------------------
  // Gestion Connexion
  // ------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.login(loginEmail, loginPassword);
      dispatch(login(data));
      localStorage.setItem("token", data.token);

      const role = data.user.role;
      if (role === "Organisateur") navigate("/createevent");
      else if (role === "Participant") navigate("/home");
      else navigate("/");
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
      const payload = {
        nom: registerUsername,
        email: registerEmail,
        password: registerPassword,
        role,
        sexe,
        phone: role === "Organisateur" ? phone : undefined,
        profession: role === "Organisateur" ? profession : undefined,
      };
      const data = await authService.register(payload);
      dispatch(login(data));
      localStorage.setItem("token", data.token);

      const roleUser = data.user.role;
      if (roleUser === "Organisateur") navigate("/createevent");
      else if (roleUser === "Participant") navigate("/dashboard");
      else navigate("/");
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
      dispatch(login(data));
      localStorage.setItem("token", data.token);

      const roleUser = data.user.role; // 🧩 Nouveau style "toggle" inspiré de tes boutons Connexion / Inscription
      if (roleUser === "Organisateur") navigate("/createevent");
      else if (roleUser === "Participant") navigate("/dashboard");
      else navigate("/");
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
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
            >
              <option value="Participant">Participant</option>
              <option value="Organisateur">Organisateur</option>
            </select>
            <select
              value={sexe}
              onChange={(e) => setSexe(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
            >
              <option value="">Sélectionnez votre sexe</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
              <option value="Autre">Autre</option>
            </select>
            {role === "Organisateur" && (
              <>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Numéro de téléphone"
                  required
                  className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
                />
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Métier ou domaine d'étude"
                  required
                  className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
                />
              </>
            )}
            <input
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              placeholder="Mot de passe"
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
                useOneTap
                text="signup_with"
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
