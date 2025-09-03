// apps/web/src/state/orgContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBranch } from "@/store/slices/authSlice";
import { loadAuth, saveAuth } from "@/utils/authStorage";

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s?.auth || {});
  const user = auth?.user ?? loadAuth()?.user ?? null;

  // Normalize branches => hospitals [{id, name}]
  const hospitals = useMemo(() => {
    // Back-end returns user.branches as array of strings (branch IDs)
    const raw = Array.isArray(user?.branches) ? user.branches : [];
    return raw.map((id) => ({
      id: String(id),
      name: `Branch ${String(id)}`,
    }));
  }, [user]);

  // Initial active hospital: Redux → persisted → first branch
  const persisted = loadAuth() || {};
  const initialId =
    auth?.branchId ||
    persisted?.branchId ||
    (hospitals[0] ? hospitals[0].id : null);

  const [activeHospitalId, setActiveHospitalId] = useState(initialId);

  // Keep local state aligned if Redux/persisted change on first render
  useEffect(() => {
    if (initialId && initialId !== activeHospitalId) {
      setActiveHospitalId(initialId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  // When active branch changes → update Redux + persist → drives X-Branch-Id header
  useEffect(() => {
    if (!activeHospitalId) return;
    dispatch(setBranch(activeHospitalId));
    const snap = loadAuth() || {};
    saveAuth({ ...snap, branchId: activeHospitalId });
  }, [activeHospitalId, dispatch]);

  const activeHospital = useMemo(
    () => hospitals.find((h) => h.id === activeHospitalId) || null,
    [hospitals, activeHospitalId]
  );

  const isSuperAdmin = Array.isArray(user?.roles)
    ? user.roles.includes("SUPER_ADMIN")
    : String(user?.role || "").toUpperCase() === "SUPER_ADMIN";

  const value = {
    user,
    hospitals,
    activeHospital,
    activeHospitalId,
    setActiveHospitalId,
    isSuperAdmin,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside <OrgProvider/>");
  return ctx;
}
