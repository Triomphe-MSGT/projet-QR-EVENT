// src/components/scanner/QrScanner.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useValidateQrCode } from "../../hooks/useEvents";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

/**
 * Composant QrScanner :
 * - Initialise et gère un scanner QR via html5-qrcode.
 * - Décode les QR codes et valide leur token via l’API backend.
 * - Fournit un retour visuel clair selon l’état du scan (en cours, succès, erreur...).
 */
const QrScanner = ({ eventName }) => {
  const scannerRef = useRef(null); // Instance active du scanner
  const validateMutation = useValidateQrCode(); // Hook API pour la validation serveur

  // État central du scanner : statut et message à afficher à l'utilisateur
  const [feedback, setFeedback] = useState({ status: "idle", message: "" });

  /**
   * Affiche un message temporaire (succès / erreur / validation)
   * puis relance automatiquement le scan après un délai donné.
   * Permet d’enchaîner les validations sans recharger la page.
   */
  const showTemporaryFeedback = useCallback(
    (status, message, duration = 3000) => {
      setFeedback({ status, message });
      setTimeout(() => {
        if (scannerRef.current) {
          try {
            scannerRef.current.resume(); // Reprise du flux vidéo
            setFeedback({
              status: "scanning",
              message: "Scanner à nouveau...",
            });
          } catch {
            setFeedback({
              status: "error",
              message: "Erreur lors de la reprise du scan.",
            });
          }
        }
      }, duration);
    },
    []
  );

  /**
   * Initialise le scanner dès que le composant est monté.
   * Détruit proprement l’instance au démontage pour libérer la caméra.
   */
  useEffect(() => {
    const scannerElementId = "qr-reader-element";

    // Configuration de la capture vidéo
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };

    /** Callback exécuté à chaque QR code détecté */
    const onScanSuccess = (decodedText) => {
      // Empêche les doublons pendant une phase de validation
      if (["validating", "success", "error"].includes(feedback.status)) return;

      scannerRef.current?.pause(true);
      setFeedback({ status: "validating", message: "Validation en cours..." });

      try {
        // Certains QR codes peuvent contenir un JSON, d'autres un simple token brut
        let qrToken = "";
        try {
          const qrData = JSON.parse(decodedText);
          qrToken = qrData.token ?? "";
          if (!qrToken) throw new Error("Token manquant.");
        } catch {
          qrToken = decodedText; // Fallback si non-JSON
        }

        if (!qrToken) throw new Error("QR code invalide.");

        // Appel API de validation
        validateMutation.mutate(
          { qrCodeToken: qrToken, eventName },
          {
            onSuccess: (res) =>
              showTemporaryFeedback(
                "success",
                `Ticket OK: ${res.participant?.nom || "Inconnu"}`,
                2500
              ),
            onError: (err) =>
              showTemporaryFeedback(
                "error",
                `Échec: ${
                  err.response?.data?.error || err.message || "Erreur inconnue"
                }`,
                3500
              ),
          }
        );
      } catch (err) {
        // Cas d’erreur avant l'appel API
        showTemporaryFeedback("error", `Erreur QR: ${err.message}`, 3500);
      }
    };

    /** Callback pour erreurs de capture (caméra / environnement) */
    const onScanFailure = (error) => {
      if (!error.includes("NotFoundException")) {
        console.warn("Erreur scanner:", error);
        setFeedback({ status: "error", message: "Erreur caméra ou scan." });
      }
    };

    // Démarrage du scanner
    const readerElement = document.getElementById(scannerElementId);
    if (readerElement && !scannerRef.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        scannerElementId,
        config,
        false
      );
      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = html5QrcodeScanner;
      setFeedback({
        status: "scanning",
        message: "Veuillez scanner le QR code...",
      });
    }

    // Nettoyage à la fermeture du composant
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Échec arrêt scanner:", err));
        scannerRef.current = null;
      }
    };
  }, [eventName, feedback.status, showTemporaryFeedback, validateMutation]);

  // Choisit le style visuel selon l’état du scan
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
      default:
        return "hidden";
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
      {/* Zone vidéo du scanner */}
      <div
        id="qr-reader-element"
        className="relative w-full aspect-square border dark:border-gray-600 rounded-md overflow-hidden mb-4"
      >
        {/* Cadre animé pendant la détection */}
        {(feedback.status === "scanning" ||
          feedback.status === "validating") && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[70%] h-[70%] border-4 border-blue-500/50 rounded-lg animate-pulse-border">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan-line"></div>
            </div>
          </div>
        )}
      </div>

      {/* Message d'état */}
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

      {/* Animations CSS */}
      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(100% - 4px)); }
        }
        .animate-scan-line {
          animation: scanLine 2.5s infinite alternate ease-in-out;
        }
        @keyframes pulseBorder {
          0%, 100% { border-color: rgba(59, 130, 246, 0.5); }
          50% { border-color: rgba(59, 130, 246, 0.9); }
        }
        .animate-pulse-border {
          animation: pulseBorder 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default QrScanner;
