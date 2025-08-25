import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query";
import { useMeQuery } from "@/services/auth.api";

/**
 * Usage:
 * <PrivateRoute element={<Dashboard />} />
 * <PrivateRoute requirePerm="patient.read" element={<PatientsList />} />
 */
export default function PrivateRoute({ element, requirePerm }) {
  // 1) Always call hooks at the top (stable order)
  const token = useSelector((s) => s.auth?.token);
  const loc = useLocation();

  // Call the hook every render, but skip the request if no token yet
  const { data: me, isLoading } = useMeQuery(token ? undefined : skipToken);

  // 2) If not authenticated → go to login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  // 3) If we’re validating the session, wait (prevents child query firing and 401)
  if (isLoading) {
    return <div className="p-6">Loading…</div>;
  }

  // 4) Permission gate if requested
  if (requirePerm) {
    const perms = me?.permissions || [];
    if (!perms.includes(requirePerm)) {
      return <Navigate to="/403" replace />;
    }
  }

  // 5) Safe to render the child
  return element;
}
