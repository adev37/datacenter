// PATH: apps/web/src/pages/admin-dashboard/components/DashboardStats.jsx
import React from "react";

// Small KPI card
function Kpi({ icon, title, value, hint, delta }) {
  const nf = new Intl.NumberFormat("en-IN");
  const deltaTone =
    delta?.tone === "negative"
      ? "text-red-600 bg-red-50"
      : delta?.tone === "positive"
      ? "text-green-600 bg-green-50"
      : "text-gray-600 bg-gray-50";

  return (
    <div
      className="
        rounded-2xl border bg-white p-5 shadow-healthcare
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-healthcare-lg
        hover:ring-1 hover:ring-blue-100
      ">
      <div className="flex items-start justify-between">
        <div className="mt-0.5 text-blue-600">{icon}</div>
        {delta?.value && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${deltaTone}`}>
            {delta.value}
          </span>
        )}
      </div>

      <div className="mt-2 text-2xl font-semibold leading-7">
        {typeof value === "number" ? nf.format(value) : value}
      </div>

      {hint && <div className="mt-1 text-sm text-gray-600">{hint}</div>}
    </div>
  );
}

const I = {
  users: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 1a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2a6 6 0 0 0-6 6h4a4 4 0 0 1 4-4h2a6 6 0 0 0-4-2Zm8 0a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6Z" />
    </svg>
  ),
  calendar: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <path d="M7 2h2v3h6V2h2v3h3v17H4V5h3zM6 10h12v9H6z" />
    </svg>
  ),
  ops: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <path d="M12 3l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-7.5L2 10h7z" />
    </svg>
  ),
  alert: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi
        icon={I.users}
        title="Total Patients"
        value={totalPatients}
        hint="Active in system"
        delta={{ value: "+3%", tone: "positive" }}
      />
      <Kpi
        icon={I.calendar}
        title="Appointments"
        value={appointmentsToday}
        hint="Scheduled today"
        delta={{ value: "-8%", tone: "negative" }}
      />
      <Kpi
        icon={I.ops}
        title="Operations"
        value={operationsToday}
        hint="Scheduled today"
        delta={{ value: "+5%", tone: "positive" }}
      />
      <Kpi
        icon={I.alert}
        title="Critical Alerts"
        value={criticalAlerts}
        hint="Require attention"
        delta={{ value: "+18%", tone: "positive" }}
      />
    </div>
  );
}
