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
      <div className="p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-sans">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">
          Tableau de Bord Administrateur
        </h1>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav
            className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto"
            aria-label="Tabs"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                }`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "stats" && (
            <section className="space-y-8 animate-fade-in">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Statistiques Globales
                  </h2>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Télécharger le Rapport (.csv)
                  </Button>
                </div>

                {isLoadingStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  </div>
                ) : isStatsError ? (
                  <p className="text-red-500">
                    Erreur stats: {statsError?.message}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Total Événements"
                      value={stats?.totalEvents}
                      color="bg-blue-600"
                      icon={Calendar}
                    />
                    <StatCard
                      title="Total Inscriptions"
                      value={stats?.totalRegistrations}
                      color="bg-purple-600"
                      icon={Users}
                    />
                    <StatCard
                      title="Tickets Validés"
                      value={stats?.qrValidated}
                      color="bg-green-600"
                      icon={QrCode}
                    />
                    <StatCard
                      title="Moy. Inscr./Évén."
                      value={stats?.avgPerEvent}
                      color="bg-orange-500"
                      icon={BarChart3}
                    />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 mt-8">
                  Statistiques Utilisateurs
                </h2>
                <UserCards />
              </div>
            </section>
          )}

          {activeTab === "users" && (
            <section className="animate-fade-in">
              <UserManagement />
            </section>
          )}

          {activeTab === "events" && (
            <section className="animate-fade-in">
              <EventManagement />
            </section>
          )}

          {activeTab === "categories" && (
            <section className="animate-fade-in">
              <CategoryManagement />
            </section>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
