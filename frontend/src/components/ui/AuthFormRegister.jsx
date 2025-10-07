import { useState } from "react";
import Button from "./Button/";

const AuthFormRegister = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          S'inscrire
        </h2>
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="inscrire"> s'inscrire</Button>
        <div className="text-center my-6 text-gray-400">- OU -</div>
        <Button
          onClick={() => console.log("Google login clicked")}
          variant="google"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            className="w-5 h-5"
          />
          Continuer avec Google
        </Button>
      </form>
    </>
  );
};

export default AuthFormRegister;
