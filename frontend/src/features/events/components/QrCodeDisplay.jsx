import React from "react";

/**
 * Displays a QR code image from a Base64 Data URL.
 * @param {string} value - Base64 Data URL string
 * @param {number} size - Size of the QR code image
 */
const QrCodeDisplay = ({ value, size = 150 }) => {
  // Basic validation to ensure value is a valid string
  if (
    !value ||
    typeof value !== "string" ||
    !value.startsWith("data:image/png;base64,")
  ) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-xs text-center text-red-500 p-2">
          Données du QR Code invalides.
        </p>
      </div>
    );
  }

  return (
    <div className="p-2 bg-white rounded-md flex items-center justify-center">
      <img
        src={value}
        alt="QR Code de participation"
        width={size}
        height={size}
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
};

export default QrCodeDisplay;
