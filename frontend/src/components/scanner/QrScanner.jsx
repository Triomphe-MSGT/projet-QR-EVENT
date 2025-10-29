import React, { useEffect, useState, useRef, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useValidateQrCode } from "../../hooks/useEvents";
import { Loader2, CheckCircle, AlertTriangle, ScanLine } from "lucide-react"; // Ajout de ScanLine

const QrScanner = ({ eventName }) => {
  const scannerRef = useRef(null);
  const validateMutation = useValidateQrCode();

  const [feedback, setFeedback] = useState({ status: "idle", message: "" });
  const feedbackRef = useRef(feedback);
  feedbackRef.current = feedback; // Garde la réf à jour pour onScanSuccess

  // --- SUPPRESSION DE 'showTemporaryFeedback' ---
  // Nous n'allons plus redémarrer automatiquement.

  // --- AJOUT : Bouton pour redémarrer manuellement ---
  const handleScanNext = useCallback(() => {
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
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
  }, []); // Pas de dépendances, n'utilise que le ref et le setter

  useEffect(() => {
    if (scannerRef.current) return;

    const scannerElementId = "qr-reader-element";
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };

    const onScanSuccess = (decodedText) => {
      // Empêche le double scan si une validation est déjà en cours ou affichée
      if (
        ["validating", "success", "error"].includes(feedbackRef.current.status)
      ) {
        return;
      }

      scannerRef.current?.pause(true); // Met la caméra en pause
      setFeedback({ status: "validating", message: "Validation en cours..." });

      try {
        let qrToken = "";
        try {
          const qrData = JSON.parse(decodedText);
          qrToken = qrData.token ?? "";
          if (!qrToken) throw new Error("Token manquant.");
        } catch {
          // Si ce n'est pas du JSON, on suppose que le texte brut est le token
          qrToken = decodedText;
        }

        if (!qrToken) throw new Error("QR code invalide.");

        // Appel de la mutation
        validateMutation.mutate(
          { qrCodeToken: qrToken, eventName },
          {
            // --- MODIFICATION ---
            // Affiche un message de succès permanent (jusqu'au clic)
            onSuccess: (res) =>
              setFeedback({
                status: "success",
                message: `Ticket OK: ${res.participant?.nom || "Inconnu"}`,
              }),
            // Affiche un message d'erreur permanent (jusqu'au clic)
            onError: (err) =>
              setFeedback({
                status: "error",
                message: `Échec: ${
                  err.response?.data?.error || err.message || "Erreur inconnue"
                }`,
              }),
            // --- FIN MODIFICATION ---
          }
        );
      } catch (err) {
        // Gère les erreurs de parsing QR
        setFeedback({
          status: "error",
          message: `Erreur QR: ${err.message}`,
        });
      }
    };

    const onScanFailure = (error) => {
      // Ignore les erreurs "QR code non trouvé" qui arrivent 10x par seconde
      if (!error.includes("NotFoundException")) {
        console.warn("Erreur scanner:", error);
        setFeedback({ status: "error", message: "Erreur caméra ou scan." });
      }
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerElementId,
      config,
      false
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = html5QrcodeScanner;

    setTimeout(() => {
      setFeedback({
        status: "scanning",
        message: "Veuillez scanner le QR code...",
      });
    }, 300);

    return () => {
      html5QrcodeScanner
        .clear()
        .catch((err) => console.error("Échec arrêt scanner:", err));
      scannerRef.current = null;
    };
  }, [eventName, validateMutation]); // Dépendance 'showTemporaryFeedback' retirée

  // ... (getFeedbackStyle reste inchangé)
  const getFeedbackStyle = () => {
    /* ... */
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
      <div
        id="qr-reader-element"
        className="relative w-full aspect-square border dark:border-gray-600 rounded-md overflow-hidden mb-4"
      />
      <div
        className={`p-3 rounded-md border text-center font-medium text-sm transition-all ${getFeedbackStyle()}`}
      >
        {/* ... (icônes de feedback inchangées) ... */}
        {feedback.message || "Initialisation..."}
      </div>

      {/* --- AJOUT : Bouton de Scan Suivant --- */}
      {/* Ce bouton n'apparaît qu'après un succès ou une erreur */}
      {["success", "error"].includes(feedback.status) && (
        <button
          onClick={handleScanNext}
          className="w-full mt-4 py-3 px-4 flex items-center justify-center 
                     bg-blue-600 text-white font-semibold rounded-lg 
                     shadow-md hover:bg-blue-700 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ScanLine className="mr-2" size={20} />
          Scanner le ticket suivant
        </button>
      )}
      {/* --- FIN AJOUT --- */}
    </div>
  );
};

export default QrScanner;
