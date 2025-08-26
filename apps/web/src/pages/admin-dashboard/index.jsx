// apps/web/src/pages/admin-dashboard/index.jsx
import React from "react";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import DashboardStats from "./components/DashboardStats";
import ContentOverview from "./components/ContentOverview";
import RecentActivity from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";
import SystemStatus from "./components/SystemStatus";
import PendingTasks from "./components/PendingTasks";

export default function AdminDashboard() {
  return (
    <>
      <div className="mb-4">
        <NavigationBreadcrumb />
      </div>

      <header className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here’s what’s happening today.
        </p>
      </header>

      <DashboardStats />

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3 mt-6">
        <div className="xl:col-span-2 space-y-4">
          <ContentOverview />
        </div>
        <div className="space-y-4">
          <RecentActivity />
          <SystemStatus />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <PendingTasks />
      </div>
    </>
  );
}
