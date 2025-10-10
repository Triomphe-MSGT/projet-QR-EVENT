import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "./Button/";
import authService from "../../services/authService";
import { login } from "../../slices/authSlice";

const AuthFormRegister = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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
      const data = await authService.register({ email, username, password });

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

      <div>
        <label className="sr-only" htmlFor="username">
          Nom et prénom
        </label>
        <input
          id="username"
          type="text"
          value={username}
          placeholder="Nom et Prénom"
          onChange={({ target }) => setUsername(target.value)}
          required
          className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB] transition-colors duration-300"
        />
      </div>

      <div>
        <label className="sr-only" htmlFor="signup-email">
          Adresse e-mail
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          placeholder="Adresse e-mail"
          onChange={({ target }) => setEmail(target.value)}
          required
          className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB] transition-colors duration-300"
        />
      </div>

      <div>
        <label className="sr-only" htmlFor="signup-password">
          Mot de passe
        </label>
        <input
          id="signup-password"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          required
          className="w-full p-3 border border-gray-300 dark:border-[#3E4042] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#3A3B3C] dark:text-[#E4E6EB] transition-colors duration-300"
        />
      </div>

      <Button type="submit" variant="inscrire" disabled={loading}>
        {loading ? "Inscription..." : "S'inscrire"}
      </Button>

      <div className="text-center my-6 text-gray-400 dark:text-[#B0B3B8]">
        - OU -
      </div>

      <Button
        type="button"
        onClick={() => console.log("Google login clicked")}
        variant="google"
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          className="w-5 h-5 mr-2"
        />
        Continuer avec Google
      </Button>
    </form>
  );
};

export default AuthFormRegister;
