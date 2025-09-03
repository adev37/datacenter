// apps/web/src/components/ui/NavigationBreadcrumb.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../AppIcon";

/**
 * Breadcrumbs for:
 * /dashboard
 * /patients, /patients/new, /patients/:id, /portal/patient
 * /appointments, /appointments/calendar
 * /encounters, /encounters/(soap|vitals|orders|prescriptions)
 * /billing/(invoices|payments)
 * /inventory/(items|grn|transfer|ledger)
 * /lab, /lab/(samples|results)
 * /radiology/(viewer|reports)
 * /pharmacy
 * /ipd/(admissions|bedboard|emar)
 * /reports/(finance|clinical|inventory)
 * /staff/(doctors|nurses|schedules)
 * /settings/(user-management|role-permissions|departments|preferences)
 * /login, /register
 * /notifications, /help
 */
const NavigationBreadcrumb = ({ customBreadcrumbs = null }) => {
  const location = useLocation();

  if (customBreadcrumbs) {
    return (
      <nav
        className="mb-6 flex items-center space-x-2 text-sm text-text-secondary"
        aria-label="Breadcrumb">
        <Icon name="Home" size={16} className="text-text-secondary" />
        {customBreadcrumbs.map((bc, i) => (
          <React.Fragment key={bc.path ?? i}>
            {i > 0 && (
              <Icon
                name="ChevronRight"
                size={14}
                className="text-text-secondary"
              />
            )}
            {bc.path ? (
              <Link
                to={bc.path}
                className="hover:text-text-primary healthcare-transition">
                {bc.label}
              </Link>
            ) : (
              <span
                className="font-medium text-text-primary"
                aria-current="page">
                {bc.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  const { pathname } = location;

  const sectionMap = {
    dashboard: "Dashboard",
    patients: "Patients",
    portal: "Patient Portal",
    appointments: "Appointments",
    encounters: "Medical Records",
    billing: "Billing",
    inventory: "Inventory",
    lab: "Lab",
    radiology: "Radiology",
    pharmacy: "Pharmacy",
    ipd: "IPD",
    reports: "Reports",
    staff: "Staff",
    settings: "Settings",
    login: "Login",
    register: "Register",
    notifications: "Notifications",
    help: "Help & Support",
  };

  const subMap = {
    patients: {
      new: "New Patient",
      ":id": "Patient Profile",
      "patient-medical-record": "Patient Medical Record",
    },
    appointments: {
      calendar: "Calendar",
    },
    encounters: {
      soap: "SOAP Notes",
      vitals: "Vitals",
      orders: "Orders",
      prescriptions: "Prescriptions",
    },
    billing: {
      invoices: "Invoices",
      payments: "Payments",
    },
    inventory: {
      items: "Items",
      grn: "GRN",
      transfer: "Stock Transfer",
      ledger: "Ledger",
    },
    lab: {
      samples: "Sample Collection",
      results: "Results Entry",
    },
    radiology: {
      viewer: "Study Viewer",
      reports: "Reports",
    },
    pharmacy: {
      dispense: "Dispense",
    },
    ipd: {
      admissions: "Admissions",
      bedboard: "Bed Board",
      emar: "eMAR",
    },
    reports: {
      finance: "Finance Reports",
      clinical: "Clinical Reports",
      inventory: "Inventory Reports",
    },
    staff: {
      doctors: "Doctors",
      nurses: "Nurses",
      schedules: "Schedules",
    },
    settings: {
      "user-management": "User Management",
      "role-permissions": "Role Permissions",
      departments: "Departments",
      preferences: "Preferences",
    },
    portal: {
      patient: "Patient",
    },
  };

  const parts = pathname.split("/").filter(Boolean);
  const [section, sub, sub2] = parts;

  if (!section) return null; // root → likely redirecting to /dashboard
  if (pathname === "/dashboard") return null; // hide on main dashboard

  const baseCrumbs = [];
  const sectionLabel =
    sectionMap[section] ?? section?.replace(/^\w/, (c) => c.toUpperCase());
  const sectionPath = `/${section}`;
  baseCrumbs.push({ label: sectionLabel, path: sectionPath });

  if (sub) {
    let subLabel;
    const map = subMap[section] || {};

    if (map[sub]) {
      subLabel = map[sub];
    } else if (/^\d+$/.test(sub) || sub.length >= 8) {
      subLabel = map[":id"] || "Details";
    } else {
      subLabel = sub.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
    }
    baseCrumbs.push({ label: subLabel, path: `${sectionPath}/${sub}` });
  }

  if (sub2) {
    baseCrumbs.push({
      label: sub2.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
      path: `${sectionPath}/${sub}/${sub2}`,
    });
  }

  const crumbs = baseCrumbs.map((c, i) =>
    i === baseCrumbs.length - 1 ? { ...c, path: null } : c
  );

  return (
    <nav
      className="mb-6 flex items-center space-x-2 text-sm text-text-secondary"
      aria-label="Breadcrumb">
      <Icon name="Home" size={16} className="text-text-secondary" />
      <Link
        to="/dashboard"
        className="hover:text-text-primary healthcare-transition">
        Dashboard
      </Link>
      {crumbs.map((bc, index) => (
        <React.Fragment key={`${bc.label}-${index}`}>
          <Icon name="ChevronRight" size={14} className="text-text-secondary" />
          {bc.path ? (
            <Link
              to={bc.path}
              className="hover:text-text-primary healthcare-transition">
              {bc.label}
            </Link>
          ) : (
            <span className="font-medium text-text-primary" aria-current="page">
              {bc.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default NavigationBreadcrumb;
