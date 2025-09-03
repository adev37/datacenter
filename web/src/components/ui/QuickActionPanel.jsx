// apps/web/src/components/ui/QuickActionPanel.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "./Button";
import usePermChecker from "@/hooks/usePermChecker";

/**
 * QuickActionPanel
 * - Adds `requirePerm` to each quick action.
 * - Filters using usePermChecker() so SUPER_ADMIN bypasses.
 */
export default function QuickActionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const can = usePermChecker();

  const btnColor = {
    error: "bg-error text-error-foreground hover:bg-error/90",
    warning: "bg-warning text-warning-foreground hover:bg-warning/90",
    success: "bg-success text-success-foreground hover:bg-success/90",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  };

  const iconColor = {
    error: "text-error",
    warning: "text-warning",
    success: "text-success",
    accent: "text-accent",
    primary: "text-primary",
  };

  const baseActions = useMemo(
    () => [
      {
        id: "emergency-registration",
        label: "Emergency Registration",
        icon: "AlertTriangle",
        color: "error",
        run: () => navigate("/patients?emergency=true"),
        requirePerm: "patient.write",
      },
      {
        id: "quick-appointment",
        label: "Quick Appointment",
        icon: "Clock",
        color: "warning",
        run: () => navigate("/appointments?quick=true"),
        requirePerm: "appointment.write",
      },
    ],
    [navigate]
  );

  const actions = useMemo(() => {
    const filterAllowed = (arr) =>
      arr.filter((a) => !a.requirePerm || can(a.requirePerm));

    switch (true) {
      case location.pathname.startsWith("/dashboard"):
        return filterAllowed([
          ...baseActions,
          {
            id: "system-alerts",
            label: "System Alerts",
            icon: "Bell",
            color: "primary",
            run: () => navigate("/notifications"),
            requirePerm: "notifications.read",
          },
          {
            id: "latest-reports",
            label: "Latest Reports",
            icon: "BarChart3",
            color: "accent",
            run: () => navigate("/reports/finance"),
            requirePerm: "reports.finance",
          },
        ]);
      case location.pathname.startsWith("/patients"):
        return filterAllowed([
          ...baseActions,
          {
            id: "new-patient",
            label: "New Patient",
            icon: "UserPlus",
            color: "success",
            run: () => navigate("/patients/new"),
            requirePerm: "patient.write",
          },
          {
            id: "bulk-import",
            label: "Bulk Import",
            icon: "Upload",
            color: "accent",
            run: () => console.log("Open bulk import"),
            requirePerm: "patient.write",
          },
          {
            id: "portal",
            label: "Open Portal",
            icon: "DoorOpen",
            color: "primary",
            run: () => navigate("/portal/patient"),
            requirePerm: "patient.read",
          },
        ]);
      case location.pathname.startsWith("/appointments"):
        return filterAllowed([
          ...baseActions,
          {
            id: "calendar-view",
            label: "Calendar View",
            icon: "Calendar",
            color: "primary",
            run: () => navigate("/appointments/calendar"),
            requirePerm: "appointment.read",
          },
        ]);
      case location.pathname.startsWith("/encounters"):
        return filterAllowed([
          ...baseActions,
          {
            id: "start-encounter",
            label: "Start Encounter",
            icon: "PlayCircle",
            color: "success",
            run: () => navigate("/encounters"),
            requirePerm: "encounter.read",
          },
          {
            id: "new-soap",
            label: "New SOAP Note",
            icon: "FilePen",
            color: "accent",
            run: () => navigate("/encounters/soap"),
            requirePerm: "encounter.write",
          },
          {
            id: "add-vitals",
            label: "Add Vitals",
            icon: "Activity",
            color: "primary",
            run: () => navigate("/encounters/vitals"),
            requirePerm: "vitals.write",
          },
        ]);
      case location.pathname.startsWith("/lab"):
        return filterAllowed([
          ...baseActions,
          {
            id: "new-lab-order",
            label: "New Lab Order",
            icon: "ClipboardPlus",
            color: "success",
            run: () => navigate("/lab"),
            requirePerm: "lab.order",
          },
          {
            id: "collect-sample",
            label: "Collect Sample",
            icon: "TestTube2",
            color: "primary",
            run: () => navigate("/lab/samples"),
            requirePerm: "lab.result",
          },
        ]);
      case location.pathname.startsWith("/radiology"):
        return filterAllowed([
          ...baseActions,
          {
            id: "new-rad-order",
            label: "New RAD Order",
            icon: "ClipboardPlus",
            color: "success",
            run: () => navigate("/radiology"),
            requirePerm: "rad.order",
          },
          {
            id: "open-viewer",
            label: "Open Viewer",
            icon: "Monitor",
            color: "primary",
            run: () => navigate("/radiology/viewer"),
            requirePerm: "rad.report",
          },
        ]);
      case location.pathname.startsWith("/pharmacy"):
        return filterAllowed([
          ...baseActions,
          {
            id: "dispense",
            label: "Dispense",
            icon: "PackageOpen",
            color: "success",
            run: () => navigate("/pharmacy"),
            requirePerm: "pharmacy.dispense",
          },
        ]);
      case location.pathname.startsWith("/ipd"):
        return filterAllowed([
          ...baseActions,
          {
            id: "admit-patient",
            label: "Admit Patient",
            icon: "ClipboardPlus",
            color: "success",
            run: () => navigate("/ipd/admissions"),
            requirePerm: "ipd.admit",
          },
          {
            id: "bed-board",
            label: "Bed Board",
            icon: "Grid",
            color: "primary",
            run: () => navigate("/ipd/bedboard"),
            requirePerm: "ipd.admit",
          },
          {
            id: "open-emar",
            label: "Open eMAR",
            icon: "Syringe",
            color: "accent",
            run: () => navigate("/ipd/emar"),
            requirePerm: "emar.administer",
          },
        ]);
      case location.pathname.startsWith("/billing"):
        return filterAllowed([
          ...baseActions,
          {
            id: "generate-invoice",
            label: "Generate Invoice",
            icon: "Receipt",
            color: "success",
            run: () => navigate("/billing/invoices"),
            requirePerm: "billing.invoice",
          },
          {
            id: "record-payment",
            label: "Record Payment",
            icon: "Banknote",
            color: "primary",
            run: () => navigate("/billing/payments"),
            requirePerm: "billing.payment",
          },
        ]);
      case location.pathname.startsWith("/inventory"):
        return filterAllowed([
          ...baseActions,
          {
            id: "add-item",
            label: "Add Item",
            icon: "Box",
            color: "success",
            run: () => navigate("/inventory/items"),
            requirePerm: "inv.item",
          },
          {
            id: "new-grn",
            label: "New GRN",
            icon: "FilePlus2",
            color: "primary",
            run: () => navigate("/inventory/grn"),
            requirePerm: "inv.grn",
          },
          {
            id: "stock-transfer",
            label: "Stock Transfer",
            icon: "ArrowLeftRight",
            color: "accent",
            run: () => navigate("/inventory/transfer"),
            requirePerm: "inv.transfer",
          },
          {
            id: "stock-alerts",
            label: "Stock Alerts",
            icon: "Bell",
            color: "warning",
            run: () => console.log("Show stock alerts"),
            requirePerm: "inv.ledger",
          },
        ]);
      case location.pathname.startsWith("/reports"):
        return filterAllowed([
          ...baseActions,
          {
            id: "finance",
            label: "Finance",
            icon: "LineChart",
            color: "primary",
            run: () => navigate("/reports/finance"),
            requirePerm: "reports.finance",
          },
          {
            id: "clinical",
            label: "Clinical",
            icon: "Stethoscope",
            color: "accent",
            run: () => navigate("/reports/clinical"),
            requirePerm: "reports.clinical",
          },
          {
            id: "inventory",
            label: "Inventory",
            icon: "PieChart",
            color: "success",
            run: () => navigate("/reports/inventory"),
            requirePerm: "reports.inventory",
          },
        ]);
      case location.pathname.startsWith("/settings"):
        return filterAllowed([
          ...baseActions,
          {
            id: "user-mgmt",
            label: "User Management",
            icon: "Users",
            color: "primary",
            run: () => navigate("/settings/user-management"),
            requirePerm: "settings.user",
          },
          {
            id: "roles",
            label: "Role Permissions",
            icon: "ShieldCheck",
            color: "accent",
            run: () => navigate("/settings/role-permissions"),
            requirePerm: "settings.role",
          },
          {
            id: "preferences",
            label: "Preferences",
            icon: "SlidersHorizontal",
            color: "success",
            run: () => navigate("/settings/preferences"),
            requirePerm: "settings.preferences",
          },
        ]);
      case location.pathname.startsWith("/staff"):
        return filterAllowed([
          ...baseActions,
          {
            id: "doctors",
            label: "Doctors",
            icon: "UserRound",
            color: "primary",
            run: () => navigate("/staff/doctors"),
            requirePerm: "staff.read",
          },
          {
            id: "nurses",
            label: "Nurses",
            icon: "UserRound",
            color: "accent",
            run: () => navigate("/staff/nurses"),
            requirePerm: "staff.read",
          },
          {
            id: "schedules",
            label: "Schedules",
            icon: "CalendarCog",
            color: "success",
            run: () => navigate("/staff/schedules"),
            requirePerm: "staff.schedule",
          },
        ]);
      default:
        return filterAllowed(baseActions);
    }
  }, [location.pathname, navigate, baseActions, can]);

  const handleActionClick = (a) => {
    a?.run?.();
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop panel */}
      <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
        <div className="relative">
          {isOpen && (
            <div className="absolute bottom-16 right-0 space-y-3">
              {actions.map((a, idx) => (
                <div
                  key={a.id}
                  className="flex items-center justify-end space-x-3"
                  style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="rounded-lg border border-border bg-popover px-3 py-2 healthcare-shadow">
                    <span className="whitespace-nowrap text-sm font-medium text-text-primary">
                      {a.label}
                    </span>
                  </div>

                  <Button
                    size="icon"
                    shape="full"
                    onClick={() => handleActionClick(a)}
                    className={`h-12 w-12 healthcare-shadow ${
                      btnColor[a.color] || btnColor.primary
                    }`}
                    aria-label={a.label}>
                    <Icon name={a.icon} size={20} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Main FAB */}
          <Button
            size="icon"
            shape="full"
            onClick={() => setIsOpen((s) => !s)}
            aria-expanded={isOpen}
            aria-label="Quick actions"
            className={`h-14 w-14 bg-primary text-primary-foreground hover:bg-primary/90 healthcare-shadow transition-transform ${
              isOpen ? "rotate-45" : ""
            }`}>
            <Icon name="Plus" size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile overlay + actions */}
      <div className="lg:hidden">
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}>
            <div
              className="absolute bottom-20 left-4 right-4 animate-slide-in rounded-lg border border-border bg-popover healthcare-shadow"
              onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <h3 className="mb-4 font-medium text-text-primary">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {actions.map((a) => (
                    <Button
                      key={a.id}
                      variant="outline"
                      shape="lg"
                      onClick={() => handleActionClick(a)}
                      className="h-auto flex-col items-center space-y-2 py-4">
                      <Icon
                        name={a.icon}
                        size={24}
                        className={iconColor[a.color] || iconColor.primary}
                      />
                      <span className="text-center text-xs">{a.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile FAB */}
        <Button
          size="icon"
          shape="full"
          onClick={() => setIsOpen((s) => !s)}
          aria-expanded={isOpen}
          aria-label="Quick actions"
          className="fixed bottom-20 right-4 z-50 h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90 healthcare-shadow">
          <Icon name="Plus" size={20} />
        </Button>
      </div>
    </>
  );
}
