import { useAuth } from "@clerk/clerk-expo";

export const useCurrentUserId = () => {
  const { userId } = useAuth();
  return userId;
};