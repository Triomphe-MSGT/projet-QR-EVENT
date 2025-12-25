import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingBackButton = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Only show on desktop (hidden on mobile for better UX)
  return (
    <div className="hidden md:block fixed bottom-8 left-8 z-50">
      {isVisible && (
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center gap-2 animate-fade-in-up"
          aria-label="Retour"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-medium pr-1">Retour</span>
        </button>
      )}
    </div>
  );
};

export default FloatingBackButton;
