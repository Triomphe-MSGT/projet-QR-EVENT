import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layouts/MainLayout";
import QrCodeDisplay from "../../components/ui/QrCodeDisplay";
import { useUserEvents } from "../../hooks/useUserProfile";
import { useUnregisterFromEvent } from "../../hooks/useEvents";
import { Trash2, ArrowLeft, History, QrCode } from "lucide-react";

const UserQrCodesPage = () => {
  const navigate = useNavigate();
  const { data: eventsData, isLoading, isError, error } = useUserEvents();
  const unregisterMutation = useUnregisterFromEvent();

  // État pour gérer l'ouverture/fermeture de la modale et le QR code sélectionné
  const [selectedQr, setSelectedQr] = useState(null); // Stockera l'image Base64

  // Filtre les événements auxquels l'utilisateur participe ET qui ont une image QR code
  const eventsWithQrCodes =
    eventsData?.participated?.filter((event) => event.qrCodeImage) || [];

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          Chargement de vos QR codes...
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-red-500">
          Erreur : {error.message}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Mobile Sticky Header */}
        <div className="md:hidden sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Mes Tickets</h2>
          <div className="w-9"></div>
        </div>

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 pt-8 md:pt-16 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <button 
              onClick={() => navigate(-1)}
              className="hidden md:flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 font-black text-xs tracking-widest uppercase"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">
                  <QrCode className="w-4 h-4" />
                  <span>Billetterie Digitale</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                  Mes QR Codes d'Entrée
                </h1>
              </div>
              <div className="flex items-center">
                <div className="px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-blue-100 dark:border-blue-800/50">
                  <History className="w-4 h-4" />
                  {eventsWithQrCodes.length} Tickets Actifs
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {eventsWithQrCodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsWithQrCodes.map((event) => (
                <div
                  key={event._id || event.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
                >
                  <div className="mb-4">
                    <QrCodeDisplay value={event.qrCodeImage} size={160} />
                  </div>

                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {event.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(event.startDate)}
                  </p>

                  <div className="flex gap-2 mt-4 w-full">
                    <button
                      onClick={() => setSelectedQr(event.qrCodeImage)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                    >
                      Afficher
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Êtes-vous sûr de vouloir supprimer ce QR code ? Cela annulera votre participation à l'événement."
                          )
                        ) {
                          unregisterMutation.mutate(event._id || event.id);
                        }
                      }}
                      className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg shadow hover:bg-red-200 transition-colors"
                      title="Supprimer le QR Code"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="mt-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Voir les détails
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Aucun ticket</h2>
              <p className="text-gray-500 mt-2 font-medium">
                Participez à un événement pour obtenir votre ticket d'entrée.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALE D'AFFICHAGE EN GRAND FORMAT --- */}
      {selectedQr && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedQr(null)}
        >
          <div
            className="bg-white p-6 md:p-10 rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <QrCodeDisplay value={selectedQr} size={300} />
            <p className="text-center text-gray-700 mt-4 font-medium">
              Présentez ce code à l'organisateur.
            </p>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default UserQrCodesPage;
