import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "./Button";

const QuickActionPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getContextualActions = () => {
    const baseActions = [
      {
        id: "emergency-registration",
        label: "Emergency Registration",
        icon: "AlertTriangle",
        color: "error",
        action: () => navigate("/patients?emergency=true"),
      },
      {
        id: "quick-appointment",
        label: "Quick Appointment",
        icon: "Clock",
        color: "warning",
        action: () => navigate("/appointments?quick=true"),
      },
    ];

    // Add context-specific actions based on current route
    switch (location?.pathname) {
      case "/dashboard":
        return [
          ...baseActions,
          {
            id: "system-alerts",
            label: "System Alerts",
            icon: "Bell",
            color: "primary",
            action: () => console.log("Show system alerts"),
          },
        ];

      case "/patients":
        return [
          ...baseActions,
          {
            id: "bulk-import",
            label: "Bulk Import",
            icon: "Upload",
            color: "accent",
            action: () => console.log("Open bulk import"),
          },
        ];

      case "/appointments":
        return [
          ...baseActions,
          {
            id: "calendar-view",
            label: "Calendar View",
            icon: "Calendar",
            color: "primary",
            action: () => navigate("/appointments/calendar"),
          },
        ];

      case "/encounters":
        return [
          ...baseActions,
          {
            id: "new-record",
            label: "New Record",
            icon: "FileText",
            color: "accent",
            action: () => navigate("/encounters/soap"),
          },
        ];

      case "/billing":
        return [
          ...baseActions,
          {
            id: "generate-invoice",
            label: "Generate Invoice",
            icon: "Receipt",
            color: "success",
            action: () => navigate("/billing/invoices"),
          },
        ];

      case "/inventory":
        return [
          ...baseActions,
          {
            id: "stock-alert",
            label: "Stock Alerts",
            icon: "Package",
            color: "warning",
            action: () => console.log("Show stock alerts"),
          },
        ];

      default:
        return baseActions;
    }
  };

  const actions = getContextualActions();

  const handleActionClick = (action) => {
    action?.action();
    setIsOpen(false);
  };

  const getColorClasses = (color) => {
    switch (color) {
      case "error":
        return "bg-error text-error-foreground hover:bg-error/90";
      case "warning":
        return "bg-warning text-warning-foreground hover:bg-warning/90";
      case "success":
        return "bg-success text-success-foreground hover:bg-success/90";
      case "accent":
        return "bg-accent text-accent-foreground hover:bg-accent/90";
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/90";
    }
  };

  return (
    <>
      {/* Desktop Quick Action Panel */}
      <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
        <div className="relative">
          {/* Action Items */}
          {isOpen && (
            <div className="absolute bottom-16 right-0 space-y-3 animate-slide-in">
              {actions?.map((action, index) => (
                <div
                  key={action?.id}
                  className="flex items-center justify-end space-x-3"
                  style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="bg-popover border border-border rounded-lg px-3 py-2 healthcare-shadow">
                    <span className="text-sm font-medium text-text-primary whitespace-nowrap">
                      {action?.label}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    onClick={() => handleActionClick(action)}
                    className={`w-12 h-12 rounded-full healthcare-shadow ${getColorClasses(
                      action?.color
                    )}`}
                    aria-label={action?.label}>
                    <Icon name={action?.icon} size={20} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Main FAB */}
          <Button
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 healthcare-shadow healthcare-transition ${
              isOpen ? "rotate-45" : ""
            }`}
            aria-label="Quick actions">
            <Icon name="Plus" size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile Quick Actions - Integrated with bottom navigation */}
      <div className="lg:hidden">
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}>
            <div className="absolute bottom-20 left-4 right-4 bg-popover rounded-lg border border-border healthcare-shadow animate-slide-in">
              <div className="p-4">
                <h3 className="font-medium text-text-primary mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {actions?.map((action) => (
                    <Button
                      key={action?.id}
                      variant="outline"
                      onClick={() => handleActionClick(action)}
                      className="flex flex-col items-center space-y-2 h-auto py-4">
                      <Icon
                        name={action?.icon}
                        size={24}
                        className={`text-${action?.color}`}
                      />
                      <span className="text-xs text-center">
                        {action?.label}
                      </span>
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
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 healthcare-shadow"
          aria-label="Quick actions">
          <Icon name="Plus" size={20} />
        </Button>
      </div>
    </>
  );
};

export default QuickActionPanel;
