// apps/web/src/RoutesApp.jsx
// -------------------------------------------------------------
// Central app routing with:
//  - Auth gating + role/permission protected routes
//  - Route-level code splitting via React.lazy
//  - Single Suspense fallback + small per-page fallbacks
//  - Optional pages wrapped with safe dynamic imports
//  - Clear grouping and aliases for canonical paths
// -------------------------------------------------------------

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Core auth/layout
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotAuthorized from "./pages/NotAuthorized";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin-dashboard";

import PrivateRoute from "./components/route/PrivateRoute";
import AuthGate from "./components/route/AuthGate";
import DashboardLayout from "@/layout/DashboardLayout";

// ---- Lazy helper -----------------------------------------------------------
// Wrap any element with <Suspense> so we don’t repeat the fallback everywhere.
const WithSuspense = ({ children }) => (
  <React.Suspense fallback={<div className="p-6">Loading…</div>}>
    {children}
  </React.Suspense>
);

// ---- Patients --------------------------------------------------------------
// webpackChunkName comments help create readable chunk names in builds.
const PatientsList = React.lazy(() =>
  import(
    /* webpackChunkName: "patients-list" */ "./pages/patients/PatientsList"
  )
);
const AddPatient = React.lazy(() =>
  import(
    /* webpackChunkName: "patients-new" */ "./pages/patients/registration/NewRegistration"
  )
);
const PatientProfile = React.lazy(() =>
  import(
    /* webpackChunkName: "patients-profile" */ "./pages/patients/PatientProfile"
  )
);
const PatientMedicalRecords = React.lazy(() =>
  import(
    /* webpackChunkName: "patients-medical-records" */ "./pages/patients/patient-medical-record"
  )
);
const EditPatient = React.lazy(() =>
  import(/* webpackChunkName: "patients-edit" */ "./pages/patients/EditPatient")
);

// ---- Notifications (new) --------------------------------------
const Notifications = React.lazy(() =>
  import(
    /* webpackChunkName: "notifications" */ "./pages/notifications/Notifications"
  )
);

// ---- Appointments ----------------------------------------------------------
const AppointmentList = React.lazy(() =>
  import(
    /* webpackChunkName: "appointments-list" */ "./pages/appointments/AppointmentScheduling"
  )
);
// Use the actual component path in your repo (components/CalendarView.jsx)
const CalendarView = React.lazy(() =>
  import(
    /* webpackChunkName: "appointments-calendar" */ "./pages/appointments/components/CalendarView"
  ).catch(() => ({
    default: () => <div className="p-6">Calendar page not implemented.</div>,
  }))
);

// ---- Encounters / Records --------------------------------------------------
const StartEncounter = React.lazy(() =>
  import(
    /* webpackChunkName: "encounters-start" */ "./pages/encounters/StartEncounter"
  )
);
const SOAPEditor = React.lazy(() =>
  import(
    /* webpackChunkName: "encounters-soap" */ "./pages/encounters/SOAPEditor"
  )
);
const VitalsForm = React.lazy(() =>
  import(
    /* webpackChunkName: "encounters-vitals" */ "./pages/encounters/VitalsForm"
  )
);
const Orders = React.lazy(() =>
  import(
    /* webpackChunkName: "encounters-orders" */ "./pages/encounters/Orders"
  )
);
const Prescriptions = React.lazy(() =>
  import(
    /* webpackChunkName: "encounters-prescriptions" */ "./pages/encounters/Prescriptions"
  )
);

// ---- Lab -------------------------------------------------------------------
const LabOrders = React.lazy(() =>
  import(/* webpackChunkName: "lab-orders" */ "./pages/lab/LabOrders")
);
const SampleCollection = React.lazy(() =>
  import(/* webpackChunkName: "lab-samples" */ "./pages/lab/SampleCollection")
);
const ResultsEntry = React.lazy(() =>
  import(/* webpackChunkName: "lab-results" */ "./pages/lab/ResultsEntry")
);

