import React from "react";
import AppRouter from "./AppRouter";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  return (
    <div>
      <AppRouter />;
    </div>
  );
};

export default App;
