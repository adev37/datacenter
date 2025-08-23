import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin-dashboard/index";
import PrivateRoute from "./components/route/PrivateRoute";
import AuthGate from "./components/route/AuthGate";
import NotAuthorized from "./pages/NotAuthorized";
import NotFound from "./pages/NotFound";
import Register from "./pages/auth/Register";

// Example protected page needing a permission:
const PatientsList = React.lazy(() => import("./pages/patients/PatientsList"));

export default function RoutesApp() {
  return (
    <AuthGate>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/403" element={<NotAuthorized />} />

        {/* Protected without specific permission */}
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<Dashboard />} />}
        />
        {/* Protected WITH permission (patient.read) */}
        <Route
          path="/patients"
          element={
            <PrivateRoute
              element={
                <React.Suspense fallback={<div className="p-6">Loading…</div>}>
                  <PatientsList />
                </React.Suspense>
              }
              requirePerm="patient.read"
            />
          }
        />
        {/* Default */}
        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthGate>
  );
}
