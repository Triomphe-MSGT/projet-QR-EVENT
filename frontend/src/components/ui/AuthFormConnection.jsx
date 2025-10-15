import { useState } from "react";
import Button from "./Button/";
import Togglable from "./Togglable";
import AuthFormRegister from "./AuthFormRegister";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { login } from "../../slices/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const AuthFormRegisterConnection = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(email, password);
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
          navigate("/home", { replace: true });
          break;
        case "admin":
          navigate("/admin", { replace: true });
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
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      // Décodé : { name, email, picture, ... }

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#18191A] p-4 transition-colors duration-500">
      <Togglable
        title="Qr-Event"
        firstTabLabel="Inscription"
        secondTabLabel="Connexion"
        firstTabContent={<AuthFormRegister />}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-6 w-full max-w-md bg-white dark:bg-[#242526] p-6 rounded-xl shadow-md dark:shadow-none transition-colors duration-500"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-[#E4E6EB]">
            Se connecter
          </h2>

          {error && (
            <p className="text-red-500 text-center text-sm mb-2">{error}</p>
          )}

          {/* Email */}
          <div>
            <label className="sr-only" htmlFor="email">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="Adresse e-mail"
              onChange={({ target }) => setEmail(target.value)}
              required
              className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="sr-only" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              required
              className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
            />
          </div>

          {/* Bouton connexion */}
          <Button type="submit" variant="connecter" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>

          <div className="text-center text-sm text-blue-600 mt-2 dark:text-blue-400">
            <a href="#" className="hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

          <div className="text-center my-6 text-gray-400 dark:text-[#B0B3B8]">
            - OU -
          </div>

          {/* --- Connexion Google --- */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Échec de la connexion Google")}
              useOneTap
            />
          </div>
        </form>
      </Togglable>
    </div>
  );
};

export default AuthFormRegisterConnection;
