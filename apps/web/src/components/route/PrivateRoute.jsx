import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useHasPerm from "@/hooks/useHasPerm";

/**
 * <PrivateRoute element={<Dashboard />} />
 * <PrivateRoute element={<Patients />} requirePerm="patient.read" />
 * <PrivateRoute element={<Comp />} requireAnyPerm={['a','b']} />
 */
export default function PrivateRoute({ element, requirePerm, requireAnyPerm }) {
  const token = useSelector((s) => s.auth?.token);
  const location = useLocation();

  // permission helpers
  const hasPerm = (p) => (p ? useHasPerm(p) : true);
  const hasAny = (arr) =>
    Array.isArray(arr) && arr.length ? arr.some((p) => useHasPerm(p)) : true;

  if (!token)
    return <Navigate to="/login" replace state={{ from: location }} />;

  if (!hasPerm(requirePerm) || !hasAny(requireAnyPerm)) {
    return <Navigate to="/403" replace />;
  }

  return element;
}
