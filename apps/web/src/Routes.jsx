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
const AddPatient = React.lazy(() => import("./pages/patients/AddPatient"));
const PatientProfile = React.lazy(() =>
  import("./pages/patients/PatientProfile")
);
// ---- Appointments
const AppointmentList = React.lazy(() =>
  import("./pages/appointments/AppointmentList")
);
const Calendar = React.lazy(() => import("./pages/appointments/Calendar"));
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

        {/* Authenticated area wrapped with header + sidebar */}
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
                    <Calendar />
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
          {/* alias */}
          <Route
            path="records"
            element={<Navigate to="../encounters" replace />}
          />

          {/* Lab */}
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
            path="lab/sample"
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

          {/* Radiology */}
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
            path="pharmacy"
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

          {/* Portal */}
          <Route
            path="portal/patient"
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
        </Route>

        {/* Defaults */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthGate>
  );
}
