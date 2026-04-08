import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { useTheme } from "../../context/ThemeContext";
import { useChangePassword, useDeleteMyAccount } from "../../hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { 
  Sun, 
  Moon, 
  Bell, 
  Globe, 
  Key, 
  Trash2, 
  Loader2, 
  User, 
  ShieldCheck, 
  Palette, 
  Settings as SettingsIcon,
  ChevronRight,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowLeft
} from "lucide-react";

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("security");
  const [showPassword, setShowPassword] = useState(false);

  // Password mutation
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const changePasswordMutation = useChangePassword();

  // Delete account mutation
  const [confirmText, setConfirmText] = useState("");
  const deleteMutation = useDeleteMyAccount();

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setFeedback({ type: "", message: "" });
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setFeedback({ 
        type: "error", 
        message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial." 
      });
      return;
    }
    changePasswordMutation.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: (data) => {
          setFeedback({ type: "success", message: "Mot de passe mis à jour avec succès." });
          setOldPassword("");
          setNewPassword("");
        },
        onError: (err) => setFeedback({ type: "error", message: err.response?.data?.error || "Erreur de mise à jour." })
      }
    );
  };

  const handleDeleteAccount = () => {
    if (confirmText !== "SUPPRIMER") return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => navigate("/", { replace: true }),
      onError: (err) => alert(err.response?.data?.error || "Erreur lors de la suppression.")
    });
  };

  const tabs = [
    { id: "security", label: "Sécurité", icon: ShieldCheck, description: "Mot de passe et accès" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Alertes et messages" },
    { id: "danger", label: "Danger", icon: AlertTriangle, description: "Actions irréversibles", color: "text-red-500" },
  ];

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen pb-20 font-sans selection:bg-orange-100">
        
        {/* HEADER */}
        <header className="bg-white border-b border-slate-100 pt-10 md:pt-24 pb-8 md:pb-12">
           <div className="max-w-7xl mx-auto px-6">
              <button 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-slate-400 hover:text-orange-600 transition-all mb-6 md:mb-8 font-bold text-[10px] tracking-widest uppercase"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour
              </button>
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 text-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner">
                    <SettingsIcon size={20} md:size={24} />
                 </div>
                 <h1 className="text-2xl md:text-5xl font-black text-slate-500 tracking-tighter uppercase">Paramètres</h1>
              </div>
              <p className="text-slate-400 font-bold text-xs md:text-sm ml-1 leading-relaxed">Gérez vos préférences et la sécurité de votre compte <span className="text-orange-600 font-black tracking-widest uppercase text-[8px] md:text-[10px] ml-2 block sm:inline mt-1 sm:mt-0">Eco-Système QR</span></p>
           </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              
              {/* SIDEBAR TABS (Horizontal on Mobile) */}
              <aside className="lg:col-span-4 flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-3 md:gap-2 custom-scrollbar scroll-smooth snap-x">
                 {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex lg:flex-row items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-[2rem] transition-all group shrink-0 lg:shrink snap-start ${
                        activeTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 lg:translate-x-2' 
                        : 'bg-white text-slate-500 border border-slate-100 lg:border-transparent hover:bg-white/80'
                      }`}
                    >
                       <div className="flex items-center gap-4 md:gap-5">
                          <div className={`p-2.5 md:p-3 rounded-lg md:rounded-xl transition-colors ${activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-slate-500'}`}>
                             <tab.icon size={18} md:size={20} className={tab.color} />
                          </div>
                          <div className="text-left">
                             <p className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`}>{tab.label}</p>
                             <p className="hidden md:block text-[9px] font-bold uppercase tracking-tighter text-slate-400">{tab.description}</p>
                          </div>
                       </div>
                       <ChevronRight size={14} className={`hidden lg:block transition-all ${activeTab === tab.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
                    </button>
                 ))}
              </aside>

              {/* SETTINGS CONTENT */}
              <main className="lg:col-span-8 bg-white rounded-3xl md:rounded-[3rem] p-6 sm:p-10 md:p-16 shadow-xl border border-slate-50 min-h-[400px]">
                 
                 {/* SECURITY SECTION */}
                 {activeTab === "security" && (
                    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 text-slate-500">
                       <h2 className="text-xl md:text-2xl font-black text-slate-500 uppercase tracking-tighter flex items-center gap-3">
                          <ShieldCheck className="text-orange-600" /> Sécurité
                       </h2>
                       <form onSubmit={handlePasswordSubmit} className="space-y-8 max-w-md">
                          <div className="space-y-6">
                             <div className="relative group">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block ml-4">Ancien Mot de Passe</label>
                                <div className="relative">
                                   <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                                   <input
                                     type="password"
                                     value={oldPassword}
                                     onChange={(e) => setOldPassword(e.target.value)}
                                     required
                                     className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold placeholder:text-slate-300"
                                     placeholder="••••••••"
                                   />
                                </div>
                             </div>
                             <div className="relative group">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block ml-4">Nouveau Mot de Passe</label>
                                <div className="relative">
                                   <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                                   <input
                                     type={showPassword ? "text" : "password"}
                                     value={newPassword}
                                     onChange={(e) => setNewPassword(e.target.value)}
                                     required
                                     className="w-full pl-14 pr-14 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold placeholder:text-slate-300"
                                     placeholder="Minimum 6 caractères"
                                   />
                                   <button 
                                     type="button" 
                                     onClick={() => setShowPassword(!showPassword)}
                                     className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                   >
                                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                   </button>
                                </div>
                             </div>
                          </div>

                          {feedback.message && (
                            <div className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-tight flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                               {feedback.type === 'success' ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                               {feedback.message}
                            </div>
                          )}

                          <button 
                            type="submit" 
                            disabled={changePasswordMutation.isPending}
                            className="w-full py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-2xl shadow-slate-900/20 hover:bg-orange-600 hover:shadow-orange-600/30 transition-all disabled:opacity-50"
                          >
                             {changePasswordMutation.isPending ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Mettre à jour mes accès"}
                          </button>
                       </form>
                    </div>
                 )}

                 {/* DANGER ZONE SECTION */}
                 {activeTab === "danger" && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                       <h2 className="text-2xl font-black text-red-600 uppercase tracking-tighter flex items-center gap-3">
                          <Trash2 size={24} /> Actions Irréversibles
                       </h2>
                       <div className="bg-red-50 rounded-[2rem] p-10 border border-red-100 space-y-6">
                          <div className="flex items-start gap-4">
                             <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                                <AlertTriangle size={24} />
                             </div>
                             <div>
                                <h4 className="text-lg font-black text-red-700 uppercase tracking-tight mb-2">Suppression Définitive</h4>
                                <p className="text-red-500 font-bold text-sm leading-relaxed">
                                   Une fois supprimé, votre profil, vos billets QR et vos événements organisés seront effacés de nos serveurs. Cette action est finale.
                                </p>
                             </div>
                          </div>
                          
                          <div className="space-y-4 pt-4 border-t border-red-200">
                             <p className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em] ml-2">Confirmez en tapant "SUPPRIMER"</p>
                             <input
                               type="text"
                               value={confirmText}
                               onChange={(e) => setConfirmText(e.target.value)}
                               className="w-full px-6 py-5 bg-white rounded-[1.5rem] border-2 border-red-100 focus:border-red-500 outline-none transition-all font-black uppercase text-center placeholder:text-red-200 text-red-600 tracking-widest shadow-inner shadow-red-50/50"
                               placeholder="Saisissez ici..."
                             />
                             <button
                               onClick={handleDeleteAccount}
                               disabled={deleteMutation.isPending || confirmText !== "SUPPRIMER"}
                               className="w-full py-5 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50 active:scale-95 transition-transform"
                             >
                                {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Supprimer mon compte définitivement"}
                             </button>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* NOTIFICATIONS PLACEHOLDER */}
                 {activeTab === "notifications" && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in duration-500">
                       <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-inner">
                          <Bell size={48} />
                       </div>
                       <div className="space-y-2">
                          <h3 className="text-xl font-black text-slate-500 uppercase tracking-tighter">Réglages des Alertes</h3>
                          <p className="text-slate-400 font-bold text-sm max-w-xs mx-auto">Configurez vos préférences pour les emails et les notifications push.</p>
                       </div>
                       <div className="px-6 py-2 bg-orange-50 text-orange-600 rounded-full font-black text-[9px] uppercase tracking-[0.2em] border border-orange-100">
                          Fonctionnalité en cours de déploiement
                       </div>
                    </div>
                 )}

              </main>
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #F97316; }
      `}</style>
    </MainLayout>
  );
};

export default AccountSettingsPage;
