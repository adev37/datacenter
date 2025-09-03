// apps/web/src/components/route/AuthGate.jsx
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loadAuth } from "@/utils/authStorage";
import { setAuth, setBranch } from "@/store/slices/authSlice";
import { OrgProvider } from "@/state/orgContext";
import { API_BASE } from "@/services/apiClient";

/**
 * Hydrates Redux from localStorage and bootstraps OrgProvider.
 */
export default function AuthGate({ children }) {
  const [ready, setReady] = useState(false);
  const [orgBootstrap, setOrgBootstrap] = useState({
    user: null,
    hospitals: [],
    activeHospitalId: null,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const persisted = loadAuth(); // { token, user, branchId }
      if (persisted) {
        // Hydrate redux
        dispatch(setAuth({ token: persisted.token, user: persisted.user }));
        if (persisted.branchId) dispatch(setBranch(persisted.branchId));

        // Build bootstrap object
        let user = persisted.user || null;

        // Refresh user/permissions snapshot if we have a token
        if (persisted.token) {
          try {
            const res = await fetch(`${API_BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${persisted.token}` },
              credentials: "include",
            });
            if (res.ok) {
              const me = await res.json(); // { user, permissions }
              if (me?.user) user = me.user;
            }
          } catch {
            // ignore; fall back to persisted
          }
        }

        // Normalize branches to hospitals [{id, name}]
        const hospitals = Array.isArray(user?.branches)
          ? user.branches.map((id) => ({
              id: String(id),
              name: `Branch ${id}`,
            }))
          : [];

        const activeHospitalId =
          persisted.branchId || (hospitals[0] ? hospitals[0].id : null);

        setOrgBootstrap({ user, hospitals, activeHospitalId });
      }
      setReady(true);
    })();
  }, [dispatch]);

  if (!ready) return <div className="p-6">Loading…</div>;

  return <OrgProvider>{children}</OrgProvider>;
}
