// apps/web/src/RoutesApp.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin-dashboard";
import NotAuthorized from "./pages/NotAuthorized";
import NotFound from "./pages/NotFound";

import PrivateRoute from "./components/route/PrivateRoute";
import AuthGate from "./components/route/AuthGate";
import DashboardLayout from "@/layout/DashboardLayout";

// ---- Patients
const PatientsList = React.lazy(() => import("./pages/patients/PatientsList"));
const AddPatient = React.lazy(() =>
  import("./pages/patients/registration/NewRegistration")
);
const PatientProfile = React.lazy(() =>
  import("./pages/patients/PatientProfile")
);
const PatientMedicalRecords = React.lazy(() =>
  import("./pages/patients/patient-medical-record")
);

// ---- Appointments
const AppointmentList = React.lazy(() =>
  import("./pages/appointments/AppointmentScheduling")
);
// Optional Calendar page (won’t crash if not present)
const CalendarView = React.lazy(() =>
  import("./pages/appointments/Calendar.jsx").catch(() => ({
    default: () => <div className="p-6">Calendar page not implemented.</div>,
  }))
);

// ---- Encounters / Records
const StartEncounter = React.lazy(() =>
  import("./pages/encounters/StartEncounter")
);
const SOAPEditor = React.lazy(() => import("./pages/encounters/SOAPEditor"));
const VitalsForm = React.lazy(() => import("./pages/encounters/VitalsForm"));
const Orders = React.lazy(() => import("./pages/encounters/Orders"));
const Prescriptions = React.lazy(() =>
  import("./pages/encounters/Prescriptions")
);

// ---- Lab
const LabOrders = React.lazy(() => import("./pages/lab/LabOrders"));
const SampleCollection = React.lazy(() =>
  import("./pages/lab/SampleCollection")
);
const ResultsEntry = React.lazy(() => import("./pages/lab/ResultsEntry"));

// ---- Radiology
const RadOrders = React.lazy(() => import("./pages/radiology/RadOrders"));
const StudyViewer = React.lazy(() => import("./pages/radiology/StudyViewer"));
const RadReports = React.lazy(() => import("./pages/radiology/Reports"));

// ---- Pharmacy
const Dispense = React.lazy(() => import("./pages/pharmacy/Dispense"));

// ---- IPD
const BedBoard = React.lazy(() => import("./pages/ipd/BedBoard"));
const Admissions = React.lazy(() => import("./pages/ipd/Admissions"));
const EMAR = React.lazy(() => import("./pages/ipd/eMAR"));

// ---- Billing
const Invoices = React.lazy(() => import("./pages/billing/Invoices"));
const Payments = React.lazy(() => import("./pages/billing/Payments"));

// ---- Inventory
const Items = React.lazy(() => import("./pages/inventory/Items"));
const GRN = React.lazy(() => import("./pages/inventory/GRN"));
const StockTransfer = React.lazy(() =>
  import("./pages/inventory/StockTransfer")
);
const Ledger = React.lazy(() => import("./pages/inventory/Ledger"));

// ---- Portal
const PatientPortal = React.lazy(() => import("./pages/portal/PatientPortal"));

// ---- Reports (optional—safe fallbacks)
const FinanceReports = React.lazy(() =>
  import("./pages/reports/FinanceReports.jsx").catch(() => ({
    default: () => <div className="p-6">Finance Reports not implemented.</div>,
  }))
);
const ClinicalReports = React.lazy(() =>
  import("./pages/reports/ClinicalReports.jsx").catch(() => ({
    default: () => <div className="p-6">Clinical Reports not implemented.</div>,
  }))
);
const InventoryReports = React.lazy(() =>
  import("./pages/reports/InventoryReports.jsx").catch(() => ({
    default: () => (
      <div className="p-6">Inventory Reports not implemented.</div>
    ),
  }))
);

