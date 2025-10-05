import React from "react";

const Navbar = () => {
  return (
    <nav className="p-4 flex items-center justify-between bg-white shadow-sm">
      {/* Icône de menu */}
      <a href="#" className="text-gray-600">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </a>

      {/* Titre central stylisé */}
      <h1 className="text-2xl font-bold font-['Poppins'] bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400">
        Qr-Event
      </h1>

      {/* Icône de profil utilisateur */}
      <a href="#" className="text-gray-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </a>
    </nav>
  );
};

export default Navbar;
