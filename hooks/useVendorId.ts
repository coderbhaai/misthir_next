// hooks >  useVendorId.ts
import { useAuth } from "contexts/AuthContext";

export const useVendorId = () => {
  const { user } = useAuth();
  return user?._id ?? null;
};