import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomePage from "./HomePage";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      {/* Espace vide en haut pour l'équilibre visuel */}
      <div></div>

      {/* Zone Centrale : Logo Grande Taille */}
      <div className="flex flex-col items-center animate-pulse">
        <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center transition-transform duration-1000">
          {/* Remplacer par l'URL de votre logo réel */}
          <img 
            src="./logo.png" 
            alt="QR-Event Logo" 
            className="w-full h-full object-contain filter drop-shadow-sm"
            style={{ 
            }}
          />
        </div>
      </div>
      {/* Zone Basse : Indicateur de chargement discret */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="w-2.5 h-2.5 rounded-full bg-slate-200 animate-bounce" 
              style={{ 
                animationDelay: `${i * 0.15}s`,
                backgroundColor: i === 1 ? '#FF6F00' : '#1A73E8' 
              }}
            ></div>
          ))}
        </div>
        <div className="text-slate-400 text-sm font-medium tracking-widest uppercase">
        </div>
      </div>
    </div>
  );
};

const OpenPage = () => {
 const [loading, setLoading] = useState(true);
 const navigate = useNavigate();

 useEffect(() => {
 const timer = setTimeout(() => setLoading(false), 2000);
 return () => clearTimeout(timer);
 }, []);

 if (loading) return <LoadingScreen />;

 return <HomePage />;
};

export default OpenPage;
