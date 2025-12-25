// src/hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../slices/axiosInstance";

// --- Services ---

const fetchNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

const markNotificationsAsRead = async () => {
  await api.post("/notifications/read");
};

const deleteNotification = async (id) => {
  await api.delete(`/notifications/${id}`);
};

const deleteAllNotifications = async () => {
  await api.delete("/notifications/all");
};

// --- Hooks ---

/**
 * Hook to fetch notifications.
 */
export const useNotifications = (options = {}) => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 30, // 30 seconds
    ...options,
  });
};

/**
 * Hook to mark notifications as read.
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueryData(["notifications"], (oldData) =>
        oldData ? oldData.map((n) => ({ ...n, isRead: true })) : []
      );
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

/**
 * Hook to delete a notification.
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: (_, id) => {
      queryClient.setQueryData(["notifications"], (oldData) =>
        oldData ? oldData.filter((n) => n._id !== id && n.id !== id) : []
      );
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

/**
 * Hook to delete all notifications.
 */
export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      queryClient.setQueryData(["notifications"], []);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
