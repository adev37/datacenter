// apps/web/src/components/ui/NavigationSidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "./Button";
import HospitalContextCard from "./HospitalContextCard";
import usePermChecker from "@/hooks/usePermChecker";

/**
 * Sidebar driven by a route-aware config and filtered by permissions.
 * SUPER_ADMIN can() should always return true for every perm.
 */
const NavigationSidebar = (props) => {
  const collapsed = props.collapsed ?? props.isCollapsed ?? false;
  const onToggle = props.onCollapsedChange ?? props.onToggle ?? (() => {});
  const location = useLocation();
  const navigate = useNavigate();
  const can = usePermChecker();

  const isActive = (base) =>
    location.pathname === base || location.pathname.startsWith(`${base}/`);

  const lastPatientId =
    typeof window !== "undefined"
      ? localStorage.getItem("lastPatientId")
      : null;

  // 1) Raw menu model — mirrors RoutesApp.jsx
  const rawItems = useMemo(
    () => [
      // --- Dashboard ---------------------------------------------------------
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: "LayoutDashboard",
        description: "Overview and metrics",
        children: [
          { label: "Admin Dashboard", path: "/dashboard", icon: "Gauge" },
        ],
      },

      // --- Patients ----------------------------------------------------------
      {
        label: "Patients",
        path: "/patients",
        icon: "Users",
        description: "Register & manage patients",
        children: [
          {
            label: "Patient List",
            path: "/patients",
            icon: "List",
            requirePerm: "patient.read",
          },
          {
            label: "New Patient",
            path: "/patients/new",
            icon: "UserPlus",
            requirePerm: "patient.write",
          },
          lastPatientId
            ? {
                label: "Patient Profile",
                path: `/patients/${lastPatientId}`,
                icon: "IdCard",
                requirePerm: "patient.read",
              }
            : null,
          {
            label: "Patient Medical Record",
            path: "/patients/patient-medical-record",
            icon: "FolderOpen",
            requirePerm: "patient.read",
          },
        ].filter(Boolean),
      },

      // --- Appointments ------------------------------------------------------
      {
        label: "Appointments",
        path: "/appointments",
        icon: "Calendar",
        description: "Schedule and manage",
        children: [
          {
            label: "Appointments",
            path: "/appointments",
            icon: "CalendarDays",
            requirePerm: "appointment.read",
          },
          {
            label: "Calendar",
            path: "/appointments/calendar",
            icon: "CalendarCheck",
            requirePerm: "appointment.read",
          },
        ],
      },

      // --- Medical Records / Encounters -------------------------------------
      {
        label: "Medical Records",
        path: "/encounters",
        icon: "FileText",
        description: "Encounters & notes",
        children: [
          {
            label: "Start Encounter",
            path: "/encounters",
            icon: "PlayCircle",
            requirePerm: "encounter.read",
          },
          {
            label: "SOAP Notes",
            path: "/encounters/soap",
            icon: "FilePen",
            requirePerm: "encounter.write",
          },
          {
            label: "Vitals",
            path: "/encounters/vitals",
            icon: "Activity",
            requirePerm: "vitals.write",
          },
          {
            label: "Orders",
            path: "/encounters/orders",
            icon: "ClipboardList",
            requirePerm: "encounter.write",
          },
          {
            label: "Prescriptions",
            path: "/encounters/prescriptions",
            icon: "Pill",
            requirePerm: "prescription.write",
          },
        ],
      },

      // --- Lab ---------------------------------------------------------------
      {
        label: "Lab",
        path: "/lab",
        icon: "FlaskConical",
        description: "Lab test management",
        children: [
          {
            label: "Lab Orders",
            path: "/lab",
            icon: "ClipboardList",
            requirePerm: "lab.order",
          },
          {
            label: "Sample Collection",
            path: "/lab/samples",
            icon: "TestTube2",
            requirePerm: "lab.result",
          },
          {
            label: "Results Entry",
            path: "/lab/results",
            icon: "FileSpreadsheet",
            requirePerm: "lab.result",
          },
        ],
      },

      // --- Radiology ---------------------------------------------------------
      {
        label: "Radiology",
        path: "/radiology",
        icon: "Scan",
        description: "Imaging & reports",
        children: [
          {
            label: "RAD Orders",
            path: "/radiology",
            icon: "ClipboardList",
            requirePerm: "rad.order",
          },
          {
            label: "Study Viewer",
            path: "/radiology/viewer",
            icon: "Monitor",
            requirePerm: "rad.report",
          },
          {
            label: "Reports",
            path: "/radiology/reports",
            icon: "Files",
            requirePerm: "rad.report",
          },
        ],
      },

      // --- Pharmacy ----------------------------------------------------------
      {
        label: "Pharmacy",
        path: "/pharmacy",
        icon: "Capsule",
        description: "Dispense medications",
        children: [
          {
            label: "Dispense",
            path: "/pharmacy/dispense", // ← fix to match route
            icon: "PackageOpen",
            requirePerm: "pharmacy.dispense",
          },
        ],
      },

      // --- IPD ---------------------------------------------------------------
      {
        label: "IPD",
        path: "/ipd",
        icon: "BedDouble",
        description: "In-patient management",
        children: [
          {
            label: "Bed Board",
            path: "/ipd/bedboard",
            icon: "Grid",
            requirePerm: "ipd.admit",
          },
          {
            label: "Admissions",
            path: "/ipd/admissions",
            icon: "ClipboardPlus",
            requirePerm: "ipd.admit",
          },
          {
            label: "eMAR",
            path: "/ipd/emar",
            icon: "Syringe",
            requirePerm: "emar.administer",
          },
        ],
      },

      // --- Billing -----------------------------------------------------------
      {
        label: "Billing",
        path: "/billing",
        icon: "CreditCard",
        description: "Invoices & payments",
        children: [
          {
            label: "Invoices",
            path: "/billing/invoices",
            icon: "Receipt",
            requirePerm: "billing.invoice",
          },
          {
            label: "Payments",
            path: "/billing/payments",
            icon: "Banknote",
            requirePerm: "billing.payment",
          },
        ],
      },

      // --- Inventory ---------------------------------------------------------
      {
        label: "Inventory",
        path: "/inventory",
        icon: "Package",
        description: "Supplies & equipment",
        children: [
          {
            label: "Items",
            path: "/inventory/items",
            icon: "Boxes",
            requirePerm: "inv.item",
          },
          {
            label: "GRN",
            path: "/inventory/grn",
            icon: "FilePlus2",
            requirePerm: "inv.grn",
          },
          {
            label: "Stock Transfer",
            path: "/inventory/transfer",
            icon: "ArrowLeftRight",
            requirePerm: "inv.transfer",
          },
          {
            label: "Ledger",
            path: "/inventory/ledger",
            icon: "Book",
            requirePerm: "inv.ledger",
          },
        ],
      },

      // --- Reports -----------------------------------------------------------
      {
        label: "Reports",
        path: "/reports",
        icon: "BarChart3",
        description: "Analytics & exports",
        children: [
          {
            label: "Finance Reports",
            path: "/reports/finance",
            icon: "LineChart",
            requirePerm: "reports.finance",
          },
          {
            label: "Clinical Reports",
            path: "/reports/clinical",
            icon: "Stethoscope",
            requirePerm: "reports.clinical",
          },
          {
            label: "Inventory Reports",
            path: "/reports/inventory",
            icon: "PieChart",
            requirePerm: "reports.inventory",
          },
        ],
      },

      // --- Staff -------------------------------------------------------------
      {
        label: "Staff",
        path: "/staff",
        icon: "UserCog",
        description: "Doctors, nurses, schedules",
        children: [
          {
            label: "Doctors",
            path: "/staff/doctors",
            icon: "UserRound",
            requirePerm: "staff.read",
          },
          {
            label: "Nurses",
            path: "/staff/nurses",
            icon: "UserRound",
            requirePerm: "staff.read",
          },
          {
            label: "Schedules",
            path: "/staff/schedules",
            icon: "CalendarCog",
            requirePerm: "staff.schedule",
          },
        ],
      },

      // --- Settings ----------------------------------------------------------
      {
        label: "Settings",
        path: "/settings",
        icon: "Settings",
        description: "System configuration",
        children: [
          {
            label: "Profile",
            path: "/settings/profile",
            icon: "User",
          },
          {
            label: "User Management",
            path: "/settings/user-management",
            icon: "Users",
            requirePerm: "settings.user",
          },
          {
            label: "Create User",
            path: "/settings/create-user",
            icon: "UserPlus",
            requirePerm: "settings.user",
          },
          {
            label: "Role Permissions",
            path: "/settings/role-permissions",
            icon: "ShieldCheck",
            requirePerm: "settings.role",
          },
          {
            label: "Departments",
            path: "/settings/departments",
            icon: "Building2",
            requirePerm: "settings.department",
          },
          {
            label: "Preferences",
            path: "/settings/preferences",
            icon: "SlidersHorizontal",
            requirePerm: "settings.preferences",
          },
          {
            label: "Audit Logs",
            path: "/settings/audit-logs",
            icon: "ClipboardList",
            requirePerm: "audit.read",
          },
        ],
      },

      // --- Portal ------------------------------------------------------------
      {
        label: "Portal",
        path: "/portal",
        icon: "DoorOpen",
        description: "Patient self service",
        children: [
          {
            label: "Patient Portal",
            path: "/portal",
            icon: "DoorOpen",
            requirePerm: "patient.read",
          },
        ],
      },

      // --- Help & Notifications ----------------------------------------------
      {
        label: "Help & Notifications",
        path: "/help",
        icon: "HelpCircle",
        description: "Support and alerts",
        children: [
          {
            label: "Notifications",
            path: "/notifications",
            icon: "Bell",
            requirePerm: "notifications.read",
          },
          { label: "Help & Support", path: "/help", icon: "LifeBuoy" },
        ],
      },
    ],
    [lastPatientId]
  );

  // 2) Permission filtering
  const items = useMemo(() => {
    return rawItems
      .map((g) => {
        const children = (g.children || []).filter(
          (c) => !c.requirePerm || can(c.requirePerm)
        );
        const groupVisible =
          children.length > 0 ||
          ((g.children || []).length === 0 &&
            (!g.requirePerm || can(g.requirePerm)));
        return groupVisible ? { ...g, children } : null;
      })
      .filter(Boolean);
  }, [rawItems, can]);

  // 3) Expand/collapse state derived from current route
  const defaultExpanded = useMemo(() => {
    const map = {};
    items.forEach((it) => {
      if (it.children?.length)
        map[it.path] = it.children.some((c) => isActive(c.path));
    });
    return map;
  }, [items, location.pathname]);

  const [expanded, setExpanded] = useState(defaultExpanded);
  useEffect(() => setExpanded(defaultExpanded), [defaultExpanded]);
  const toggleGroup = (path) =>
    setExpanded((s) => ({ ...s, [path]: !s?.[path] }));

  return (
    <>
      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 hidden lg:block bg-white border-r transition-all ${
          collapsed ? "w-16" : "w-72"
        }`}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(!collapsed)}
              className="w-full justify-center">
              <Icon
                name={collapsed ? "ChevronRight" : "ChevronLeft"}
                size={20}
              />
            </Button>
          </div>

          {/* Scrollable menu body */}
          <nav className="flex-1 min-h-0 overflow-y-auto space-y-1 p-3 pr-2">
            {items.map((item) => {
              const active = isActive(item.path);
              const hasChildren = !!item.children?.length;

              // Collapsed OR leaf nodes
              if (collapsed || !hasChildren) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={[
                      "group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                    title={collapsed ? item.label : ""}>
                    <Icon
                      name={item.icon}
                      size={20}
                      className={active ? "text-white" : "text-gray-700"}
                    />
                    {!collapsed && (
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.label}</p>
                        <p
                          className={`truncate text-xs ${
                            active ? "text-white/90" : "text-gray-500"
                          }`}>
                          {item.description}
                        </p>
                      </div>
                    )}
                  </Link>
                );
              }

              const open = expanded[item.path];
              return (
                <div key={item.path}>
                  <button
                    onClick={() => toggleGroup(item.path)}
                    className={[
                      "group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}>
                    <Icon
                      name={item.icon}
                      size={20}
                      className={active ? "text-white" : "text-gray-700"}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.label}</p>
                      <p
                        className={`truncate text-xs ${
                          active ? "text-white/90" : "text-gray-500"
                        }`}>
                        {item.description}
                      </p>
                    </div>
                    <Icon
                      name={open ? "ChevronUp" : "ChevronDown"}
                      size={16}
                      className={active ? "text-white" : "text-gray-500"}
                    />
                  </button>

                  {open && (
                    <div className="mt-1 space-y-1 pl-10">
                      {item.children.map((child) => {
                        const childActive = isActive(child.path);
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={[
                              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                              childActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                            ].join(" ")}>
                            <Icon
                              name={child.icon}
                              size={16}
                              className={
                                childActive ? "text-blue-700" : "text-gray-500"
                              }
                            />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="space-y-3 border-t p-4">
              <HospitalContextCard />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile bottom nav (quick access to most-used areas) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white lg:hidden">
        <div className="flex items-center justify-around py-2">
          {[
            { path: "/dashboard", label: "Home", icon: "LayoutDashboard" },
            {
              path: "/patients",
              label: "Patients",
              icon: "Users",
              requirePerm: "patient.read",
            },
            {
              path: "/appointments",
              label: "Appts",
              icon: "Calendar",
              requirePerm: "appointment.read",
            },
            {
              path: "/encounters",
              label: "Records",
              icon: "FileText",
              requirePerm: "encounter.read",
            },
            {
              path: "/billing",
              label: "Billing",
              icon: "CreditCard",
              requirePerm: "billing.invoice",
            },
          ]
            .filter((i) => !i.requirePerm || can(i.requirePerm))
            .map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                    active ? "text-blue-600" : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  <Icon name={item.icon} size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
        </div>
      </nav>
    </>
  );
};

export default NavigationSidebar;
