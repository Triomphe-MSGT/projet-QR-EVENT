import React, { createContext, useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

import { API_BASE_URL } from "../slices/axiosInstance";

const SOCKET_URL = (API_BASE_URL || "http://localhost:3001/api").replace(
  "/api",
  ""
);

// Créer le contexte
const SocketContext = createContext(null);

// Ajout d'un nom d'affichage pour le débogage et le linting
SocketContext.displayName = "SocketContext";

// Hook pour consommer le contexte
export const useSocket = () => {
  return useContext(SocketContext);
};

// Fournisseur (Provider) qui gère la connexion
export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Si l'utilisateur est connecté mais que le socket n'est pas encore créé
    if (token && !socketRef.current) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token, // Envoi du token JWT pour l'authentification
        },
        // transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("[Socket] Connecté au serveur");
      });

      // ÉCOUTER les nouvelles notifications
      newSocket.on("new_notification", (notification) => {
        console.log("[Socket] Nouvelle notification reçue:", notification);

        // Rafraîchir la liste des notifications
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });

      newSocket.on("disconnect", () => {
        console.log("[Socket] Déconnecté");
      });

      newSocket.on("connect_error", (err) => {
        console.error("[Socket] Erreur de connexion:", err.message);
      });

      socketRef.current = newSocket;
    } else if (!token && socketRef.current) {
      // Si l'utilisateur se déconnecte
      socketRef.current.disconnect();
      socketRef.current = null;
      console.log("[Socket] Déconnecté (logout)");
    }

    // Nettoyage lors du démontage du composant
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, queryClient]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
