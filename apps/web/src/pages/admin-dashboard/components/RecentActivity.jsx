// apps/web/src/pages/admin-dashboard/components/RecentActivity.jsx
import React from "react";

function Row({ icon, title, meta }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="text-gray-500 mt-0.5">{icon}</div>
      <div>
        <div className="text-sm">{title}</div>
        <div className="text-xs text-gray-500">{meta}</div>
      </div>
    </div>
  );
}

const I = {
  calendar: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2h2v3h6V2h2v3h3v17H4V5h3zM6 10h12v9H6z" />
    </svg>
  ),
  user: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-9 9a9 9 0 0 1 18 0z" />
    </svg>
  ),
  bill: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 2h14a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2-4-2V4a2 2 0 0 1 2-2z" />
    </svg>
  ),
};

export default function RecentActivity() {
  const items = [
    {
      icon: I.calendar,
      title: "Emergency appointment scheduled – Robert Johnson at 10:30 AM",
      meta: "Reception • 12 minutes ago",
    },
    {
      icon: I.user,
      title: "Patient discharged – Emily Davis (MRN: 54321)",
      meta: "Dr. Lisa Chen • 15 minutes ago",
    },
    {
      icon: I.bill,
      title: "Invoice generated – Patient ID: 98765 • $2,450.00",
      meta: "Billing Dept • 18 minutes ago",
    },
  ];

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold">Recent Activity</div>
          <div className="text-xs text-gray-500">Live hospital updates</div>
        </div>
        <span className="text-xs text-green-600">● Live</span>
      </div>
      <div className="divide-y">
        {items.map((it, idx) => (
          <Row key={idx} {...it} />
        ))}
      </div>
      <div className="mt-3 text-sm text-blue-700">View All Activities →</div>
    </div>
  );
}
