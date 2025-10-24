import React, { useState } from "react";
import { QrReader } from "react-qr-reader"; // Bibliothèque de scan
import apiClient from "../../services/apiClient"; // Votre client Axios
import MainLayout from "../../components/layouts/MainLayout";
import { CheckCircle, XCircle } from "lucide-react";

const ScanPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fonction appelée quand un QR code est lu
  const handleScan = async (result, error) => {
    if (!!result && !isLoading) {
      // Si on a un résultat et qu'on n'est pas déjà en train de charger
      setIsLoading(true);
      setError(null);
      setScanResult(null);

      try {
        const qrData = JSON.parse(result.text); // 2. Convertir le texte en JSON

        // 3. Vérifier si les données nécessaires sont présentes
        if (!qrData.token || !qrData.eventName) {
          throw new Error("QR code invalide ou mal formé.");
        }

        // 4. Appeler l'API backend pour valider
        const response = await apiClient.post("/events/validate-ticket", {
          qrCodeToken: qrData.token,
          eventName: qrData.eventName,
          // Le backend récupère l'organisateur/admin depuis le token d'authentification
        });

        // 5. Afficher le succès
        setScanResult(response.data.participant);
      } catch (err) {
        // 6. Gérer les erreurs (QR déjà utilisé, pas autorisé, etc.)
        const errorMessage =
          err.response?.data?.error || err.message || "Erreur inconnue";
        setError(errorMessage);
        console.error("Erreur de validation:", errorMessage);
      } finally {
        setIsLoading(false);
        // Petite pause avant de pouvoir scanner à nouveau
        setTimeout(() => {
          setScanResult(null);
          setError(null);
        }, 3000);
      }
    }

    if (!error) {
      console.info(error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6 dark:text-white">
          Scanner un QR Code
        </h1>

        <div className="w-full rounded-lg overflow-hidden border-4 border-gray-300 dark:border-gray-600">
          <QrReader
            onResult={handleScan}
            constraints={{ facingMode: "environment" }} // Caméra arrière
            style={{ width: "100%" }}
          />
        </div>

        {/* Zone de résultat */}
        <div className="mt-6 h-32">
          {isLoading && (
            <p className="text-lg text-center text-blue-500">Vérification...</p>
          )}

          {error && (
            <div className="flex flex-col items-center p-4 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
              <XCircle className="w-12 h-12 mb-2" />
              <p className="font-semibold text-center">{error}</p>
            </div>
          )}

          {scanResult && (
            <div className="flex flex-col items-center p-4 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
              <CheckCircle className="w-12 h-12 mb-2" />
              <p className="font-semibold">Validé !</p>
              <p>Participant : {scanResult.nom}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ScanPage;
