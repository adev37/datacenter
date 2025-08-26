// src/state/orgContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBranch } from "@/store/slices/authSlice";
import { loadAuth } from "@/utils/authStorage";

// simple localStorage helper so branch persists across reloads
function persistBranchId(branchId) {
  try {
    const persisted = loadAuth() || {};
    const next = { ...persisted, branchId };
    localStorage.setItem("auth", JSON.stringify(next));
  } catch {}
}

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s?.auth || {});
  const user = auth?.user ?? loadAuth()?.user ?? null;

  // Hospitals: derive from user payload (adjust to your API shape)
  const hospitals = useMemo(() => {
    // Try common shapes: user.branches | user.hospitals
    const list = user?.branches || user?.hospitals || [];
    // normalize to {id, name}
    return list.map((b) => ({
      id:
        b?.id ??
        b?._id ??
        b?.branchId ??
        b?.code ??
        String(b?.name || "unknown"),
      name: b?.name || b?.label || b?.title || "Unnamed Hospital",
    }));
  }, [user]);

  const initialId =
    auth?.branchId ||
    loadAuth()?.branchId ||
    (hospitals[0] ? hospitals[0].id : null);

  const [activeHospitalId, setActiveHospitalId] = useState(initialId);

  useEffect(() => {
    if (initialId && initialId !== activeHospitalId) {
      setActiveHospitalId(initialId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  // keep redux + localStorage in sync
  useEffect(() => {
    if (!activeHospitalId) return;
    dispatch(setBranch(activeHospitalId));
    persistBranchId(activeHospitalId);
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
