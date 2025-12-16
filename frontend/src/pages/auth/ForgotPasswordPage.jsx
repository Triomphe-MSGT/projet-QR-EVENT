import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../../services/authService";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import Button from "../../components/ui/Button";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Une erreur est survenue.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la connexion
        </Link>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Mot de passe oublié ?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Entrez votre adresse email et nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
        </p>

        {isSubmitted ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <Mail className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Email envoyé !
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Si un compte existe avec cette adresse, vous recevrez un email avec
              les instructions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Adresse Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="exemple@email.com"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Envoi...
                </>
              ) : (
                "Envoyer le lien"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
