// src/components/ui/NavigationSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "./Button";
import HospitalContextCard from "./HospitalContextCard"; // NEW

const NavigationSidebar = ({ collapsed = false, onCollapsedChange }) => {
  const location = useLocation();
  const isActive = (base) =>
    location?.pathname === base || location?.pathname.startsWith(`${base}/`);

  const items = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "LayoutDashboard",
      description: "Overview and metrics",
    },
    {
      label: "Patients",
      path: "/patients",
      icon: "UserPlus",
      description: "Register & manage patients",
    },
    {
      label: "Appointments",
      path: "/appointments",
      icon: "Calendar",
      description: "Schedule and manage",
    },
    {
      label: "Medical Records",
      path: "/encounters",
      icon: "FileText",
      description: "Encounters & notes",
    },
    {
      label: "Billing",
      path: "/billing",
      icon: "CreditCard",
      description: "Invoices & payments",
    },
    {
      label: "Inventory",
      path: "/inventory",
      icon: "Package",
      description: "Supplies & equipment",
    },
  ];

  const toggleCollapsed = () => {
    const next = !collapsed;
    try {
      localStorage.setItem("sidebar:collapsed", next ? "1" : "0");
    } catch {}
    onCollapsedChange?.(next);
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 hidden lg:block bg-white border-r transition-all ${
          collapsed ? "w-16" : "w-72"
        }`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="w-full justify-center">
              <Icon
                name={collapsed ? "ChevronRight" : "ChevronLeft"}
                size={20}
              />
            </Button>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {items.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={[
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group",
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
                      <p className="font-medium truncate">{item.label}</p>
                      <p
                        className={[
                          "text-xs truncate",
                          active ? "text-white/90" : "text-gray-500",
                        ].join(" ")}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="p-4 border-t space-y-3">
              {/* === NEW: Hospital/Branch & Role card === */}
              <HospitalContextCard />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile bottom nav — same active/hover behavior */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t lg:hidden">
        <div className="flex items-center justify-around py-2">
          {items.slice(0, 5).map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  active ? "text-blue-600" : "text-gray-500 hover:bg-gray-100"
                }`}>
                <Icon name={item.icon} size={20} />
                <span className="text-xs font-medium">
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default NavigationSidebar;
