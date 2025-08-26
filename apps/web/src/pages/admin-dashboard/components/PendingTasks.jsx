// apps/web/src/pages/admin-dashboard/components/PendingTasks.jsx
import React from "react";

function Task({ label, who, eta }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm">{label}</div>
        <div className="text-xs text-gray-500">{who}</div>
      </div>
      <div className="text-xs text-gray-600">{eta}</div>
    </div>
  );
}

export default function PendingTasks() {
  const tasks = [
    { label: "Sign off lab results (5)", who: "Dr. Williams", eta: "Today" },
    { label: "Approve refunds (2)", who: "Cashier Desk", eta: "Today" },
    { label: "Stock reconciliation", who: "Pharmacy", eta: "Tomorrow" },
  ];

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="font-semibold mb-2">Pending Tasks</div>
      <div className="divide-y">
        {tasks.map((t, i) => (
          <Task key={i} {...t} />
        ))}
      </div>
    </div>
  );
}
