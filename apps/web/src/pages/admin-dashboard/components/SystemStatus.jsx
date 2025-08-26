// apps/web/src/pages/admin-dashboard/components/SystemStatus.jsx
import React from "react";

export default function SystemStatus() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-600">System Status</div>
      <div className="text-xs text-green-600">All systems operational</div>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Active Users</span>
          <span className="font-medium">247</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Server Load</span>
          <span className="font-medium text-green-600">Normal</span>
        </div>
      </div>
    </div>
  );
}
