// src/components/ui/QrCodeDisplay.jsx
import React from "react";

/**
 * Ce composant affiche une image de QR code.
 * Il accepte une chaîne de caractères qui est une Data URL Base64 (data:image/png;base64,...).
 */
const QrCodeDisplay = ({ value, size = 150 }) => {
  // Vérification de base pour s'assurer que la valeur est une chaîne valide.
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

  // --- CORRECTION PRINCIPALE ---
  // Au lieu d'utiliser <QRCodeSVG> pour ré-encoder,
  // on utilise une balise <img> pour afficher directement l'image Base64 reçue.
  return (
    <div className="p-2 bg-white rounded-md flex items-center justify-center">
      <img
        src={value} // La prop 'value' est déjà une source d'image valide (Data URL)
        alt="QR Code de participation"
        width={size}
        height={size}
        style={{ imageRendering: "pixelated" }} // Assure que le QR code est net
      />
    </div>
  );
};

export default QrCodeDisplay;
