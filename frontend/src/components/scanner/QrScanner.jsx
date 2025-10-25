// src/components/scanner/QrScanner.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useValidateQrCode } from "../../hooks/useEvents";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ScanLine,
} from "lucide-react";

/**
 * Affiche un scanner QR et gère la validation via API.
 */
const QrScanner = ({ eventName }) => {
  const scannerRef = useRef(null); // Référence à l'instance du scanner
  const validateMutation = useValidateQrCode();
  const [feedback, setFeedback] = useState({ status: "idle", message: "" }); // idle | scanning | validating | success | error | paused

  // Fonction pour afficher un message temporaire et reprendre le scan
  const showTemporaryFeedback = useCallback(
    (status, message, duration = 3000) => {
      setFeedback({ status, message });
      setTimeout(() => {
        // Reprend le scan seulement si le scanner existe toujours
        if (scannerRef.current) {
          try {
            scannerRef.current.resume();
            setFeedback({
              status: "scanning",
              message: "Scanner à nouveau...",
            });
          } catch (e) {
            console.warn("Impossible de reprendre le scanner:", e);
            setFeedback({
              status: "error",
              message: "Erreur lors de la reprise du scan.",
            });
          }
        }
      }, duration);
    },
    []
  ); // useCallback pour éviter recréation inutile

  // Initialisation et nettoyage du scanner
  useEffect(() => {
    const scannerElementId = "qr-reader-element"; // ID de la div pour le scanner

    // Configuration du scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };

    // Fonction appelée quand un QR code est décodé
    const onScanSuccess = (decodedText) => {
      if (
        feedback.status === "validating" ||
        feedback.status === "success" ||
        feedback.status === "error"
      ) {
        console.log("Scan ignoré (validation en cours ou récente)");
        return; // Ignore les scans rapides pendant la validation/feedback
      }

      console.log("QR Code détecté:", decodedText);
      scannerRef.current?.pause(true); // Met en pause le flux vidéo
      setFeedback({ status: "validating", message: "Validation en cours..." });

      try {
        // Tente de parser le JSON ou utilise le texte brut comme token
        let qrToken = "";
        try {
          const qrData = JSON.parse(decodedText);
          if (qrData && qrData.token) {
            qrToken = qrData.token;
          } else {
            throw new Error("Format JSON invalide (token manquant).");
          }
        } catch (parseError) {
          console.warn(
            "QR Code n'est pas un JSON valide, utilisation du texte brut.",
            parseError
          );
          qrToken = decodedText; // Utilise le texte brut comme token
        }

        if (!qrToken) {
          throw new Error("Token introuvable dans le QR Code.");
        }

        // Appelle la mutation de validation
        validateMutation.mutate(
          { qrCodeToken: qrToken, eventName: eventName },
          {
            onSuccess: (response) => {
              showTemporaryFeedback(
                "success",
                `Ticket OK: ${response.participant?.nom || "Inconnu"}`,
                2500 // Durée du message de succès
              );
            },
            onError: (error) => {
              const errorMessage =
                error.response?.data?.error ||
                error.message ||
                "Erreur inconnue";
              showTemporaryFeedback(
                "error",
                `Échec: ${errorMessage}`,
                3500 // Durée plus longue pour l'erreur
              );
            },
          }
        );
      } catch (processingError) {
        // Erreur avant même l'appel API (ex: mauvais format QR)
        showTemporaryFeedback(
          "error",
          `Erreur QR: ${processingError.message}`,
          3500
        );
      }
    };

    // Fonction pour gérer les erreurs de scan (ex: caméra non trouvée)
    const onScanFailure = (error) => {
      // Ignorer les erreurs fréquentes "QR code not found"
      if (!error.includes("NotFoundException")) {
        console.warn(`Erreur du scanner: ${error}`);
        setFeedback({ status: "error", message: "Erreur caméra ou scan." });
      }
    };

    // Initialise le scanner seulement si la div existe et qu'il n'est pas déjà lancé
    const readerElement = document.getElementById(scannerElementId);
    if (readerElement && !scannerRef.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        scannerElementId,
        config,
        false
      );
      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = html5QrcodeScanner; // Stocke l'instance
      setFeedback({
        status: "scanning",
        message: "Veuillez scanner le QR code...",
      });
    }

    // Fonction de nettoyage pour arrêter le scanner
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Échec arrêt scanner:", err));
        scannerRef.current = null;
        console.log("Scanner arrêté.");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName]); // Dépendance à eventName pour relancer si l'événement change

  // Style du message de feedback
  const getFeedbackStyle = () => {
    switch (feedback.status) {
      case "validating":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700";
      case "success":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700";
      case "error":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700";
      case "scanning":
        return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700";
      default:
        return "hidden";
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
      {/* Conteneur pour le scanner vidéo */}
      <div
        id="qr-reader-element"
        className="relative w-full aspect-square border dark:border-gray-600 rounded-md overflow-hidden mb-4"
      >
        {/* Superposition visuelle pendant le scan */}
        {(feedback.status === "scanning" ||
          feedback.status === "validating") && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[70%] h-[70%] border-4 border-blue-500/50 rounded-lg shadow-inner animate-pulse-border">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan-line shadow-lg"></div>
            </div>
          </div>
        )}
      </div>

      {/* Message de feedback */}
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
        {feedback.message || "Initialisation..."}
      </div>

      {/* Styles pour animations */}
      <style>{`
          @keyframes scanLine { 0% { transform: translateY(0); } 100% { transform: translateY(calc(100% - 4px)); } }
          .animate-scan-line { animation: scanLine 2.5s infinite alternate ease-in-out; }
          @keyframes pulseBorder { 0%, 100% { border-color: rgba(59, 130, 246, 0.5); } 50% { border-color: rgba(59, 130, 246, 0.9); } }
          .animate-pulse-border { animation: pulseBorder 1.5s infinite ease-in-out; }
       `}</style>
    </div>
  );
};

export default QrScanner;
