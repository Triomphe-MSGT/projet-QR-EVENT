import { useQuery } from "@tanstack/react-query";
import { getCities } from "../services/eventService";

/**
 * Hook to fetch all unique cities.
 */
export const useCities = () => {
  return useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
};
