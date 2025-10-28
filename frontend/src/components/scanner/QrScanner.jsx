import React, { useEffect, useState, useRef, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useValidateQrCode } from "../../hooks/useEvents";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

const QrScanner = ({ eventName }) => {
  const scannerRef = useRef(null);
  const validateMutation = useValidateQrCode();

  const [feedback, setFeedback] = useState({ status: "idle", message: "" });
  const feedbackRef = useRef(feedback);
  feedbackRef.current = feedback;

  const showTemporaryFeedback = useCallback(
    (status, message, duration = 3000) => {
      setFeedback({ status, message });
      setTimeout(() => {
        if (scannerRef.current) {
          try {
            scannerRef.current.resume();
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

  useEffect(() => {
    if (scannerRef.current) return; // ⚠️ Empêche la réinitialisation multiple

    const scannerElementId = "qr-reader-element";
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };

    const onScanSuccess = (decodedText) => {
      if (
        ["validating", "success", "error"].includes(feedbackRef.current.status)
      )
        return;

      scannerRef.current?.pause(true);
      setFeedback({ status: "validating", message: "Validation en cours..." });

      try {
        let qrToken = "";
        try {
          const qrData = JSON.parse(decodedText);
          qrToken = qrData.token ?? "";
          if (!qrToken) throw new Error("Token manquant.");
        } catch {
          qrToken = decodedText;
        }

        if (!qrToken) throw new Error("QR code invalide.");

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
        showTemporaryFeedback("error", `Erreur QR: ${err.message}`, 3500);
      }
    };

    const onScanFailure = (error) => {
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

    // ✅ Mise à jour une seule fois après initialisation
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
  }, [eventName, showTemporaryFeedback, validateMutation]);

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
      <div
        id="qr-reader-element"
        className="relative w-full aspect-square border dark:border-gray-600 rounded-md overflow-hidden mb-4"
      />
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
    </div>
  );
};

export default QrScanner;
