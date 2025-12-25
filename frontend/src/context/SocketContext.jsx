import React, { createContext, useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

import { API_BASE_URL } from "../slices/axiosInstance";

const SOCKET_URL = API_BASE_URL.replace("/api", "");

const SocketContext = createContext(null);

SocketContext.displayName = "SocketContext";

/**
 * Hook to consume the socket context.
 */
export const useSocket = () => {
  return useContext(SocketContext);
};

/**
 * Provider that manages the socket connection.
 */
export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  useEffect(() => {
    // If user is logged in but socket is not created yet
    if (token && !socketRef.current) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
      });

      newSocket.on("connect", () => {
        console.log("[Socket] Connected to server");
      });

      // Listen for new notifications
      newSocket.on("new_notification", (notification) => {
        console.log("[Socket] New notification received:", notification);

        // Refresh notifications list
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });

      newSocket.on("disconnect", () => {
        console.log("[Socket] Disconnected");
      });

      newSocket.on("connect_error", (err) => {
        console.error("[Socket] Connection error:", err.message);
      });

      socketRef.current = newSocket;
    } else if (!token && socketRef.current) {
      // If user logs out
      socketRef.current.disconnect();
      socketRef.current = null;
      console.log("[Socket] Disconnected (logout)");
    }

    // Cleanup on component unmount
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
