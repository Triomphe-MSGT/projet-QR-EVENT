import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userProfileService from "../services/userProfileService";
import { useDispatch } from "react-redux";
import { login, logout } from "../slices/authSlice";

/**
 * Hook to fetch the current user's profile.
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: userProfileService.getProfile,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to update the user's profile.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileService.updateProfile,
    onSuccess: () => {
      console.log("Profile updated successfully, invalidating cache...");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
  });
};

/**
 * Hook to change the user's password.
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: userProfileService.changeMyPassword,
  });
};

/**
 * Hook to delete the user's account.
 */
export const useDeleteMyAccount = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: userProfileService.deleteMyAccount,
    onSuccess: () => {
      dispatch(logout());
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Account deletion failed:", error);
    },
  });
};

/**
 * Hook to upload a user avatar.
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userProfileService.uploadAvatar,
    onSuccess: () => {
      console.log("Avatar uploaded successfully, invalidating cache...");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      console.error("Avatar upload failed:", error);
    },
  });
};

/**
 * Hook to fetch events associated with the user.
 */
export const useUserEvents = () => {
  return useQuery({
    queryKey: ["userEvents"],
    queryFn: userProfileService.getUserEvents,
    staleTime: 0,
  });
};

/**
 * Hook to upgrade the user to an organizer.
 */
export const useUpgradeToOrganizer = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: userProfileService.upgradeToOrganizer,
    onSuccess: (data) => {
      console.log("Upgrade successful:", data.message);

      queryClient.setQueryData(["userProfile"], data.user);
      queryClient.invalidateQueries({ queryKey: ["userEvents"] });

      const currentToken = localStorage.getItem("token");

      if (currentToken) {
        dispatch(login({ user: data.user, token: currentToken }));
      }
    },
    onError: (error) => {
      console.error("Upgrade failed:", error);
    },
  });
};
