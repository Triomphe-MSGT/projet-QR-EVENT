import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userProfileService from "../services/userProfileService";

export const useUserProfile = () =>
  useQuery(["userProfile"], () => userProfileService.getProfile());

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (updatedData) => userProfileService.updateProfile(updatedData),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(["userProfile"], data);
      },
    }
  );
};
