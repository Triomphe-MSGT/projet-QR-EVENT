// src/hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../slices/axiosInstance";

// Service 1: Récupérer les notifications
const fetchNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

// Service 2: Marquer comme lues
const markNotificationsAsRead = async () => {
  await api.post("/notifications/read");
};

// Hook 1: Pour obtenir les notifications
export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook 2: Pour marquer les notifications comme lues
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      // Mettre à jour manuellement le cache pour que le point rouge disparaisse instantanément
      queryClient.setQueryData(["notifications"], (oldData) =>
        oldData ? oldData.map((n) => ({ ...n, isRead: true })) : []
      );
      // Invalider pour un re-fetch en arrière-plan
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
