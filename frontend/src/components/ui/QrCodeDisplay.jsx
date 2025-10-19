import React from "react";
import { QRCodeSVG } from "qrcode.react";

const QrCodeDisplay = ({ value }) => {
  if (!value || typeof value !== "string") {
    return (
      <p className="text-sm text-red-500">
        QR Code invalide ou données manquantes.
      </p>
    );
  }

  return (
    <div className="p-2 bg-white rounded-md">
      <QRCodeSVG
        value={value}
        size={150}
        bgColor="#ffffff"
        fgColor="#000000"
        level="L"
        includeMargin={false}
      />
    </div>
  );
};

export default QrCodeDisplay;
