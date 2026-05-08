import { useQuery } from "@tanstack/react-query";
import { userAPI } from "@/services/userService";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
