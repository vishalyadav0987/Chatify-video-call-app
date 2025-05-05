import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

const authUserHook = () => {
  // tanstack query to get the user data
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/auth/check-auth-user')
        return response.data
      } catch (error) {
        return null;
      }
    },
    retry: false, // auth check
  });

  const authUser = authData?.data || null;

  return {
    authUser,
    isLoading,
    error
  }
}

export default authUserHook
