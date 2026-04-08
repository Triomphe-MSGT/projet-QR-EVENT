import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Togglable from "../../../components/ui/Togglable";
import authService from "../../../services/authService";
import { login } from "../../../slices/authSlice";
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

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(registerPassword)) {
      setError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.");
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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 py-12">
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Logo/Brand Area */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex flex-col items-center gap-2">
            <img src="/logo.png" alt="QR Event" className="w-16 h-16 object-contain drop-shadow-xl" />
            <h1 className="text-4xl font-black tracking-tighter text-[#1e3a8a]">
              QR Event
            </h1>
          </Link>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-2">SÉCURITÉ & ACCESSIBILITÉ</p>
        </div>

        <Togglable
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          firstTabLabel="Inscription"
          secondTabLabel="Connexion"
          firstTabContent={
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-50">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-[#1e3a8a] tracking-tight">Rejoignez-nous</h2>
                <p className="text-slate-400 text-sm font-medium">Créez votre compte QR Event en quelques secondes.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-shake">
                  <p className="text-red-600 text-xs font-black">{error}</p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#fb923c] transition-colors" />
                    <input
                      type="text"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      placeholder="Nom complet"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[#1e3a8a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fb923c]/20 focus:border-[#fb923c] transition-all font-bold"
                    />
                  </div>

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#fb923c] transition-colors" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="Adresse e-mail"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[#1e3a8a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fb923c]/20 focus:border-[#fb923c] transition-all font-bold"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#fb923c] transition-colors" />
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Mot de passe"
                      required
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[#1e3a8a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fb923c]/20 focus:border-[#fb923c] transition-all font-bold"
                    />
                    <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold px-2">
                    Requis : 8+ caract., 1 majuscule, 1 chiffre, 1 spéc.
                  </p>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#fb923c] transition-colors" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      required
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[#1e3a8a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fb923c]/20 focus:border-[#fb923c] transition-all font-bold"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-[#fb923c] hover:bg-[#f97316] text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  {loading ? "Chargement..." : "S'inscrire"}
                </button>
              </form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] font-black text-slate-400">
                  <span className="bg-white px-4">Ou</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin onSuccess={handleGoogle} onError={() => setError("Échec Google")} shape="pill" />
              </div>
            </div>
          }
          secondTabContent={
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-50">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-[#1e3a8a] tracking-tight">Content de vous revoir</h2>
                <p className="text-slate-400 text-sm font-medium">Connectez-vous pour accéder à vos tickets.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                  <p className="text-red-600 text-xs font-black">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#fb923c] transition-colors" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Adresse e-mail"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[#1e3a8a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fb923c]/20 focus:border-[#fb923c] transition-all font-bold"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#fb923c] transition-colors" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Mot de passe"
                      required
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[#1e3a8a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fb923c]/20 focus:border-[#fb923c] transition-all font-bold"
                    />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" size="sm" className="text-xs font-black text-[#fb923c] hover:underline uppercase tracking-widest">
                    Mot de passe oublié ?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-[#fb923c] hover:bg-[#f97316] text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] font-black text-slate-400">
                  <span className="bg-white px-4">Ou</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin onSuccess={handleGoogle} onError={() => setError("Échec Google")} shape="pill" />
              </div>
            </div>
          }
        />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AuthFormRegisterConnection;
