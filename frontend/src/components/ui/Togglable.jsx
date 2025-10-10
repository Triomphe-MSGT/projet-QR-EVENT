import { useState } from "react";
import Button from "./Button";

const Togglable = (props) => {
  // true = Connexion visible, false = Inscription visible
  const [isConnexionVisible, setIsConnexionVisible] = useState(true);

  const showConnexion = () => setIsConnexionVisible(true);
  const showInscription = () => setIsConnexionVisible(false);

  return (
    <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow-xl dark:shadow-none w-full max-w-sm transform transition-all duration-300">
      <h1 className="text-3xl font-extrabold font-[Poppins] text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400 mb-6">
        {props.title}
      </h1>

      <div className="flex justify-center mb-6 border-b-2 border-gray-200 dark:border-[#3E4042]">
        <Button
          onClick={showInscription}
          variant="toggle"
          active={!isConnexionVisible}
        >
          {props.firstTabLabel}
        </Button>
        <Button
          onClick={showConnexion}
          variant="toggle"
          active={isConnexionVisible}
        >
          {props.secondTabLabel}
        </Button>
      </div>

      {/* Contenu Inscription */}
      <div
        className={`transition-all duration-500 ${
          isConnexionVisible
            ? "opacity-0 pointer-events-none absolute"
            : "opacity-100"
        }`}
      >
        {props.firstTabContent}
      </div>

      {/* Contenu Connexion */}
      <div
        className={`transition-all duration-500 ${
          isConnexionVisible
            ? "opacity-100"
            : "opacity-0 pointer-events-none absolute"
        }`}
      >
        {props.secondTabContent || props.children}
      </div>
    </div>
  );
};

export default Togglable;
