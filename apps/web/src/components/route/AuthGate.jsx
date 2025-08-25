import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loadAuth } from "@/utils/authStorage";
import { setAuth, setBranch } from "@/store/slices/authSlice";

/**
 * Hydrates Redux from localStorage before we render any protected routes.
 */
export default function AuthGate({ children }) {
  const [ready, setReady] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const persisted = loadAuth();
    if (persisted) {
      dispatch(setAuth({ token: persisted.token, user: persisted.user }));
      if (persisted.branchId) dispatch(setBranch(persisted.branchId));
    }
    setReady(true);
  }, [dispatch]);

  if (!ready) return <div className="p-6">Loading…</div>;
  return children;
}
