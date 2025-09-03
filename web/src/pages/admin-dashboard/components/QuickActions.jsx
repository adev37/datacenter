// PATH: apps/web/src/pages/admin-dashboard/components/QuickActions.jsx
import React from "react";
import { Link } from "react-router-dom";

/** Small action tile (no hover styles) */
function ActionTile({ tone = "blue", title, subtitle, to = "#" }) {
  const toneMap = {
    blue: "text-blue-700 bg-blue-50",
    green: "text-green-700 bg-green-50",
    red: "text-red-700 bg-red-50",
    amber: "text-amber-700 bg-amber-50",
    emerald: "text-emerald-700 bg-emerald-50",
  };
  const toneClass = toneMap[tone] || toneMap.blue;

  return (
    <Link to={to} className="rounded-xl border px-4 py-3">
      <div className="flex items-start gap-3">
        <span
          className={`grid h-9 w-9 place-content-center rounded-lg ${toneClass}`}>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true">
            <path d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="font-medium text-gray-900">{title}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
      </div>
    </Link>
  );
}

export default function QuickActions() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-healthcare">
      {/* Header */}
      <div className="mb-3">
        <div className="text-sm text-gray-600">Quick Actions</div>
        <div className="text-xs text-gray-500">Common tasks</div>
      </div>

      {/* Grid — 2×3, no hover */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ActionTile
          tone="blue"
          title="Register Patient"
          subtitle="Add new patient to system"
          to="/patients/new"
        />
        <ActionTile
          tone="green"
          title="Schedule Appointment"
          subtitle="Book patient appointment"
          to="/appointments?quick=true"
        />
        <ActionTile
          tone="red"
          title="Emergency Admission"
          subtitle="Quick emergency registration"
          to="/ipd/admissions?mode=emergency"
        />
        <ActionTile
          tone="amber"
          title="View Medical Records"
          subtitle="Access patient history"
          to="/encounters"
        />
        <ActionTile
          tone="blue"
          title="Generate Bill"
          subtitle="Create patient invoice"
          to="/billing/invoices"
        />
        <ActionTile
          tone="emerald"
          title="Check Inventory"
          subtitle="View stock levels"
          to="/inventory"
        />
      </div>

      {/* Footer */}
      <div className="mt-4 border-t pt-2 text-xs text-gray-500">
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-4 w-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true">
            <path d="M12 22a10 10 0 1 1 10-10 10.011 10.011 0 0 1-10 10zM11 6h2v7h-2zm0 9h2v2h-2z" />
          </svg>
          Customize Actions
        </span>
      </div>
    </div>
  );
}
