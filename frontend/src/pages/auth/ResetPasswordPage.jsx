import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../../services/authService";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, CheckCircle, Loader2 } from "lucide-react";
import Button from "../../components/ui/Button";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: ({ token, newPassword }) => resetPassword(token, newPassword),
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Lien invalide ou expiré.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    mutation.mutate({ token, newPassword });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Réinitialisation du mot de passe
        </h2>

        {isSuccess ? (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Mot de passe modifié !
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vous allez être redirigé vers la page de connexion...
            </p>
            <Link to="/login">
              <Button variant="primary" className="w-full justify-center">
                Se connecter maintenant
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="newPassword"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center mt-4"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                  Modification...
                </>
              ) : (
                "Changer le mot de passe"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
