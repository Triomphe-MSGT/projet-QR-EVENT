import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Users, Globe } from "lucide-react";

// --- Composant de chargement (Splash Screen) ---
const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-white dark:bg-gray-950 z-[9999]">
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-4 bg-gradient-to-br from-blue-500 to-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
            Qr-Event
          </h1>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" 
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const OpenPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Découvrez des moments",
      highlight: "Inoubliables.",
      description: "Explorez les meilleurs événements au Cameroun et réservez votre place en un clic.",
      icon: Globe,
      color: "from-blue-600 to-blue-400"
    },
    {
      title: "Accès sécurisé par",
      highlight: "QR Code.",
      description: "Plus besoin de billets papier. Votre QR Code unique est votre laissez-passer sécurisé.",
      icon: ShieldCheck,
      color: "from-indigo-600 to-blue-500"
    },
    {
      title: "Organisation",
      highlight: "Simplifiée.",
      description: "Créez et gérez vos événements avec des outils professionnels de suivi en temps réel.",
      icon: Zap,
      color: "from-blue-500 to-green-400"
    },
    {
      title: "Rejoignez la",
      highlight: "Communauté.",
      description: "Partagez des expériences uniques avec des milliers de passionnés à travers le pays.",
      icon: Users,
      color: "from-green-500 to-emerald-400"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-600">
      {loading && <LoadingScreen />}

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] rounded-full transition-all duration-1000 ${currentStep % 2 === 0 ? 'opacity-100' : 'opacity-50'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-400/10 dark:bg-green-400/20 blur-[120px] rounded-full transition-all duration-1000 ${currentStep % 2 !== 0 ? 'opacity-100' : 'opacity-50'}`}></div>
      </div>

      <div className={`relative z-10 flex flex-col min-h-screen transition-all duration-1000 ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        
        {/* Navbar */}
        <nav className="px-6 py-8 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
              Qr-Event
            </span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="text-gray-500 dark:text-gray-400 font-bold text-sm hover:text-blue-600 transition-colors"
          >
            Passer
          </button>
        </nav>

        {/* Onboarding Content */}
        <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 text-center max-w-4xl mx-auto w-full relative">
          <div key={currentStep} className="animate-fade-in-up space-y-8">
            <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 transform rotate-3`}>
              {React.createElement(steps[currentStep].icon, { className: "w-10 h-10 text-white" })}
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9]">
              {steps[currentStep].title} <br />
              <span className={`bg-gradient-to-r ${steps[currentStep].color} bg-clip-text text-transparent`}>
                {steps[currentStep].highlight}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed font-medium">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Action Area */}
          <div className="mt-16 w-full max-w-md space-y-6">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="group w-full py-5 px-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Suivant
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                <button
                  onClick={() => navigate('/home')}
                  className="group flex-1 py-5 px-8 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                >
                  Découvrir
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 py-5 px-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-black rounded-2xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all transform hover:scale-[1.02] active:scale-95 shadow-sm"
                >
                  Organiser
                </button>
              </div>
            )}

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 pt-4">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentStep ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200 dark:bg-gray-800'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-8 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            © 2025 Qr-Event • L'excellence événementielle
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-fade-in { animation: fade-in-up 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default OpenPage;
