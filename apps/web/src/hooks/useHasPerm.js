import { useMeQuery } from "@/services/auth.api";

export default function useHasPerm(key) {
  const { data } = useMeQuery();
  const perms = data?.permissions || [];
  return perms.includes(key);
}
