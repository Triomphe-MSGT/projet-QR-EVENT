import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  active = false, // Active state for toggle buttons
  className = "",
  type = "button",
}) => {
  const baseStyles =
    "rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400",
    primaryLarge:
      "w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors duration-200 shadow-md",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
    success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-400",
    outline:
      "border border-gray-400 text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
    detail:
      "px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200",
    google:
      "w-full flex items-center justify-center gap-2 bg-white text-black border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition",
    connecter: "w-full bg-green-500 text-white hover:bg-green-600",
    inscrire: "w-full bg-green-500 text-white hover:bg-green-600",

    toggle: `
      px-6 py-2 border-b-2 transition-all duration-300 font-medium
      ${
        active
          ? "border-blue-500 text-blue-500 font-bold"
          : "border-transparent text-gray-500 hover:text-blue-500 hover:border-blue-500"
      }
    `,
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
