import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useValidateQrCode } from "../../hooks/useEvents"; // Assurez-vous que le chemin est correct
import { Loader2, CheckCircle, AlertTriangle, ScanLine } from "lucide-react";

const QrScanner = ({ eventName }) => {
  const scannerRef = useRef(null); // Référence pour contrôler le scanner
  const validateMutation = useValidateQrCode(); // Hook pour appeler l'API de validation

  // État pour afficher les messages (Scanning, Validating, Success, Error)
  const [feedback, setFeedback] = useState({ status: "idle", message: "" });
  // Ref pour accéder à l'état actuel dans le callback du scanner (qui est créé une seule fois)
  const feedbackRef = useRef(feedback);
  feedbackRef.current = feedback;

  // Fonction pour réactiver manuellement le scanner
  const handleScanNext = useCallback(() => {
    if (scannerRef.current) {
      try {
        // Réactive la caméra
        scannerRef.current.resume();
        // Met à jour le message
        setFeedback({
          status: "scanning",
          message: "Veuillez scanner le QR code...",
        });
      } catch (err) {
        console.error("Erreur reprise scan:", err);
        setFeedback({
          status: "error",
          message: "Erreur lors de la reprise du scan.",
        });
      }
    }
  }, []); // Pas de dépendances externes

  // Effet pour initialiser et nettoyer le scanner
  useEffect(() => {
    // Empêche de créer plusieurs scanners si le composant se re-rend
    if (scannerRef.current) return;

    const scannerElementId = "qr-reader-element"; // ID de la div où afficher la caméra
    // Configuration du scanner
    const config = {
      fps: 10, // Images par seconde (pas trop élevé)
      qrbox: { width: 250, height: 250 }, // Taille de la zone de scan
      rememberLastUsedCamera: true, // Retenir la dernière caméra utilisée
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA], // Utiliser seulement la caméra
    };

    // --- Callback appelé quand un QR code est détecté ---
    const onScanSuccess = (decodedText) => {
      // Si on est déjà en train de valider ou d'afficher un résultat, ignorer
      if (
        ["validating", "success", "error"].includes(feedbackRef.current.status)
      ) {
        return;
      }

      // 1. Mettre la caméra en PAUSE
      scannerRef.current?.pause(true);
      setFeedback({ status: "validating", message: "Validation en cours..." });

      try {
        let qrToken = "";
        // Essayer de parser le QR code comme du JSON
        try {
          const qrData = JSON.parse(decodedText);
          qrToken = qrData.token ?? ""; // Récupérer le token
          if (!qrToken) throw new Error("Token manquant dans le JSON.");
        } catch {
          // Si ce n'est pas du JSON, utiliser le texte brut comme token
          qrToken = decodedText;
        }

        if (!qrToken) throw new Error("QR code invalide (vide).");

        // 2. Appeler l'API backend pour valider le token
        validateMutation.mutate(
          { qrCodeToken: qrToken, eventName }, // Données envoyées à l'API
          {
            // 3. Si l'API répond avec succès
            onSuccess: (res) =>
              setFeedback({
                status: "success", // Affiche le message vert
                message: `Ticket OK: ${res.participant?.nom || "Inconnu"}`,
              }),
            // 4. Si l'API répond avec une erreur
            onError: (err) =>
              setFeedback({
                status: "error", // Affiche le message rouge
                message: `Échec: ${
                  err.response?.data?.error || err.message || "Erreur inconnue"
                }`,
              }),
          }
        );
      } catch (err) {
        // Erreur de lecture/parsing du QR code lui-même
        setFeedback({
          status: "error",
          message: `Erreur QR: ${err.message}`,
        });
      }
    };

    // Callback pour les erreurs internes du scanner (caméra, etc.)
    const onScanFailure = (error) => {
      // Ignorer les erreurs fréquentes "QR code not found"
      if (!error.includes("NotFoundException")) {
        console.warn("Erreur scanner:", error);
        // Optionnel : afficher une erreur si la caméra pose problème
        // setFeedback({ status: "error", message: "Erreur caméra ou scan." });
      }
    };

    // Initialisation du scanner
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerElementId,
      config,
      false // Verbose logging désactivé
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = html5QrcodeScanner; // Sauvegarder la référence

    // Message initial après un court délai pour l'init caméra
    const initTimeout = setTimeout(() => {
      // Vérifie si le composant est toujours monté et que le scanner existe
      if (scannerRef.current) {
        setFeedback({
          status: "scanning",
          message: "Veuillez scanner le QR code...",
        });
      }
    }, 500);

    // Fonction de nettoyage (quand le composant est démonté)
    return () => {
      clearTimeout(initTimeout); // Annule le timeout si démonté avant
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .then(() => {
            console.log("Scanner arrêté avec succès.");
          })
          .catch((err) => {
            console.error("Échec lors de l'arrêt du scanner:", err);
          })
          .finally(() => {
            scannerRef.current = null; // Important de nullifier la référence
          });
      } else {
        console.log("Nettoyage : Pas de scanner à arrêter.");
      }
    };
    // Les dépendances de l'effet
  }, [eventName, validateMutation, handleScanNext]);

  // Fonction pour déterminer le style du message de feedback
  const getFeedbackStyle = () => {
    switch (feedback.status) {
      case "validating":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200";
      case "success":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200";
      case "scanning":
        return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200";
      default: // idle
        return "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
      {/* La div où la caméra s'affichera */}
      <div
        id="qr-reader-element"
        className="relative w-full aspect-square border dark:border-gray-600 rounded-md overflow-hidden mb-4"
      />
      {/* Zone de message */}
      <div
        className={`p-3 rounded-md border text-center font-medium text-sm transition-all ${getFeedbackStyle()}`}
      >
        {feedback.status === "validating" && (
          <Loader2 className="inline-block animate-spin mr-2" size={16} />
        )}
        {feedback.status === "success" && (
          <CheckCircle className="inline-block mr-2" size={16} />
        )}
        {feedback.status === "error" && (
          <AlertTriangle className="inline-block mr-2" size={16} />
        )}
        {feedback.message || "Initialisation du scanner..."}
      </div>

      {/* Le bouton pour scanner le suivant */}
      {/* Il n'apparaît qu'après un succès ou une erreur */}
      {["success", "error"].includes(feedback.status) && (
        <button
          onClick={handleScanNext} // Appelle la fonction pour réactiver la caméra
          className="w-full mt-4 py-3 px-4 flex items-center justify-center
                     bg-blue-600 text-white font-semibold rounded-lg
                     shadow-md hover:bg-blue-700 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ScanLine className="mr-2" size={20} />
          Scanner le ticket suivant
        </button>
      )}
    </div>
  );
};

export default QrScanner;