// ---- Radiology -------------------------------------------------------------
const RadOrders = React.lazy(() =>
  import(/* webpackChunkName: "rad-orders" */ "./pages/radiology/RadOrders")
);
const StudyViewer = React.lazy(() =>
  import(/* webpackChunkName: "rad-viewer" */ "./pages/radiology/StudyViewer")
);
const RadReports = React.lazy(() =>
  import(/* webpackChunkName: "rad-reports" */ "./pages/radiology/Reports")
);

// ---- Pharmacy --------------------------------------------------------------
const Dispense = React.lazy(() =>
  import(
    /* webpackChunkName: "pharmacy-dispense" */ "./pages/pharmacy/Dispense"
  )
);

// ---- IPD -------------------------------------------------------------------
const BedBoard = React.lazy(() =>
  import(/* webpackChunkName: "ipd-bedboard" */ "./pages/ipd/BedBoard")
);
const Admissions = React.lazy(() =>
  import(/* webpackChunkName: "ipd-admissions" */ "./pages/ipd/Admissions")
);
const EMAR = React.lazy(() =>
  import(/* webpackChunkName: "ipd-emar" */ "./pages/ipd/eMAR")
);

// ---- Billing ---------------------------------------------------------------
const Invoices = React.lazy(() =>
  import(/* webpackChunkName: "billing-invoices" */ "./pages/billing/Invoices")
);
const Payments = React.lazy(() =>
  import(/* webpackChunkName: "billing-payments" */ "./pages/billing/Payments")
);

// ---- Inventory -------------------------------------------------------------
const Items = React.lazy(() =>
  import(/* webpackChunkName: "inv-items" */ "./pages/inventory/Items")
);
const GRN = React.lazy(() =>
  import(/* webpackChunkName: "inv-grn" */ "./pages/inventory/GRN")
);
const StockTransfer = React.lazy(() =>
  import(
    /* webpackChunkName: "inv-transfer" */ "./pages/inventory/StockTransfer"
  )
);
const Ledger = React.lazy(() =>
  import(/* webpackChunkName: "inv-ledger" */ "./pages/inventory/Ledger")
);

// ---- Portal ---------------------------------------------------------------
const PatientPortal = React.lazy(() =>
  import(/* webpackChunkName: "portal" */ "./pages/portal/PatientPortal")
);

// ---- Reports (optional, safe fallbacks) -----------------------------------
const FinanceReports = React.lazy(() =>
  import(
    /* webpackChunkName: "reports-finance" */ "./pages/reports/FinanceReports.jsx"
  ).catch(() => ({
    default: () => <div className="p-6">Finance Reports not implemented.</div>,
  }))
);
const ClinicalReports = React.lazy(() =>
  import(
    /* webpackChunkName: "reports-clinical" */ "./pages/reports/ClinicalReports.jsx"
  ).catch(() => ({
    default: () => <div className="p-6">Clinical Reports not implemented.</div>,
  }))
);
const InventoryReports = React.lazy(() =>
  import(
    /* webpackChunkName: "reports-inventory" */ "./pages/reports/InventoryReports.jsx"
  ).catch(() => ({
    default: () => (
      <div className="p-6">Inventory Reports not implemented.</div>
    ),
  }))
);

// ---- Staff (optional, safe fallbacks) -------------------------------------
const Doctors = React.lazy(() =>
  import(/* webpackChunkName: "staff-doctors" */ "./pages/staff/Doctors").catch(
    () => ({
      default: () => <div className="p-6">Doctors page not implemented.</div>,
    })
  )
);
const Nurses = React.lazy(() =>
  import(/* webpackChunkName: "staff-nurses" */ "./pages/staff/Nurses").catch(
    () => ({
      default: () => <div className="p-6">Nurses page not implemented.</div>,
    })
  )
);
const StaffSchedules = React.lazy(() =>
  import(
    /* webpackChunkName: "staff-schedules" */ "./pages/staff/StaffSchedules"
  ).catch(() => ({
    default: () => <div className="p-6">Staff Schedules not implemented.</div>,
  }))
);

