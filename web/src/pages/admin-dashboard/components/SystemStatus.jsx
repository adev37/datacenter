// PATH: apps/web/src/pages/admin-dashboard/components/SystemStatus.jsx
import React from "react";

/**
 * SystemStatus
 * - Clean card (no hover effects) with subtle healthcare shadow.
 * - Indian number formatting for counts.
 * - Tone color for serverLoad (Normal/Elevated/High).
 */
export default function SystemStatus({
  statusText = "All systems operational",
  activeUsers = 247,
  serverLoad = "Normal",
  uptime = "99.98%",
  className = "",
}) {
  const nf = new Intl.NumberFormat("en-IN");

  const loadTone =
    serverLoad?.toLowerCase() === "high"
      ? "text-red-600"
      : serverLoad?.toLowerCase() === "elevated"
      ? "text-amber-600"
      : "text-green-600";

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-healthcare ${className}`}>
      <div className="text-sm text-gray-600">System Status</div>

      <div
        className="mt-1 inline-flex items-center gap-2 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
        aria-live="polite">
        <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
        {statusText}
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Active Users</span>
          <span className="font-medium">{nf.format(activeUsers)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Server Load</span>
          <span className={`font-medium ${loadTone}`}>{serverLoad}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Uptime</span>
          <span className="font-medium">{uptime}</span>
        </div>
      </div>
    </div>
  );
}
