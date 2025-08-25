// apps/web/src/Route.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin-dashboard/index";

import PrivateRoute from "./components/route/PrivateRoute";
import AuthGate from "./components/route/AuthGate";

import NotAuthorized from "./pages/NotAuthorized";
import NotFound from "./pages/NotFound";

// Lazy-loaded feature pages
const PatientsList = lazy(() => import("./pages/patients/PatientsList"));
const AddPatient = lazy(() => import("./pages/patients/AddPatient"));
const PatientProfile = lazy(() => import("./pages/patients/PatientProfile"));

export default function RoutesApp() {
  return (
    <AuthGate>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/403" element={<NotAuthorized />} />

        {/* Protected (no specific permission) */}
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<Dashboard />} />}
        />

        {/* Patients: protected with permissions */}
        <Route
          path="/patients"
          element={
            <PrivateRoute
              requirePerm="patient.read"
              element={
                <Suspense fallback={<div className="p-6">Loading…</div>}>
                  <PatientsList />
                </Suspense>
              }
            />
          }
        />
        <Route
          path="/patients/new"
          element={
            <PrivateRoute
              requirePerm="patient.write"
              element={
                <Suspense fallback={<div className="p-6">Loading…</div>}>
                  <AddPatient />
                </Suspense>
              }
            />
          }
        />
        <Route
          path="/patients/:id"
          element={
            <PrivateRoute
              requirePerm="patient.read"
              element={
                <Suspense fallback={<div className="p-6">Loading…</div>}>
                  <PatientProfile />
                </Suspense>
              }
            />
          }
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthGate>
  );
}
