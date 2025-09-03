// apps/web/src/hooks/useHasPerm.js
import { useMeQuery } from "@/services/auth.api";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";

export default function useHasPerm(key) {
  const token = useSelector((s) => s.auth?.token);
  const { data } = useMeQuery(token ? undefined : skipToken);

  const roles = data?.user?.roles || [];
  if (roles.includes("SUPER_ADMIN")) return true; // 👈 bypass for super

  const perms = data?.permissions || [];
  return !key || perms.includes(key);
}
