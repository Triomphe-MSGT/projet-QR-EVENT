import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  getDashboardStats,
  getMyOrganizedEvents,
} from "../../services/dashboardService";
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  Plus, 
  LayoutDashboard, 
  TrendingUp, 
  Settings as SettingsIcon,
  ChevronRight,
  Loader2,
  Zap,
  QrCode,
  Search,
  Bell,
  Menu,
  LogOut,
  Home,
  FileText,
  HelpCircle,
  Clock,
  Info,
  CheckCircle2,
  X
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useNotifications, useMarkAsRead } from "../../hooks/useNotifications";
import { StatCard } from "../../features/dashboard/components/StatCard";
import OrganizerEventList from "../../features/dashboard/components/OrganizerEventList";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["organizerStats"],
    queryFn: getDashboardStats,
  });

  const { data: organizedEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["myOrganizedEvents"],
    queryFn: getMyOrganizedEvents,
  });

  const { data: notifications } = useNotifications({ enabled: !!user });
  const markAsReadMutation = useMarkAsRead();
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const trendData = [
    { time: "01 Avr", participants: 150 },
    { time: "02 Avr", participants: 280 },
    { time: "03 Avr", participants: 210 },
    { time: "04 Avr", participants: 450 },
    { time: "05 Avr", participants: 320 },
    { time: "Auj", participants: 580 },
  ];

  const sidebarItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "events", label: "Événements", icon: Calendar },
    { id: "stats", label: "Stats", icon: TrendingUp },
    { id: "guide", label: "Guide", icon: HelpCircle },
    { id: "scan", label: "Scan QR", icon: QrCode, path: "/scan" },
  ];

  const userInitial = user?.nom?.charAt(0).toUpperCase() || "U";

  if (isLoadingStats || isLoadingEvents) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8">
        <Link to="/" className="flex items-center gap-2">
          <Zap size={24} className="text-orange-600 fill-current" />
          <span className="text-xl font-bold text-slate-500">QR-EVENT</span>
        </Link>
      </div>
      <div className="flex-1 px-4 space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.path) navigate(item.path);
              else setActiveTab(item.id);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
              activeTab === item.id ? "bg-orange-600 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <item.icon size={20} />
            <span className="text-xs uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <Link to="/home" className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-gray-500 hover:bg-gray-50 mt-10">
          <Home size={20} />
          <span className="text-xs uppercase font-bold tracking-widest">Accueil</span>
        </Link>
      </div>
      <div className="p-8 border-t">
         <button onClick={() => navigate("/login")} className="text-red-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <LogOut size={18} /> Quitter
         </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden relative">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-64 h-screen border-r border-gray-100 sticky top-0 z-50">
        <SidebarContent />
      </aside>

      {/* MOBILE NAV */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative w-64 h-full bg-white"><SidebarContent /></div>
        </div>
      )}

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-gray-100 px-6 md:px-10 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-400 p-2"><Menu size={24} /></button>
              <h1 className="text-xl font-black text-slate-500 uppercase">Espace <span className="text-orange-600">Pro</span></h1>
           </div>

           <div className="flex items-center gap-6">
              {/* BELL TRIGGER (Simplified) */}
              <div className="relative">
                 <button 
                   id="notif-bell"
                   onClick={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     setShowNotifications(!showNotifications);
                   }}
                   className={`p-3 rounded-xl transition-all relative ${showNotifications ? 'bg-orange-600 text-white' : 'bg-gray-50 text-gray-400 hover:text-orange-600'}`}
                 >
                    <Bell size={20} />
                    {!showNotifications && <div className="absolute top-2 right-2 w-2 h-2 bg-orange-600 rounded-full border-2 border-white"></div>}
                 </button>

                 {/* DROPDOWN (Simplified) */}
                 {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-[99]" onClick={() => setShowNotifications(false)}></div>
                      <div className="absolute right-0 top-full mt-4 w-72 bg-white border border-gray-100 rounded-3xl shadow-2xl z-[100] overflow-hidden">
                         <div className="p-6 bg-gray-50 font-black text-[10px] uppercase tracking-widest flex justify-between items-center">
                            <span>Notifications</span>
                            <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                         </div>
                         <div className="max-h-80 overflow-y-auto">
                            {notifications.map(n => (
                               <div key={n.id} className="p-4 flex gap-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0"><n.icon size={18} /></div>
                                  <div className="space-y-1">
                                     <p className="text-[11px] font-bold text-slate-500">{n.text}</p>
                                     <span className="text-[9px] text-gray-400 font-bold uppercase">{n.time}</span>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                    </>
                 )}
              </div>

              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-orange-600/30">
                 {userInitial}
              </div>
           </div>
        </header>

        {/* MAIN BODY */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar space-y-10">
           {activeTab === "overview" && (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   <StatCard title="Événements" value={stats?.totalEvents || 0} icon={Calendar} theme="blue" description="Total actifs" />
                   <StatCard title="Inscriptions" value={stats?.totalRegistrations || 0} icon={Users} theme="purple" description="Participants inscrits" />
                   <StatCard title="Tickets Validés" value={stats?.qrValidated || 0} icon={CheckSquare} theme="emerald" description="Accès confirmés" />
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 p-2 md:p-6 shadow-sm">
                   <OrganizerEventList events={organizedEvents} />
                </div>
             </div>
           )}

           {activeTab === "stats" && (
             <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm h-96">
                <h4 className="text-sm font-bold uppercase mb-10">Inscriptions / Temps</h4>
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={trendData}>
                      <XAxis dataKey="time" hide />
                      <Area type="monotone" dataKey="participants" stroke="#F97316" fill="#F97316" fillOpacity={0.1} strokeWidth={4} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
           )}

           {activeTab === "guide" && (
              <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto space-y-6">
                 <h2 className="text-2xl font-black uppercase">Guide d'usage</h2>
                 <p className="text-gray-400 font-bold">1. Cliquez sur 'Nouveau' pour créer un événement.</p>
                 <p className="text-gray-400 font-bold">2. Allez dans 'Scan QR' pour valider les tickets.</p>
                 <p className="text-gray-400 font-bold">3. Gérez vos participants depuis la liste d'événements.</p>
              </div>
           )}

           {activeTab === "events" && (
             <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <OrganizerEventList events={organizedEvents} />
             </div>
           )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #F97316; }
      `}</style>
    </div>
  );
};

export default DashboardPage;
