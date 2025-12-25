import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "../../features/dashboard/components/StatCard";
import MainLayout from "../../components/layout/MainLayout";
import OrganizerEventList from "../../features/dashboard/components/OrganizerEventList";
import {
  getDashboardStats,
  getMyOrganizedEvents,
} from "../../services/dashboardService";
import { Calendar, Users, CheckSquare } from "lucide-react"; // Icônes Lucide pour représenter les stats

const DashboardPage = () => {
  /**
   * ────────────────────────────────────────────────────────────────
   * 1. Chargement des statistiques globales de l'organisateur
   * ────────────────────────────────────────────────────────────────
   * - Utilisation de React Query pour gérer la récupération et la mise en cache.
   * - La clé 'organizerStats' permet à React Query de gérer la requête indépendamment.
   * - `getDashboardStats()` appelle le service REST qui retourne :
   *    { totalEvents, totalRegistrations, qrValidated }
   */
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isStatsError,
  } = useQuery({
    queryKey: ["organizerStats"],
    queryFn: getDashboardStats,
  });

  /**
   * ────────────────────────────────────────────────────────────────
   * 2. Chargement de la liste des événements organisés
   * ────────────────────────────────────────────────────────────────
   * - Même approche avec React Query pour bénéficier du cache et de la gestion automatique
   *   des états (loading / error / success).
   * - `getMyOrganizedEvents()` retourne un tableau d'événements liés à l'utilisateur connecté.
   */
  const {
    data: organizedEvents,
    isLoading: isLoadingEvents,
    isError: isEventsError,
    error: eventsError,
  } = useQuery({
    queryKey: ["myOrganizedEvents"],
    queryFn: getMyOrganizedEvents,
  });

  /**
   * ────────────────────────────────────────────────────────────────
   * 3. Structure de la page
   * ────────────────────────────────────────────────────────────────
   * - `MainLayout` gère l’en-tête, la navigation, etc.
   * - Le contenu principal affiche :
   *    - Une section “Statistiques” résumant l’activité.
   *    - Une section “Événements” listant les événements gérés par l’organisateur.
   * - Gestion d’affichage conditionnelle (loading / error / success) par section.
   */
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">
            Tableau de Bord Organisateur
          </h1>

          {/* ────── Section Statistiques ────── */}
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
                {/* Chaque StatCard affiche une métrique clé avec icône et couleur dédiée */}
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
                  icon={CheckSquare}
                />
              </div>
            )}
          </section>

          {/* ────── Section Liste des Événements ────── */}
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
              /**
               * Composant enfant responsable de :
               * - L’affichage de la liste complète
               * - Les actions CRUD (édition, suppression)
               * - La gestion interne de l’état de chaque événement
               */
              <OrganizerEventList events={organizedEvents} />
            )}
          </section>
        </main>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
