import ListCategorie from "../../components/categories/CategoryList";
import MainLayout from "../../components/layouts/MainLayout";
import { useEffect, useState } from "react";

function IconChange() {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCheck((prev) => !prev); // alterne entre true/false
    }, 3000); // toutes les 3 secondes

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
    <MainLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="text-center mt-8 px-4">
          <IconChange />

          <h1 className="text-2xl font-bold mb-1">Bonjour !</h1>
          <p className="text-gray-600">
            Nous sommes contents de vous revoir. Que souhaitez-vous faire ?
          </p>
        </div>
        <div className="w-full max-w-3xl mt-10">
          <h2 className="text-lg font-semibold px-6 mb-4">
            Découvrez nos événements par catégorie
          </h2>
          <ListCategorie />
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
