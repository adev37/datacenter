// apps/web/src/hooks/usePermChecker.js
import { useMemo, useCallback } from "react";
import { useMeQuery } from "@/services/auth.api";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";

export default function usePermChecker() {
  const token = useSelector((s) => s.auth?.token);
  const { data } = useMeQuery(token ? undefined : skipToken);

  const roles = data?.user?.roles || [];
  const superBypass = roles.includes("SUPER_ADMIN"); // 👈

  const set = useMemo(() => new Set(data?.permissions || []), [data]);

  return useCallback(
    (key) => {
      if (superBypass) return true; // 👈 SUPER_ADMIN always allowed
      return !key || set.has(key);
    },
    [superBypass, set]
  );
}
