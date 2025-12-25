import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Togglable from "./Togglable";
import authService from "../../services/authService";
import { login } from "../../slices/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";

const AuthFormRegisterConnection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Inscription");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.login(loginEmail, loginPassword);
      dispatch(login(data));
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["userEvents"] });

      const role = data.user.role;
      if (role === "Organisateur") navigate("/dashboard");
      else if (role === "Administrateur") navigate("/admin");
      else navigate("/home");
    } catch (err) {
      setError(err.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

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
      };

      const data = await authService.register(payload);
      dispatch(login(data));
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["userEvents"] });
      navigate("/home");
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Impossible de récupérer le token Google");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.googleLogin(credentialResponse.credential);
      dispatch(login(data));
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["userEvents"] });

      const roleUser = data.user.role;
      if (roleUser === "Organisateur") navigate("/dashboard");
      else if (roleUser === "Administrateur") navigate("/admin");
      else navigate("/home");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(
        activeTab === "Inscription"
          ? `Erreur inscription Google: ${errorMessage}`
          : `Erreur connexion Google: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">Plateforme Événementielle</p>
        </div>

        <Togglable
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          firstTabLabel="Inscription"
          secondTabLabel="Connexion"
          firstTabContent={
            <div className="bg-white dark:bg-[#242526] p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-[#3E4042]">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Créer un compte</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Rejoignez la communauté Qr-Event dès aujourd'hui.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl flex items-center gap-3 animate-shake">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-600 dark:text-red-400 text-xs font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="Nom complet"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#3E4042] rounded-2xl text-gray-900 dark:text-[#E4E6EB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="Adresse e-mail"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#3E4042] rounded-2xl text-gray-900 dark:text-[#E4E6EB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Mot de passe"
                    required
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#3E4042] rounded-2xl text-gray-900 dark:text-[#E4E6EB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    required
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
                  disabled={loading}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  {loading ? "Traitement..." : (
                    <>
                      S'inscrire <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-[#3E4042]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-white dark:bg-[#242526] px-4 text-gray-400 font-black">Ou continuer avec</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => setError("Échec de l'inscription Google")}
                  text="signup_with"
                  shape="pill"
                />
              </div>
            </div>
          }
          secondTabContent={
            <div className="bg-white dark:bg-[#242526] p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-[#3E4042]">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Bon retour !</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Connectez-vous pour gérer vos événements.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl flex items-center gap-3 animate-shake">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-600 dark:text-red-400 text-xs font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Adresse e-mail"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#3E4042] rounded-2xl text-gray-900 dark:text-[#E4E6EB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Mot de passe"
                    required
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#3E4042] rounded-2xl text-gray-900 dark:text-[#E4E6EB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  {loading ? "Connexion..." : (
                    <>
                      Se connecter <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-[#3E4042]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-white dark:bg-[#242526] px-4 text-gray-400 font-black">Ou continuer avec</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => setError("Échec de la connexion Google")}
                  useOneTap
                  text="signin_with"
                  shape="pill"
                />
              </div>
            </div>
          }
        />
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default AuthFormRegisterConnection;
