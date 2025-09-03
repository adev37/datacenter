// PATH: apps/web/src/pages/admin-dashboard/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import DashboardStats from "./components/DashboardStats";
import ContentOverview from "./components/ContentOverview";
import RecentActivity from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";
import SystemStatus from "./components/SystemStatus";
import PendingTasks from "./components/PendingTasks";

// --- Local helpers (India time + friendly formatting) ---
function useIndiaClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);
  const fmt = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);

  const timeFmt = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return { dateLabel: fmt, timeLabel: timeFmt };
}

export default function AdminDashboard() {
  const { dateLabel, timeLabel } = useIndiaClock();
  const locationLabel = useMemo(
    () => import.meta.env.VITE_DASHBOARD_LOCATION ?? "New Delhi, IN",
    []
  );

  return (
    <>
      {/* Top breadcrumb */}
      <div className="mb-4">
        <NavigationBreadcrumb />
      </div>

      {/* Page header */}
      <header className="mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here’s what’s happening today.
            </p>
          </div>

          {/* Right-side: date/time (IST) + location */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8a4 4 0 104 4 4 4 0 00-4-4zm0-6a10 10 0 1010 10A10 10 0 0012 2z" />
              </svg>
              <span className="whitespace-nowrap">{dateLabel}</span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap hidden sm:inline">
                {timeLabel} IST
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z" />
              </svg>
              <span className="whitespace-nowrap">{locationLabel}</span>
            </div>
          </div>
        </div>
      </header>

      {/* KPI cards (top row) */}
      <DashboardStats />

      {/* Main content rows */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left: queue + occupancy */}
        <div className="space-y-4 xl:col-span-2">
          <ContentOverview />
        </div>

        {/* Right: status & recent activity */}
        <div className="space-y-4">
          <RecentActivity />
          <SystemStatus />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <PendingTasks />
      </div>
    </>
  );
}
