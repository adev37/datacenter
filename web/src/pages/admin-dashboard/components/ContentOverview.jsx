// PATH: apps/web/src/pages/admin-dashboard/components/ContentOverview.jsx
import React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Icon from "@/components/AppIcon";

/* ───────────────────────────── Helpers ───────────────────────────── */

const toneToBar = {
  red: "bg-red-600",
  amber: "bg-amber-500",
  green: "bg-green-600",
  blue: "bg-blue-600",
};

function StatusBadge({ status }) {
  const map = {
    waiting: "bg-gray-100 text-gray-700",
    "in progress": "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
        map[status] || map.waiting
      }`}>
      {status}
    </span>
  );
}

function ProgressBar({ pct, tone = "blue" }) {
  const cls = toneToBar[tone] || toneToBar.blue;
  const width = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-2 rounded-full ${cls}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/* ───────────────────────── Patient Queue ────────────────────────── */

function QueueItem({ token, name, dept, time, status }) {
  return (
    <div className="flex items-start justify-between py-3">
      <div className="min-w-0">
        <Link to="/appointments" className="font-medium text-blue-700">
          {token}
        </Link>
        <div className="text-sm font-medium text-gray-900">{name}</div>
        <div className="text-xs text-gray-500">{dept}</div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <div className="text-xs text-gray-500">{time}</div>
          <div className="mt-1 text-right">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Green kebab without hover shadow change */}
        <Button
          variant="success"
          size="icon"
          shape="xl"
          aria-label="More actions"
          title="More"
          className="shadow-healthcare"
          iconName="MoreVertical"
        />
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
    <div className="h-full rounded-2xl border bg-white p-4 shadow-healthcare">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Users" size={16} className="text-blue-600" />
          <div className="font-semibold">Patient Queue</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" shape="xl" iconName="RefreshCw">
            Refresh
          </Button>
        </div>
      </div>

      <div className="divide-y">
        {list.map((it) => (
          <QueueItem key={it.token} {...it} />
        ))}
      </div>

      <div className="mt-3 text-sm text-blue-700">
        <Link to="/appointments">View All Appointments →</Link>
      </div>
    </div>
  );
}

/* ──────────────────────── Bed Occupancy ─────────────────────────── */

function BedRow({ label, occupied, total, tone }) {
  const pct = Math.round((occupied / total) * 100);
  const toneCls = toneToBar[tone] || toneToBar.blue;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${toneCls}`}>
            {pct}%
          </span>
          <span className="text-sm font-medium text-gray-900">{label}</span>
        </div>
        <div className="text-xs text-gray-600">
          {occupied}/{total} beds
        </div>
      </div>

      <ProgressBar pct={pct} tone={tone} />

      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>
          Occupied: <span className="font-medium">{occupied}</span>
        </span>
        <span>
          Available: <span className="font-medium">{total - occupied}</span>
        </span>
      </div>
    </div>
  );
}

function BedOccupancyCard() {
  return (
    <div className="h-full rounded-2xl border bg-white p-4 shadow-healthcare">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="font-semibold">Bed Occupancy</div>
          <div className="text-xs text-gray-500">Real-time availability</div>
        </div>
        <Button variant="outline" size="sm" shape="xl" asChild>
          <Link to="/ipd/bedboard">
            <Icon name="Eye" size={14} className="mr-2" />
            View All
          </Link>
        </Button>
      </div>

      <div className="space-y-5">
        <BedRow label="ICU" occupied={18} total={20} tone="red" />
        <BedRow label="General Ward" occupied={35} total={50} tone="amber" />
        <BedRow label="Private Rooms" occupied={12} total={25} tone="green" />
        <BedRow label="Emergency" occupied={8} total={15} tone="blue" />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button variant="outline" size="sm" shape="xl" iconName="Plus" asChild>
          <Link to="/ipd/admissions">Admit Patient</Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          shape="xl"
          iconName="LogOut"
          asChild>
          <Link to="/ipd/bedboard">Discharge</Link>
        </Button>
      </div>
    </div>
  );
}

/* ──────────────────────── Export (2-up grid) ─────────────────────── */

export default function ContentOverview() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PatientQueueCard />
      <BedOccupancyCard />
    </div>
  );
}
