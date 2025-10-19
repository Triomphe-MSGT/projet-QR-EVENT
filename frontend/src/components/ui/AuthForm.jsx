import { useState } from "react";
import Button from "./Button/";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { login } from "../../slices/authSlice";
import { GoogleLogin } from "@react-oauth/google";

const AuthForms = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ------------------------
  // États communs
  // ------------------------
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Participant");
  const [sexe, setSexe] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ------------------------
  // Gestion de la connexion
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
      switch (role) {
        case "organisateur":
          navigate("/createevent", { replace: true });
          break;
        case "Participant":
          navigate("/dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) {
      setError("Impossible de récupérer le token Google");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.googleLogin(credentialResponse.credential);
      dispatch(login(data));
      localStorage.setItem("token", data.token);

      const role = data.user.role;
      switch (role) {
        case "organisateur":
          navigate("/createevent", { replace: true });
          break;
        case "Participant":
          navigate("/dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la connexion Google");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Gestion de l'inscription
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
      switch (roleUser) {
        case "organisateur":
          navigate("/createevent", { replace: true });
          break;
        case "Participant":
          navigate("/dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#18191A] p-4 transition-colors duration-500">
      <div className="grid grid-cols-2 gap-10 max-w-6xl w-full">
        {/* ------------------------ */}
        {/* Formulaire Inscription */}
        {/* ------------------------ */}
        <form
          onSubmit={handleRegister}
          className="space-y-6 bg-white dark:bg-[#242526] p-6 rounded-xl shadow-md dark:shadow-none transition-colors duration-500"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-[#E4E6EB]">
            S'inscrire
          </h2>

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          <input
            type="text"
            placeholder="Nom et Prénom"
            value={registerUsername}
            onChange={({ target }) => setRegisterUsername(target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg"
          />

          <input
            type="email"
            placeholder="Adresse e-mail"
            value={registerEmail}
            onChange={({ target }) => setRegisterEmail(target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg"
          />

          <select
            value={role}
            onChange={({ target }) => setRole(target.value)}
            className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg"
          >
            <option value="Participant">Participant</option>
            <option value="Organisateur">Organisateur</option>
          </select>

          <select
            value={sexe}
            onChange={({ target }) => setSexe(target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg"
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
                placeholder="Numéro de téléphone"
                value={phone}
                onChange={({ target }) => setPhone(target.value)}
                required
                className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg"
              />
              <input
                type="text"
                placeholder="Métier ou domaine d'étude"
                value={profession}
                onChange={({ target }) => setProfession(target.value)}
                required
                className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg"
              />
            </>
          )}

          <input
            type="password"
            placeholder="Mot de passe"
            value={registerPassword}
            onChange={({ target }) => setRegisterPassword(target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg"
          />
          <input
            type="password"
            placeholder="Confirmez le mot de passe"
            value={confirmPassword}
            onChange={({ target }) => setConfirmPassword(target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg"
          />

          <Button type="submit" variant="inscrire" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </Button>

          <div className="text-center my-6 text-gray-400 dark:text-[#B0B3B8]">
            - OU -
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Échec de la connexion Google")}
              useOneTap
            />
          </div>
        </form>

        {/* ------------------------ */}
        {/* Formulaire Connexion */}
        {/* ------------------------ */}
        <form
          onSubmit={handleLogin}
          className="space-y-6 bg-white dark:bg-[#242526] p-6 rounded-xl shadow-md dark:shadow-none transition-colors duration-500"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-[#E4E6EB]">
            Se connecter
          </h2>

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          <input
            type="email"
            placeholder="Adresse e-mail"
            value={loginEmail}
            onChange={({ target }) => setLoginEmail(target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={loginPassword}
            onChange={({ target }) => setLoginPassword(target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg"
          />

          <Button type="submit" variant="connecter" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>

          <div className="text-center my-6 text-gray-400 dark:text-[#B0B3B8]">
            - OU -
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Échec de la connexion Google")}
              useOneTap
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForms;