// ---- Staff (optional—safe fallbacks)
const Doctors = React.lazy(() =>
  import("./pages/staff/Doctors").catch(() => ({
    default: () => <div className="p-6">Doctors page not implemented.</div>,
  }))
);
const Nurses = React.lazy(() =>
  import("./pages/staff/Nurses").catch(() => ({
    default: () => <div className="p-6">Nurses page not implemented.</div>,
  }))
);
const StaffSchedules = React.lazy(() =>
  import("./pages/staff/StaffSchedules").catch(() => ({
    default: () => <div className="p-6">Staff Schedules not implemented.</div>,
  }))
);

// ---- Settings
const UserProfileSettings = React.lazy(() =>
  import("./pages/settings/UserProfileSettings")
);
const UserManagement = React.lazy(() =>
  import("./pages/settings/UserManagement")
);
const RolePermissions = React.lazy(() =>
  import("./pages/settings/RolePermissions")
);
const Departments = React.lazy(() => import("./pages/settings/Departments"));
const Preferences = React.lazy(() => import("./pages/settings/Preferences"));
const CreateUser = React.lazy(() => import("./pages/settings/CreateUser"));

// ---- Misc (optional—safe fallbacks)
const Notifications = React.lazy(() =>
  import("./pages/notifications/Notifications").catch(() => ({
    default: () => <div className="p-6">Notifications not implemented.</div>,
  }))
);
const Help = React.lazy(() =>
  import("./pages/help/Help.jsx").catch(() => ({
    default: () => <div className="p-6">Help page not implemented.</div>,
  }))
);

const Fallback = ({ children }) => (
  <React.Suspense fallback={<div className="p-6">Loading…</div>}>
    {children}
  </React.Suspense>
);

