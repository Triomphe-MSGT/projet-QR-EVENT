import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/adminService";

/**
 * Hook to fetch admin statistics.
 */
export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to fetch all users.
 */
export const useAllUsers = () => {
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsers,
    staleTime: 1000 * 60 * 10,
  });
};

// --- Mutation Hooks ---

/**
 * Hook to create a new user.
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error) => console.error("Create user failed:", error),
  });
};

/**
 * Hook to update an existing user.
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => console.error("Update user failed:", error),
  });
};

/**
 * Hook to delete a user.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error) => console.error("Delete user failed:", error),
  });
};
