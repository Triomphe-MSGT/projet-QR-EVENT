import ListCategorie from "../../components/categories/CategoryList";
import MainLayout from "../../components/layouts/MainLayout";
import { useEffect, useState } from "react";
import { ThemeProvider } from "../../context/ThemeContext";

function IconChange() {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCheck((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="icon-container"
      className="w-24 h-24 mb-4 mx-auto flex items-center justify-center text-5xl relative"
    >
      <span
        id="q-icon"
        className={`absolute transition-opacity duration-500 ${
          showCheck ? "opacity-0" : "opacity-100"
        }`}
      >
        📋❓
      </span>
      <span
        id="c-icon"
        className={`absolute transition-opacity duration-500 ${
          showCheck ? "opacity-100" : "opacity-0"
        }`}
      >
        📋✅
      </span>
    </div>
  );
}

const HomePage = () => {
  return (
    <ThemeProvider>
      <MainLayout>
        <div
          className="
            min-h-screen 
            transition-colors duration-500 
            bg-[#F0F2F5] dark:bg-[#18191A] 
            text-[#050505] dark:text-[#E4E6EB]
            flex flex-col items-center
          "
        >
          {/* Section d’accueil */}
          <div className="text-center mt-8 px-4">
            <IconChange />
            <h1 className="text-2xl font-bold mb-1">Bonjour 👋</h1>
            <p className="text-[#65676B] dark:text-[#B0B3B8]">
              Nous sommes ravis de vous revoir. Que souhaitez-vous faire ?
            </p>
          </div>

          {/* Section catégories */}
          <div className="w-full max-w-3xl mt-10">
            <h2 className="text-lg font-semibold px-6 mb-4">
              Découvrez nos événements par catégorie
            </h2>

            <div
              className="
                bg-white dark:bg-[#242526] 
                shadow-sm dark:shadow-none 
                rounded-xl 
                p-4 
                transition-colors duration-500
              "
            >
              <ListCategorie />
            </div>
          </div>
        </div>
      </MainLayout>
    </ThemeProvider>
  );
};

export default HomePage;
