import React from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../AppIcon";

/**
 * Breadcrumbs for:
 * /dashboard
 * /patients, /patients/new, /patients/:id
 * /appointments, /appointments/calendar
 * /encounters, /encounters/(soap|vitals|orders|prescriptions)
 * /billing, /billing/(invoices|payments)
 * /inventory, /inventory/(items|grn|transfer|ledger)
 */
const NavigationBreadcrumb = ({ customBreadcrumbs = null }) => {
  const location = useLocation();

  if (customBreadcrumbs) {
    return (
      <nav
        className="flex items-center space-x-2 text-sm text-text-secondary mb-6"
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

  // Top-level section labels by first segment
  const sectionMap = {
    dashboard: "Dashboard",
    patients: "Patients",
    appointments: "Appointments",
    encounters: "Medical Records",
    billing: "Billing",
    inventory: "Inventory",
  };

  // Second-level (subroute) labels by section
  const subMap = {
    patients: {
      new: "New Patient",
      ":id": "Patient Profile",
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
  };

  // Split path into segments (ignore leading empty)
  const parts = pathname.split("/").filter(Boolean); // e.g. ['patients','123']
  const [section, sub, sub2] = parts;

  // If we’re on home (root -> dashboard redirect), no breadcrumb until section exists
  if (!section) return null;

  const baseCrumbs = [];
  // Section
  const sectionLabel =
    sectionMap[section] ?? section?.replace(/^\w/, (c) => c.toUpperCase());
  const sectionPath = `/${section}`;
  baseCrumbs.push({ label: sectionLabel, path: sectionPath });

  // Subroute handling (supports ids)
  if (sub) {
    let subLabel;
    const map = subMap[section] || {};

    if (map[sub]) {
      subLabel = map[sub];
    } else if (/^\d+$/.test(sub) || sub.length >= 8) {
      // heuristic: numeric or long string treated as an id
      subLabel = map[":id"] || "Details";
    } else {
      subLabel = sub.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
    }

    baseCrumbs.push({ label: subLabel, path: `${sectionPath}/${sub}` });
  }

  // Optional third level (rare, but keep parity)
  if (sub2) {
    baseCrumbs.push({
      label: sub2.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
      path: `${sectionPath}/${sub}/${sub2}`,
    });
  }

  // Mark last item as current (no link)
  const crumbs = baseCrumbs.map((c, i) =>
    i === baseCrumbs.length - 1 ? { ...c, path: null } : c
  );

  // Hide breadcrumb on pure dashboard (match the screenshot)
  if (pathname === "/dashboard") return null;

  return (
    <nav
      className="flex items-center space-x-2 text-sm text-text-secondary mb-6"
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