// ---- Settings --------------------------------------------------------------
const UserProfileSettings = React.lazy(() =>
  import(
    /* webpackChunkName: "settings-profile" */ "./pages/settings/UserProfileSettings"
  )
);
const UserManagement = React.lazy(() =>
  import(
    /* webpackChunkName: "settings-user-mgmt" */ "./pages/settings/UserManagement"
  )
);
const RolePermissions = React.lazy(() =>
  import(
    /* webpackChunkName: "settings-role" */ "./pages/settings/RolePermissions"
  )
);
const Departments = React.lazy(() =>
  import(
    /* webpackChunkName: "settings-departments" */ "./pages/settings/Departments"
  )
);
const Preferences = React.lazy(() =>
  import(
    /* webpackChunkName: "settings-preferences" */ "./pages/settings/Preferences"
  )
);
const CreateUser = React.lazy(() =>
  import(
    /* webpackChunkName: "settings-create-user" */ "./pages/settings/CreateUser"
  )
);
const UserDirectory = React.lazy(() =>
  import(
    /* webpackChunkName: "settings-user-directory" */ "./pages/settings/UserDirectory"
  )
);
import AuditLogs from "@/pages/settings/AuditLogs"; // (eager load; tiny page)

//
// =============================================================================

export default function RoutesApp() {
  return (
    <AuthGate>
      <Routes>
        {/* ------------------ Public ------------------ */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/403" element={<NotAuthorized />} />

        {/* ------------------ Private + Layout Shell ------------------ */}
        <Route
          path="/"
          element={<PrivateRoute element={<DashboardLayout />} />}>
          {/* Default redirect to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* ------ Dashboard ------ */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* ------ Patients ------ */}
          <Route
            path="patients"
            element={
              <PrivateRoute
                requirePerm="patient.read"
                element={
                  <WithSuspense>
                    <PatientsList />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="patients/new"
            element={
              <PrivateRoute
                requirePerm="patient.write"
                element={
                  <WithSuspense>
                    <AddPatient />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="patients/:id"
            element={
              <PrivateRoute
                requirePerm="patient.read"
                element={
                  <WithSuspense>
                    <PatientProfile />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="patients/patient-medical-record"
            element={
              <PrivateRoute
                requirePerm="patient.read"
                element={
                  <WithSuspense>
                    <PatientMedicalRecords />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="patients/:id/edit"
            element={
              <PrivateRoute
                requirePerm="patient.write"
                element={
                  <WithSuspense>
                    <EditPatient />
                  </WithSuspense>
                }
              />
            }
          />

          {/* ------ Notifications ------ */}
          <Route
            path="notifications"
            element={
              <PrivateRoute
                requirePerm="notifications.read"
                element={
                  <WithSuspense>
                    <Notifications />
                  </WithSuspense>
                }
              />
            }
          />

          {/* ------ Appointments ------ */}
          <Route
            path="appointments"
            element={
              <PrivateRoute
                requirePerm="appointment.read"
                element={
                  <WithSuspense>
                    <AppointmentList />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="appointments/calendar"
            element={
              <PrivateRoute
                requirePerm="appointment.read"
                element={
                  <WithSuspense>
                    <CalendarView />
                  </WithSuspense>
                }
              />
            }
          />

          {/* ------ Encounters / Records ------ */}
          <Route
            path="encounters"
            element={
              <PrivateRoute
                requirePerm="encounter.read"
                element={
                  <WithSuspense>
                    <StartEncounter />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="encounters/soap"
            element={
              <PrivateRoute
                requirePerm="encounter.write"
                element={
                  <WithSuspense>
                    <SOAPEditor />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="encounters/vitals"
            element={
              <PrivateRoute
                requirePerm="vitals.write"
                element={
                  <WithSuspense>
                    <VitalsForm />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="encounters/orders"
            element={
              <PrivateRoute
                requirePerm="encounter.write"
                element={
                  <WithSuspense>
                    <Orders />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="encounters/prescriptions"
            element={
              <PrivateRoute
                requirePerm="prescription.write"
                element={
                  <WithSuspense>
                    <Prescriptions />
                  </WithSuspense>
                }
              />
            }
          />
          {/* Alias for legacy path */}
          <Route
            path="records"
            element={<Navigate to="../encounters" replace />}
          />

          {/* ------ Lab (canonical /lab) ------ */}
          <Route
            path="lab"
            element={
              <PrivateRoute
                requirePerm="lab.order"
                element={
                  <WithSuspense>
                    <LabOrders />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="lab/samples"
            element={
              <PrivateRoute
                requirePerm="lab.result"
                element={
                  <WithSuspense>
                    <SampleCollection />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="lab/results"
            element={
              <PrivateRoute
                requirePerm="lab.result"
                element={
                  <WithSuspense>
                    <ResultsEntry />
                  </WithSuspense>
                }
              />
            }
          />
          {/* Lab aliases */}
          <Route path="lab/orders" element={<Navigate to="../lab" replace />} />
          <Route
            path="lab/sample"
            element={<Navigate to="../lab/samples" replace />}
          />

          {/* ------ Radiology ------ */}
          <Route
            path="radiology"
            element={
              <PrivateRoute
                requirePerm="rad.order"
                element={
                  <WithSuspense>
                    <RadOrders />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="radiology/viewer"
            element={
              <PrivateRoute
                requirePerm="rad.report"
                element={
                  <WithSuspense>
                    <StudyViewer />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="radiology/reports"
            element={
              <PrivateRoute
                requirePerm="rad.report"
                element={
                  <WithSuspense>
                    <RadReports />
                  </WithSuspense>
                }
              />
            }
          />

          {/* ------ Pharmacy ------ */}
          <Route
            path="pharmacy/dispense"
            element={
              <PrivateRoute
                requirePerm="pharmacy.dispense"
                element={
                  <WithSuspense>
                    <Dispense />
                  </WithSuspense>
                }
              />
            }
          />
          {/* Canonical redirect */}
          <Route
            path="pharmacy"
            element={<Navigate to="pharmacy/dispense" replace />}
          />

          {/* ------ IPD ------ */}
          <Route path="ipd" element={<Navigate to="ipd/bedboard" replace />} />
          <Route
            path="ipd/bedboard"
            element={
              <PrivateRoute
                requirePerm="ipd.admit"
                element={
                  <WithSuspense>
                    <BedBoard />
                  </WithSuspense>
                }
              />
            }
          />
          {/* Alias with hyphen */}
          <Route
            path="ipd/bed-board"
            element={<Navigate to="../ipd/bedboard" replace />}
          />
          <Route
            path="ipd/admissions"
            element={
              <PrivateRoute
                requirePerm="ipd.admit"
                element={
                  <WithSuspense>
                    <Admissions />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="ipd/emar"
            element={
              <PrivateRoute
                requirePerm="emar.administer"
                element={
                  <WithSuspense>
                    <EMAR />
                  </WithSuspense>
                }
              />
            }
          />

          {/* ------ Billing ------ */}
          <Route
            path="billing"
            element={<Navigate to="billing/invoices" replace />}
          />
          <Route
            path="billing/invoices"
            element={
              <PrivateRoute
                requirePerm="billing.invoice"
                element={
                  <WithSuspense>
                    <Invoices />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="billing/payments"
            element={
              <PrivateRoute
                requirePerm="billing.payment"
                element={
                  <WithSuspense>
                    <Payments />
                  </WithSuspense>
                }
              />
            }
          />

          {/* ------ Inventory ------ */}
          <Route
            path="inventory"
            element={<Navigate to="inventory/items" replace />}
          />
          <Route
            path="inventory/items"
            element={
              <PrivateRoute
                requirePerm="inv.item"
                element={
                  <WithSuspense>
                    <Items />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="inventory/grn"
            element={
              <PrivateRoute
                requirePerm="inv.grn"
                element={
                  <WithSuspense>
                    <GRN />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="inventory/transfer"
            element={
              <PrivateRoute
                requirePerm="inv.transfer"
                element={
                  <WithSuspense>
                    <StockTransfer />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="inventory/ledger"
            element={
              <PrivateRoute
                requirePerm="inv.ledger"
                element={
                  <WithSuspense>
                    <Ledger />
                  </WithSuspense>
                }
              />
            }
          />

          {/* ------ Reports (optional) ------ */}
          <Route
            path="reports/finance"
            element={
              <PrivateRoute
                requirePerm="reports.finance"
                element={
                  <WithSuspense>
                    <FinanceReports />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="reports/clinical"
            element={
              <PrivateRoute
                requirePerm="reports.clinical"
                element={
                  <WithSuspense>
                    <ClinicalReports />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="reports/inventory"
            element={
              <PrivateRoute
                requirePerm="reports.inventory"
                element={
                  <WithSuspense>
                    <InventoryReports />
                  </WithSuspense>
                }
              />
            }
          />

          {/* ------ Staff (optional) ------ */}
          <Route
            path="staff/doctors"
            element={
              <PrivateRoute
                requirePerm="staff.read"
                element={
                  <WithSuspense>
                    <Doctors />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="staff/nurses"
            element={
              <PrivateRoute
                requirePerm="staff.read"
                element={
                  <WithSuspense>
                    <Nurses />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="staff/schedules"
            element={
              <PrivateRoute
                requirePerm="staff.schedule"
                element={
                  <WithSuspense>
                    <StaffSchedules />
                  </WithSuspense>
                }
              />
            }
          />

          {/* ------ Settings ------ */}
          <Route
            path="settings/user-directory"
            element={
              <PrivateRoute
                requirePerm="settings.user"
                element={
                  <WithSuspense>
                    <UserDirectory />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="settings/profile"
            element={
              <PrivateRoute
                element={
                  <WithSuspense>
                    <UserProfileSettings />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="settings/user-management"
            element={
              <PrivateRoute
                requirePerm="settings.user"
                element={
                  <WithSuspense>
                    <UserManagement />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="settings/create-user"
            element={
              <PrivateRoute
                requirePerm="settings.user"
                element={
                  <WithSuspense>
                    <CreateUser />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="settings/role-permissions"
            element={
              <PrivateRoute
                requirePerm="settings.role"
                element={
                  <WithSuspense>
                    <RolePermissions />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="settings/departments"
            element={
              <PrivateRoute
                requirePerm="settings.department"
                element={
                  <WithSuspense>
                    <Departments />
                  </WithSuspense>
                }
              />
            }
          />
          <Route
            path="settings/preferences"
            element={
              <PrivateRoute
                requirePerm="settings.preferences"
                element={
                  <WithSuspense>
                    <Preferences />
                  </WithSuspense>
                }
              />
            }
          />
          <Route path="/settings/audit-logs" element={<AuditLogs />} />

          {/* ------ Portal ------ */}
          <Route
            path="portal"
            element={
              <PrivateRoute
                requirePerm="patient.read"
                element={
                  <WithSuspense>
                    <PatientPortal />
                  </WithSuspense>
                }
              />
            }
          />
          {/* Alias for legacy link */}
          <Route
            path="portal/patient"
            element={<Navigate to="../portal" replace />}
          />
        </Route>

        {/* ------------------ 404 fallback ------------------ */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthGate>
  );
}
