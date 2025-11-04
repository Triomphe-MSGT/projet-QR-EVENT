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
          "scroll-horizontal": {
            "0%": { transform: "translateX(0%)" },
            "100%": { transform: "translateX(-100%)" },
          },
          animation: {
            "scan-laser": "scan-laser 2.5s linear infinite alternate",
            "scroll-horizontal": "scroll-horizontal 40s linear infinite",
          },
        },
      },
    },
  },
  plugins: [],
};
