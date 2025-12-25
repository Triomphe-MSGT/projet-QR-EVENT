import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-6xl font-bold text-red-500 mb-4">🚫 403</h1>
      <h2 className="text-2xl font-semibold mb-2">Accès refusé</h2>
      <p className="text-gray-600 mb-6">
        Vous n'avez pas la permission pour accéder à cette page.
      </p>
      <button
        onClick={handleGoHome}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Retour à l'accueil
      </button>
    </div>
  );
};

export default Unauthorized;
