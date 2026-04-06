import React, { useEffect, useState, useRef, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useValidateQrCode } from "../../../hooks/useEvents";
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

  // Function to start the scanner
  const startScanner = useCallback(() => {
    if (scannerRef.current) return; // Prevent double initialization

    const scannerElementId = "qr-reader-element";
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };

    const onScanSuccess = (decodedText) => {
      // Prevent multiple validations
      if (
        ["validating", "success", "error"].includes(feedbackRef.current.status)
      )
        return;

      // Pause scan during validation
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

      // Backend validation
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
            // Do not restart scan automatically
          },
          onError: (err) => {
            setFeedback({
              status: "error",
              message: `❌ Échec : ${
                err.response?.data?.error || err.message || "Erreur inconnue"
              }`,
            });
            // Do not restart scan automatically
          },
        }
      );
    };

    const onScanFailure = (error) => {
      if (!error.includes("NotFoundException")) {
        console.warn("Erreur du scanner:", error);
      }
    };

    // Initialize scanner with a slight delay
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

  // Function to stop the scanner
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

  // Initial scanner launch
  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, [startScanner, stopScanner]);

  // Manually restart after validation
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

  // Feedback style
  const getFeedbackStyle = () => {
    switch (feedback.status) {
      case "validating":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "success":
        return "bg-green-50 text-green-600 border-green-100 px-6";
      case "error":
        return "bg-red-50 text-red-500 border-red-100 px-6";
      case "scanning":
        return "bg-slate-50 text-slate-400 border-slate-100";
      default:
        return "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Zone vidéo Studio Style */}
      <div className="relative group/scanner">
        <div
          id="qr-reader-element"
          className="relative w-full aspect-square bg-slate-900 rounded-[2rem] overflow-hidden shadow-inner border-[8px] border-slate-50"
        ></div>
        
        {/* Overlay Decoration */}
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/20 rounded-[2rem] m-8 group-hover:border-orange-500/30 transition-colors"></div>
        
        {feedback.status === "scanning" && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black uppercase text-white tracking-[0.2em]">
             <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
             Live Studio
          </div>
        )}
      </div>

      {/* Message de feedback */}
      <div
        className={`p-5 rounded-2xl border text-center font-black text-[10px] uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3 ${getFeedbackStyle()}`}
      >
        {feedback.status === "validating" && (
          <Loader2 className="animate-spin" size={14} />
        )}
        {feedback.status === "success" && (
          <CheckCircle size={14} className="fill-current" />
        )}
        {feedback.status === "error" && (
          <AlertTriangle size={14} className="fill-current" />
        )}
        <span>{feedback.message}</span>
      </div>

      {/* Bouton de reprise du scan */}
      {["success", "error"].includes(feedback.status) && (
        <button
          onClick={handleNextScan}
          className="w-full py-5 px-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-orange-600 hover:shadow-orange-600/30 transition-all flex items-center justify-center gap-3 animate-in slide-in-from-bottom-2"
        >
          <ScanLine size={18} className="text-orange-500" />
          Suivant
        </button>
      )}
    </div>
  );
};

export default QrScanner;
