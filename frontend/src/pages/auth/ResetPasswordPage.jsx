import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../../services/authService";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, CheckCircle2, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Mot de passe modifié !</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-8">
                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
              </p>
              <Link
                to="/login"
                className="inline-block w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-sm shadow-lg shadow-green-500/20"
              >
                Se connecter maintenant
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Nouveau mot de passe</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Choisissez un mot de passe sécurisé pour votre compte.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#3E4042] rounded-2xl text-gray-900 dark:text-[#E4E6EB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#3E4042] rounded-2xl text-gray-900 dark:text-[#E4E6EB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  {mutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Changer le mot de passe"
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

export default ResetPasswordPage;
