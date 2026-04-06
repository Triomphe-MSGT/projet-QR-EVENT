import React, { useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { StatCard } from "../../dashboard/components/StatCard";
import UserManagement from "./UserManagement";
import EventManagement from "./EventManagement";
import CategoryManagement from "./CategoryManagement";
import { useAdminStats } from "../../../hooks/useAdmin";
import {
  BarChart3,
  Users,
  Calendar,
  Grid,
  CheckSquare as QrCode,
  Loader2,
  Download,
  ShieldAlert,
} from "lucide-react";
import UserCards from "./UserCards";
import Button from "../../../components/ui/Button";
import { downloadAdminReport } from "../../../services/dashboardService";

const AdminDashboard = () => {
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isStatsError,
    error: statsError,
  } = useAdminStats();
  const [activeTab, setActiveTab] = useState("stats");
  const [isDownloading, setIsDownloading] = useState(false);

  const TABS = [
    { id: "stats", label: "Statistiques", icon: BarChart3 },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "events", label: "Événements", icon: Calendar },
    { id: "categories", label: "Catégories", icon: Grid },
  ];

  /**
   * Handles the download of the admin report in PDF or CSV format.
   */
  const handleDownload = async () => {
    const format = window.prompt(
      "Choisissez le format du rapport (pdf ou csv) :",
      "pdf"
    );
    if (!format || (format !== "pdf" && format !== "csv")) {
      if (format) alert("Format invalide. Veuillez choisir 'pdf' ou 'csv'.");
      return;
    }

    setIsDownloading(true);
    try {
      await downloadAdminReport(format);
    } catch (error) {
      console.error("Erreur lors du téléchargement du rapport:", error);
      alert("Le téléchargement a échoué.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen font-sans selection:bg-orange-100 pb-20">
        
        {/* DASHBOARD HERO */}
        <section className="bg-slate-900 pt-20 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
           <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] -ml-48 -mt-24 opacity-10"></div>
           
           <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                 <div className="text-center md:text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white font-black text-[9px] uppercase tracking-widest">
                       <ShieldAlert size={12} className="text-blue-500" />
                       Centre de Commande Admin
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                       Dashboard <span className="text-blue-500">Pro</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm md:text-lg max-w-xl">
                       Supervision globale de l'écosystème QR. Gérez les flux d'utilisateurs et la performance des événements en temps réel.
                    </p>
                 </div>
                 
                 <div className="flex justify-center md:justify-end gap-3">
                    <button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="px-6 py-4 md:px-8 md:py-5 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all flex items-center gap-3"
                    >
                      {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} className="text-blue-500" />}
                      Rapport Global
                    </button>
                 </div>
              </div>
           </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-20">
           
           {/* PREMIUM TAB NAVIGATION */}
           <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-2 shadow-2xl shadow-slate-900/5 mb-12 flex flex-wrap gap-2 md:gap-4 overflow-x-auto custom-scrollbar border border-slate-100">
              {TABS.map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex-1 min-w-fit flex items-center justify-center gap-3 px-6 py-4 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all ${
                     activeTab === tab.id 
                     ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' 
                     : 'text-slate-400 hover:bg-slate-50'
                   }`}
                 >
                   <tab.icon size={18} className={activeTab === tab.id ? "text-blue-500" : "text-slate-300"} />
                   <span>{tab.label}</span>
                 </button>
              ))}
           </div>

           {/* MAIN TAB CONTENT */}
           <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {activeTab === "stats" && (
                <div className="space-y-12">
                   {/* STATS MODULES */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {isLoadingStats ? (
                        [...Array(4)].map((_, i) => (
                          <div key={i} className="h-40 bg-slate-100 rounded-[2rem] animate-pulse"></div>
                        ))
                      ) : isStatsError ? (
                        <div className="lg:col-span-4 p-8 bg-red-50 text-red-500 rounded-3xl border border-red-100 font-bold">
                           Erreur: {statsError?.message}
                        </div>
                      ) : (
                        <>
                          <StatCard title="Événements" value={stats?.totalEvents} icon={Calendar} theme="blue" description="Total actifs" />
                          <StatCard title="Inscriptions" value={stats?.totalRegistrations} icon={Users} theme="purple" description="Volume global" />
                          <StatCard title="Validés" value={stats?.qrValidated} icon={QrCode} theme="emerald" description="Tickets scannés" />
                          <StatCard title="Engagement" value={`${Number(stats?.avgPerEvent || 0).toFixed(1)}%`} icon={BarChart3} theme="orange" description="Performance moy." />
                        </>
                      )}
                   </div>

                   {/* USER SEGMENTS */}
                   <div className="space-y-8">
                      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm">
                            <Users size={22} />
                         </div>
                         <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-500 uppercase tracking-tighter">Répartition Utilisateurs</h2>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Segmentation par rôles</p>
                         </div>
                      </div>
                      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-50">
                        <UserCards />
                      </div>
                   </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-xl border border-slate-50 min-h-[600px] text-slate-500">
                   <UserManagement />
                </div>
              )}

              {activeTab === "events" && (
                <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-xl border border-slate-50 min-h-[600px] text-slate-500">
                   <EventManagement />
                </div>
              )}

              {activeTab === "categories" && (
                <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-xl border border-slate-50 min-h-[600px] text-slate-500">
                   <CategoryManagement />
                </div>
              )}
           </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
