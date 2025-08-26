import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loadAuth } from "@/utils/authStorage";
import { setAuth, setBranch } from "@/store/slices/authSlice";

// ⬇️ NEW: app-level org context used by the sidebar Hospital card
import { OrgProvider } from "@/state/orgContext";

/**
 * Hydrates Redux from localStorage *and* bootstraps the OrgProvider
 * (user, hospitals list, and active hospital/branch).
 */
export default function AuthGate({ children }) {
  const [ready, setReady] = useState(false);

  // local state that will seed <OrgProvider/>
  const [orgBootstrap, setOrgBootstrap] = useState({
    user: null,
    hospitals: [],
    activeHospitalId: null,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    async function boot() {
      const persisted = loadAuth(); // { token, user, branchId }
      if (persisted) {
        dispatch(setAuth({ token: persisted.token, user: persisted.user }));
        if (persisted.branchId) dispatch(setBranch(persisted.branchId));

        // Start with whatever we have locally
        let bootstrap = {
          user: persisted.user || null,
          hospitals: persisted.user?.hospitals || [],
          activeHospitalId:
            persisted.branchId ||
            persisted.user?.activeHospitalId ||
            persisted.user?.hospitals?.[0]?.id ||
            null,
        };

        // If there is a token, try to refresh /me (optional; safe to fail)
        if (persisted.token) {
          try {
            const res = await fetch("/api/me", {
              headers: { Authorization: `Bearer ${persisted.token}` },
            });
            if (res.ok) {
              const me = await res.json();
              // Expecting: { user: {..., roles: [...]}, hospitals: [{id,name},...], activeHospitalId }
              bootstrap = {
                user: me?.user || bootstrap.user,
                hospitals: Array.isArray(me?.hospitals)
                  ? me.hospitals
                  : bootstrap.hospitals,
                activeHospitalId:
                  me?.activeHospitalId || bootstrap.activeHospitalId,
              };
            }
          } catch {
            // swallow – we can still render with persisted values
          }
        }

        setOrgBootstrap(bootstrap);
      }

      setReady(true);
    }

    boot();
  }, [dispatch]);

  if (!ready) return <div className="p-6">Loading…</div>;

  return (
    <OrgProvider
      initialUser={orgBootstrap.user}
      initialHospitals={orgBootstrap.hospitals}
      initialActiveHospitalId={orgBootstrap.activeHospitalId}>
      {children}
    </OrgProvider>
  );
}
