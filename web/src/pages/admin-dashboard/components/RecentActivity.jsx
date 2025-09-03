// PATH: apps/web/src/pages/admin-dashboard/components/RecentActivity.jsx
import React from "react";
import { Link } from "react-router-dom";

/* Inline icons to keep the component portable */
const I = {
  pulse: (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <path d="M13 3l-3 7H4l6 6 3-7h6l-6-6z" />
    </svg>
  ),
  lab: (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <path d="M9 2h6v2l3 5v10a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V9l3-5V2zm1.5 7h3L13 6h-2l-.5 3z" />
    </svg>
  ),
  rx: (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <path d="M5 3h8a4 4 0 0 1 0 8H9l6 7h-3l-6-7H5v7H3V3h2zm2 2v4h6a2 2 0 1 0 0-4H7z" />
    </svg>
  ),
  calendar: (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <path d="M7 2h2v3h6V2h2v3h3v17H4V5h3zM6 10h12v9H6z" />
    </svg>
  ),
};

function Row({ icon, title, meta, to }) {
  const content = (
    <>
      <div className="mt-0.5 text-gray-500" aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm text-gray-900">{title}</div>
        <div className="text-xs text-gray-500">{meta}</div>
      </div>
    </>
  );

  return to ? (
    <Link
      to={to}
      className="flex items-start gap-3 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      {content}
    </Link>
  ) : (
    <div className="flex items-start gap-3 py-2">{content}</div>
  );
}

export default function RecentActivity() {
  // Mapped to existing routes from your RoutesApp:
  const items = [
    {
      icon: <span className="text-emerald-600">{I.pulse}</span>,
      title: "New patient admitted to ICU – John Smith (MRN: 12345)",
      meta: "Dr. Sarah Wilson • 2 minutes ago",
      to: "/ipd/admissions",
    },
    {
      icon: <span className="text-blue-600">{I.lab}</span>,
      title: "Lab results ready – Patient ID: 67890 • Blood Test Complete",
      meta: "Lab Tech Mike • 5 minutes ago",
      to: "/lab/results",
    },
    {
      icon: <span className="text-amber-600">{I.rx}</span>,
      title: "Prescription updated – María Garcia • Medication dosage adjusted",
      meta: "Dr. James Brown • 8 minutes ago",
      to: "/encounters/prescriptions",
    },
    {
      icon: <span className="text-red-600">{I.calendar}</span>,
      title: "Emergency appointment scheduled – Robert Johnson at 10:30 AM",
      meta: "Reception Staff • 12 minutes ago",
      to: "/appointments",
    },
  ];

  return (
    <div className="h-full rounded-xl border bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="font-semibold">Recent Activity</div>
          <div className="text-xs text-gray-500">Live hospital updates</div>
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-green-600">
          <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
          Live
        </span>
      </div>

      {/* Scrollable list */}
      <div
        className="max-h-64 overflow-y-auto"
        role="list"
        aria-label="Recent activity">
        <div className="divide-y">
          {items.map((it, idx) => (
            <Row key={idx} {...it} />
          ))}
        </div>
      </div>

      {/* Footer link — route exists */}
      <div className="mt-3 text-sm text-blue-700">
        <Link to="/dashboard?panel=activity">View All Activities →</Link>
      </div>
    </div>
  );
}
