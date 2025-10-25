// src/pages/organizer/DashboardPage.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "../../components/cards/StatCard";
import MainLayout from "../../components/layouts/MainLayout";
import OrganizerEventList from "../../components/dashboard/OrganizerEventList";
import {
  getDashboardStats,
  getMyOrganizedEvents,
} from "../../services/dashboardService";
import { Calendar, Users, CheckSquare } from "lucide-react"; // Utilisation d'une icône plus appropriée pour QR validés

const DashboardPage = () => {
  // 1. Requête pour les statistiques
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isStatsError,
  } = useQuery({
    queryKey: ["organizerStats"], // Clé unique pour les stats
    queryFn: getDashboardStats,
  });

  // 2. Requête pour les événements organisés
  const {
    data: organizedEvents,
    isLoading: isLoadingEvents,
    isError: isEventsError,
    error: eventsError,
  } = useQuery({
    queryKey: ["myOrganizedEvents"], // Clé unique pour les événements organisés
    queryFn: getMyOrganizedEvents,
  });

  // 3. Gestion combinée du chargement et des erreurs
  // const isLoading = isLoadingStats || isLoadingEvents;
  // const isError = isStatsError || isEventsError;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">
            Tableau de Bord Organisateur
          </h1>

          {/* Section Statistiques */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Statistiques Générales
            </h2>
            {isLoadingStats ? (
              <p>Chargement des statistiques...</p>
            ) : isStatsError ? (
              <p className="text-red-500">
                Impossible de charger les statistiques.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Événements Créés"
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
                  icon={CheckSquare} // Icône CheckSquare
                />
              </div>
            )}
          </section>

          {/* Section Liste des Événements */}
          <section>
            {isLoadingEvents ? (
              <p className="text-center py-8 text-gray-500">
                Chargement de vos événements...
              </p>
            ) : isEventsError ? (
              <p className="text-center py-8 text-red-500">
                Impossible de charger vos événements: {eventsError.message}
              </p>
            ) : (
              // ✅ Passe les événements au composant qui gère le CRUD
              <OrganizerEventList events={organizedEvents} />
            )}
          </section>
        </main>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
