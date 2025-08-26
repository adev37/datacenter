// apps/web/src/pages/admin-dashboard/components/ContentOverview.jsx
import React from "react";
import { Link } from "react-router-dom";

function QueueItem({ token, name, dept, time, status }) {
  const badge =
    status === "waiting"
      ? "bg-gray-100 text-gray-700"
      : status === "in progress"
      ? "bg-orange-100 text-orange-800"
      : "bg-green-100 text-green-700";

  return (
    <div className="flex items-start justify-between py-2">
      <div>
        <Link className="text-blue-700 font-medium" to="#">
          {token}
        </Link>
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-gray-500">{dept}</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-500">{time}</div>
        <div
          className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${badge}`}>
          {status}
        </div>
      </div>
    </div>
  );
}

function PatientQueueCard() {
  const list = [
    {
      token: "T001",
      name: "Sarah Johnson",
      dept: "Cardiology",
      time: "09:00 AM",
      status: "waiting",
    },
    {
      token: "T002",
      name: "Michael Chen",
      dept: "Emergency",
      time: "09:15 AM",
      status: "in progress",
    },
    {
      token: "T003",
      name: "Emily Davis",
      dept: "General Medicine",
      time: "09:30 AM",
      status: "waiting",
    },
    {
      token: "T004",
      name: "Robert Wilson",
      dept: "Orthopedics",
      time: "09:45 AM",
      status: "waiting",
    },
  ];

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Patient Queue</div>
        <button className="text-sm text-gray-600 hover:text-gray-900">
          Refresh
        </button>
      </div>
      <div className="divide-y">
        {list.map((it) => (
          <QueueItem key={it.token} {...it} />
        ))}
      </div>
      <div className="mt-3 text-sm text-blue-700">
        <Link to="#">View All Appointments →</Link>
      </div>
    </div>
  );
}

function Bar({ label, used, total, color = "bg-blue-600" }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-gray-600">
          {used}/{total} beds
        </div>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function BedOccupancyCard() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold">Bed Occupancy</div>
          <div className="text-xs text-gray-500">Real-time availability</div>
        </div>
        <button className="text-sm text-gray-600 hover:text-gray-900">
          View All
        </button>
      </div>
      <div className="space-y-4">
        <Bar label="ICU" used={18} total={20} color="bg-red-600" />
        <Bar label="General Ward" used={35} total={50} color="bg-amber-500" />
        <Bar label="Private Rooms" used={12} total={25} color="bg-green-600" />
        <Bar label="Emergency" used={8} total={15} color="bg-blue-600" />
      </div>
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-600">
        <div>
          Occupied: <span className="font-medium">73</span>
        </div>
        <div>
          Available: <span className="font-medium">37</span>
        </div>
      </div>
    </div>
  );
}

export default function ContentOverview() {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <PatientQueueCard />
      <BedOccupancyCard />
    </div>
  );
}