export default function RoutesApp() {
  return (
    <AuthGate>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/403" element={<NotAuthorized />} />

        {/* Private area with layout */}
        <Route
          path="/"
          element={<PrivateRoute element={<DashboardLayout />} />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Patients */}
          <Route
            path="patients"
            element={
              <PrivateRoute
                requirePerm="patient.read"
                element={
                  <Fallback>
                    <PatientsList />
                  </Fallback>
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
                  <Fallback>
                    <AddPatient />
                  </Fallback>
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
                  <Fallback>
                    <PatientProfile />
                  </Fallback>
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
                  <Fallback>
                    <PatientMedicalRecords />
                  </Fallback>
                }
              />
            }
          />

          {/* Appointments */}
          <Route
            path="appointments"
            element={
              <PrivateRoute
                requirePerm="appointment.read"
                element={
                  <Fallback>
                    <AppointmentList />
                  </Fallback>
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
                  <Fallback>
                    <CalendarView />
                  </Fallback>
                }
              />
            }
          />

          {/* Encounters / Records */}
          <Route
            path="encounters"
            element={
              <PrivateRoute
                requirePerm="encounter.read"
                element={
                  <Fallback>
                    <StartEncounter />
                  </Fallback>
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
                  <Fallback>
                    <SOAPEditor />
                  </Fallback>
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
                  <Fallback>
                    <VitalsForm />
                  </Fallback>
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
                  <Fallback>
                    <Orders />
                  </Fallback>
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
                  <Fallback>
                    <Prescriptions />
                  </Fallback>
                }
              />
            }
          />
          <Route
            path="records"
            element={<Navigate to="../encounters" replace />}
          />

          {/* Lab (canonical = /lab + children) */}
          <Route
            path="lab"
            element={
              <PrivateRoute
                requirePerm="lab.order"
                element={
                  <Fallback>
                    <LabOrders />
                  </Fallback>
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
                  <Fallback>
                    <SampleCollection />
                  </Fallback>
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
                  <Fallback>
                    <ResultsEntry />
                  </Fallback>
                }
              />
            }
          />
          {/* aliases */}
          <Route path="lab/orders" element={<Navigate to="../lab" replace />} />
          <Route
            path="lab/sample"
            element={<Navigate to="../lab/samples" replace />}
          />

          {/* Radiology (canonical = /radiology for orders) */}
          <Route
            path="radiology"
            element={
              <PrivateRoute
                requirePerm="rad.order"
                element={
                  <Fallback>
                    <RadOrders />
                  </Fallback>
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
                  <Fallback>
                    <StudyViewer />
                  </Fallback>
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
                  <Fallback>
                    <RadReports />
                  </Fallback>
                }
              />
            }
          />

          {/* Pharmacy */}
          <Route
            path="pharmacy/dispense"
            element={
              <PrivateRoute
                requirePerm="pharmacy.dispense"
                element={
                  <Fallback>
                    <Dispense />
                  </Fallback>
                }
              />
            }
          />
          <Route
            path="pharmacy"
            element={<Navigate to="pharmacy/dispense" replace />}
          />

          {/* IPD */}
          <Route path="ipd" element={<Navigate to="ipd/bedboard" replace />} />
          <Route
            path="ipd/bedboard"
            element={
              <PrivateRoute
                requirePerm="ipd.admit"
                element={
                  <Fallback>
                    <BedBoard />
                  </Fallback>
                }
              />
            }
          />
          {/* alias with hyphen */}
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
                  <Fallback>
                    <Admissions />
                  </Fallback>
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
                  <Fallback>
                    <EMAR />
                  </Fallback>
                }
              />
            }
          />

          {/* Billing */}
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
                  <Fallback>
                    <Invoices />
                  </Fallback>
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
                  <Fallback>
                    <Payments />
                  </Fallback>
                }
              />
            }
          />

          {/* Inventory */}
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
                  <Fallback>
                    <Items />
                  </Fallback>
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
                  <Fallback>
                    <GRN />
                  </Fallback>
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
                  <Fallback>
                    <StockTransfer />
                  </Fallback>
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
                  <Fallback>
                    <Ledger />
                  </Fallback>
                }
              />
            }
          />

          {/* Reports (optional) */}
          <Route
            path="reports/finance"
            element={
              <PrivateRoute
                requirePerm="reports.finance"
                element={
                  <Fallback>
                    <FinanceReports />
                  </Fallback>
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
                  <Fallback>
                    <ClinicalReports />
                  </Fallback>
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
                  <Fallback>
                    <InventoryReports />
                  </Fallback>
                }
              />
            }
          />

          {/* Staff (optional) */}
          <Route
            path="staff/doctors"
            element={
              <PrivateRoute
                requirePerm="staff.read"
                element={
                  <Fallback>
                    <Doctors />
                  </Fallback>
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
                  <Fallback>
                    <Nurses />
                  </Fallback>
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
                  <Fallback>
                    <StaffSchedules />
                  </Fallback>
                }
              />
            }
          />

          {/* Settings */}
          <Route
            path="settings/profile"
            element={
              <PrivateRoute
                element={
                  <Fallback>
                    <UserProfileSettings />
                  </Fallback>
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
                  <Fallback>
                    <UserManagement />
                  </Fallback>
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
                  <Fallback>
                    <CreateUser />
                  </Fallback>
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
                  <Fallback>
                    <RolePermissions />
                  </Fallback>
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
                  <Fallback>
                    <Departments />
                  </Fallback>
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
                  <Fallback>
                    <Preferences />
                  </Fallback>
                }
              />
            }
          />

          {/* Portal (align with sidebar) */}
          <Route
            path="portal"
            element={
              <PrivateRoute
                requirePerm="patient.read"
                element={
                  <Fallback>
                    <PatientPortal />
                  </Fallback>
                }
              />
            }
          />
          {/* alias for any old link */}
          <Route
            path="portal/patient"
            element={<Navigate to="../portal" replace />}
          />

          {/* Notifications & Help (optional) */}
          <Route
            path="notifications"
            element={
              <PrivateRoute
                requirePerm="notifications.read"
                element={
                  <Fallback>
                    <Notifications />
                  </Fallback>
                }
              />
            }
          />
          <Route
            path="help"
            element={
              <PrivateRoute
                element={
                  <Fallback>
                    <Help />
                  </Fallback>
                }
              />
            }
          />
        </Route>

        {/* Fallbacks */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthGate>
  );
}
