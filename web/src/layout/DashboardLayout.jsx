// apps/web/src/layout/DashboardLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import GlobalHeader from "../components/ui/GlobalHeader";
import NavigationSidebar from "../components/ui/NavigationSidebar";
import QuickActionPanel from "../components/ui/QuickActionPanel";
import ErrorBoundary from "../components/ErrorBoundary";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar:collapsed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  const headerOffset = "pt-16";
  const sidebarOffset = collapsed ? "lg:pl-16" : "lg:pl-72";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader onSidebarToggle={() => setCollapsed((v) => !v)} />
      <NavigationSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />

      <div className={`${headerOffset} ${sidebarOffset}`}>
        <main className="min-h-[calc(100vh-4rem)]">
          <div className="mx-auto max-w-[1400px] px-6 py-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <QuickActionPanel />
    </div>
  );
}
