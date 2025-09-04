// apps/web/src/components/route/AuthGate.jsx
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loadAuth } from "@/utils/authStorage";
import { setAuth, setBranch } from "@/store/slices/authSlice";
import { OrgProvider } from "@/state/orgContext";
import { API_BASE } from "@/services/apiClient";

/**
 * Hydrates Redux from localStorage and bootstraps OrgProvider.
 * (Removed unused orgBootstrap state; behavior unchanged.)
 */
export default function AuthGate({ children }) {
  const [ready, setReady] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const persisted = loadAuth(); // { token, user, branchId }
      if (persisted) {
        // Hydrate redux from persisted snapshot
        dispatch(setAuth({ token: persisted.token, user: persisted.user }));
        if (persisted.branchId) dispatch(setBranch(persisted.branchId));

        // Best-effort refresh of /auth/me to get current roles/perms
        if (persisted.token) {
          try {
            const res = await fetch(`${API_BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${persisted.token}` },
              credentials: "include",
            });
            if (res.ok) {
              const me = await res.json(); // { user, permissions }
              if (me?.user) {
                // Update redux with the freshest user snapshot
                dispatch(setAuth({ token: persisted.token, user: me.user }));
                if (persisted.branchId) dispatch(setBranch(persisted.branchId));
              }
            }
          } catch {
            // ignore network/refresh issues; fall back to persisted
          }
        }
      }
      setReady(true);
    })();
  }, [dispatch]);

  if (!ready) return <div className="p-6">Loading…</div>;

  return <OrgProvider>{children}</OrgProvider>;
}
