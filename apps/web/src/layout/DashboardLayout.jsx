// src/layout/DashboardLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import GlobalHeader from "../components/ui/GlobalHeader";
import NavigationSidebar from "../components/ui/NavigationSidebar";
import QuickActionPanel from "../components/ui/QuickActionPanel";
import { OrgProvider } from "@/state/orgContext"; // <-- add

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar:collapsed") === "1";
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  const headerOffset = "pt-16";
  const sidebarOffset = collapsed ? "lg:pl-16" : "lg:pl-72";

  return (
    <OrgProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <GlobalHeader
          sidebarCollapsed={collapsed}
          onSidebarToggle={() => setCollapsed((v) => !v)}
        />
        <NavigationSidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
        <div className={`${headerOffset} ${sidebarOffset}`}>
          <main className="min-h-[calc(100vh-4rem)]">
            <div className="mx-auto max-w-7xl px-4 py-6">
              <Outlet />
            </div>
          </main>
        </div>
        <QuickActionPanel />
      </div>
    </OrgProvider>
  );
}
