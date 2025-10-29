export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    theme: {
      extend: {
        keyframes: {
          "scan-laser": {
            "0%": { top: "0" },
            "100%": { top: "calc(100% - 4px)" }, // Va jusqu'en bas (moins la hauteur du laser)
          },
        },
        animation: {
          "scan-laser": "scan-laser 2.5s linear infinite alternate", // Fait l'aller-retour
        },
      },
    },
  },
  plugins: [],
};
