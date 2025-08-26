// apps/web/src/hooks/usePermChecker.js
import { useMemo, useCallback } from "react";
import { useMeQuery } from "@/services/auth.api";

/**
 * usePermChecker
 * -----------------------------
 * Safe to use in loops/filters.
 * Returns a stable predicate: (perm?: string) => boolean
 *
 * Example:
 *   const can = usePermChecker();
 *   const visible = items.filter(i => !i.requirePerm || can(i.requirePerm));
 */
export default function usePermChecker() {
  const { data } = useMeQuery();
  const perms = data?.permissions || [];

  // O(1) lookups + stable identity
  const set = useMemo(() => new Set(perms), [perms]);

  // if no perm passed, treat as allowed
  return useCallback((key) => !key || set.has(key), [set]);
}
