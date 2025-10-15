import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "./Button/";
import authService from "../../services/authService";
import { login } from "../../slices/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const AuthFormRegister = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Participant");
  const [sexe, setSexe] = useState("");
  const [phone, setPhone] = useState("");
  const [metier, setMetier] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.register({
        email,
        username,
        password,
        role,
        sexe,
        phone: role === "Organisateur" ? phone : undefined,
        metier: role === "Organisateur" ? metier : undefined,
      });

      dispatch(login(data));
      localStorage.setItem("token", data.token);

      const user = data.user;
      if (!user || !user.role) {
        navigate("/dashboard", { replace: true });
        return;
      }

      switch (user.role) {
        case "organizer":
          navigate("/createevent", { replace: true });
          break;
        case "user":
          navigate("/dashboard", { replace: true });
          break;
        case "admin":
          navigate("/admin", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Gestion du login Google
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      // Envoi au service d’auth
      const data = await authService.googleLogin({
        token: {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        },
      });

      dispatch(login(data));
      localStorage.setItem("token", data.token);

      const user = data.user;
      switch (user.role) {
        case "organizer":
          navigate("/createevent", { replace: true });
          break;
        case "user":
          navigate("/dashboard", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la connexion avec Google");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full max-w-md bg-white dark:bg-[#242526] p-6 rounded-xl shadow-md dark:shadow-none transition-colors duration-500"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-[#E4E6EB]">
        S'inscrire
      </h2>

      {error && (
        <p className="text-red-500 text-center text-sm mb-2">{error}</p>
      )}

      {/* Nom complet */}
      <div>
        <input
          id="username"
          type="text"
          value={username}
          placeholder="Nom et Prénom"
          onChange={({ target }) => setUsername(target.value)}
          required
          className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
        />
      </div>

      {/* Email */}
      <div>
        <input
          id="signup-email"
          type="email"
          value={email}
          placeholder="Adresse e-mail"
          onChange={({ target }) => setEmail(target.value)}
          required
          className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
        />
      </div>

      {/* Sélection du rôle */}
      <div>
        <select
          value={role}
          onChange={({ target }) => setRole(target.value)}
          className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
        >
          <option value="Participant">Participant</option>
          <option value="Organisateur">Organisateur</option>
        </select>
      </div>

      {/* Sexe */}
      <div>
        <select
          value={sexe}
          onChange={({ target }) => setSexe(target.value)}
          required
          className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
        >
          <option value="">Sélectionnez votre sexe</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
          <option value="Autre">Autre</option>
        </select>
      </div>

      {/* Numéro de téléphone (si organisateur) */}
      {role === "Organisateur" && (
        <div>
          <input
            type="tel"
            value={phone}
            placeholder="Numéro de téléphone"
            onChange={({ target }) => setPhone(target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
          />
        </div>
      )}

      {/* Métier (si organisateur) */}
      {role === "Organisateur" && (
        <div>
          <input
            type="text"
            value={metier}
            placeholder="Métier ou domaine d'étude"
            onChange={({ target }) => setMetier(target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
          />
        </div>
      )}

      {/* Mot de passe */}
      <div>
        <input
          id="signup-password"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          required
          className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
        />
      </div>

      {/* Confirmation du mot de passe */}
      <div>
        <input
          id="confirm-password"
          type="password"
          placeholder="Confirmez le mot de passe"
          value={confirmPassword}
          onChange={({ target }) => setConfirmPassword(target.value)}
          required
          className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
        />
      </div>

      <Button type="submit" variant="inscrire" disabled={loading}>
        {loading ? "Inscription..." : "S'inscrire"}
      </Button>

      <div className="text-center my-6 text-gray-400 dark:text-[#B0B3B8]">
        - OU -
      </div>

      {/* ✅ Connexion via Google */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setError("Échec de la connexion Google")}
          useOneTap
        />
      </div>
    </form>
  );
};

export default AuthFormRegister;
