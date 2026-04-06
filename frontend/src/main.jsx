import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "leaflet/dist/leaflet.css";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { ThemeProvider } from "./context/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SocketProvider } from "./context/SocketContext";
import { queryClient } from "./app/queryClient";

const clientId = "282777767077-5b5qposkepee839oirk2jvrcp7si14v7.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {/* <LanguageProvider> */}
        <ThemeProvider>
          <GoogleOAuthProvider clientId={clientId}>
            <SocketProvider>
              <App />
            </SocketProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
        {/* </LanguageProvider> */}
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
