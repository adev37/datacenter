// apps/web/src/pages/admin-dashboard/components/DashboardStats.jsx
import React from "react";

function Kpi({ icon, title, value, hint }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-blue-600">{icon}</div>
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-semibold leading-7">{value}</div>
          {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
        </div>
      </div>
    </div>
  );
}

const I = {
  users: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 1a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2a6 6 0 0 0-6 6h4a4 4 0 0 1 4-4h2a6 6 0 0 0-4-2Zm8 0a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6Z" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2h2v3h6V2h2v3h3v17H4V5h3zM6 10h12v9H6z" />
    </svg>
  ),
  ops: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-7.5L2 10h7z" />
    </svg>
  ),
  alert: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-8h-2v6h2V10z" />
    </svg>
  ),
};

export default function DashboardStats({
  totalPatients = 1247,
  appointmentsToday = 89,
  operationsToday = 12,
  criticalAlerts = 3,
}) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi
        icon={I.users}
        title="Total Patients"
        value={totalPatients}
        hint="Active in system"
      />
      <Kpi
        icon={I.calendar}
        title="Appointments"
        value={appointmentsToday}
        hint="Scheduled today"
      />
      <Kpi
        icon={I.ops}
        title="Operations"
        value={operationsToday}
        hint="Scheduled today"
      />
      <Kpi
        icon={I.alert}
        title="Critical Alerts"
        value={criticalAlerts}
        hint="Require attention"
      />
    </div>
  );
}
