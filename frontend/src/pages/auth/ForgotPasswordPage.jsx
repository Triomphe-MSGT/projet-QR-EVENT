import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../../services/authService";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#18191A] p-4 py-12 transition-colors duration-500">
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Logo/Brand Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-400 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4 transform -rotate-6">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">
            Qr-Event<span className="text-blue-500">.</span>
          </h1>
        </div>

        <div className="bg-white dark:bg-[#242526] p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-[#3E4042]">
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Link>

          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Email envoyé !</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-8">
                Si un compte existe avec cette adresse, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
              </p>
              <Link
                to="/login"
                className="inline-block w-full py-4 bg-gray-100 dark:bg-[#3A3B3C] hover:bg-gray-200 dark:hover:bg-[#4E4F50] text-gray-900 dark:text-white font-black rounded-2xl transition-all uppercase tracking-widest text-sm"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Mot de passe oublié ?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Entrez votre email pour recevoir un lien de récupération.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Adresse e-mail"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#3E4042] rounded-2xl text-gray-900 dark:text-[#E4E6EB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  {mutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Envoyer le lien"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;
