import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMeQuery } from "@/services/auth.api";
import { skipToken } from "@reduxjs/toolkit/query";

export default function PrivateRoute({ element, requirePerm }) {
  const token = useSelector((s) => s.auth?.token);
  const loc = useLocation();
  const { data: me, isLoading } = useMeQuery(token ? undefined : skipToken);

  if (!token) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (isLoading) return <div className="p-6">Loading…</div>;

  const roles = me?.user?.roles || [];
  const perms = me?.permissions || [];
  const allowed =
    roles.includes("SUPER_ADMIN") ||
    !requirePerm ||
    perms.includes(requirePerm);

  return allowed ? element : <Navigate to="/403" replace />;
}
