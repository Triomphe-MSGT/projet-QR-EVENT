import React, { useEffect, useState, useRef, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useValidateQrCode } from "../../hooks/useEvents";
import { Loader2, CheckCircle, AlertTriangle, ScanLine } from "lucide-react";

const QrScanner = ({ eventName }) => {
  const scannerRef = useRef(null);
  const { mutate: validateQrCode } = useValidateQrCode();

  const [feedback, setFeedback] = useState({
    status: "idle",
    message: "Initialisation du scanner...",
  });

  const feedbackRef = useRef(feedback);
  feedbackRef.current = feedback;

  // ✅ Fonction pour lancer le scanner
  const startScanner = useCallback(() => {
    if (scannerRef.current) return; // éviter double initialisation

    const scannerElementId = "qr-reader-element";
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };

    const onScanSuccess = (decodedText) => {
      // Empêche de multiples validations
      if (
        ["validating", "success", "error"].includes(feedbackRef.current.status)
      )
        return;

      // 🛑 Pause du scan pendant validation
      scannerRef.current?.pause(true);
      setFeedback({ status: "validating", message: "Validation du ticket..." });

      let qrToken = "";
      try {
        const qrData = JSON.parse(decodedText);
        qrToken = qrData.token ?? decodedText;
      } catch {
        qrToken = decodedText;
      }

      if (!qrToken) {
        setFeedback({
          status: "error",
          message: "QR code invalide ou vide.",
        });
        return;
      }

      // ✅ Validation côté backend
      validateQrCode(
        { qrCodeToken: qrToken, eventName },
        {
          onSuccess: (res) => {
            setFeedback({
              status: "success",
              message: `✅ Ticket valide : ${
                res.participant?.nom || "Inconnu"
              }`,
            });
            // 🚫 On ne relance pas le scan automatiquement
          },
          onError: (err) => {
            setFeedback({
              status: "error",
              message: `❌ Échec : ${
                err.response?.data?.error || err.message || "Erreur inconnue"
              }`,
            });
            // 🚫 On ne relance pas le scan automatiquement
          },
        }
      );
    };

    const onScanFailure = (error) => {
      if (!error.includes("NotFoundException")) {
        console.warn("Erreur du scanner:", error);
      }
    };

    // Initialisation du scanner avec un léger délai
    const html5QrcodeScanner = new Html5QrcodeScanner(scannerElementId, config);
    setTimeout(() => {
      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = html5QrcodeScanner;
      setFeedback({
        status: "scanning",
        message: "Scanner un QR code pour valider le ticket...",
      });
    }, 500);
  }, [eventName, validateQrCode]);

  // ✅ Fonction pour stopper le scanner
  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current
        .clear()
        .catch((err) => console.error("Erreur arrêt scanner:", err))
        .finally(() => {
          scannerRef.current = null;
        });
    }
  }, []);

  // ✅ Lancement initial du scanner
  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, [startScanner, stopScanner]);

  // ✅ Relancer manuellement après validation
  const handleNextScan = () => {
    stopScanner();
    setFeedback({
      status: "idle",
      message: "Préparation du scanner...",
    });
    setTimeout(() => {
      startScanner();
    }, 1000);
  };

  // 🎨 Style du feedback
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
        return "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
      {/* Zone vidéo */}
      <div
        id="qr-reader-element"
        className="relative w-full aspect-square border dark:border-gray-600 rounded-md overflow-hidden mb-4"
      ></div>

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
        {feedback.message}
      </div>

      {/* Bouton de reprise du scan */}
      {["success", "error"].includes(feedback.status) && (
        <button
          onClick={handleNextScan}
          className="w-full mt-4 py-3 px-4 flex items-center justify-center
                     bg-blue-600 text-white font-semibold rounded-lg
                     shadow-md hover:bg-blue-700 transition-colors"
        >
          <ScanLine className="mr-2" size={20} />
          Scanner le ticket suivant
        </button>
      )}
    </div>
  );
};

export default QrScanner;
