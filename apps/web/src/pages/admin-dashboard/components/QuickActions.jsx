// apps/web/src/pages/admin-dashboard/components/QuickActions.jsx
import React from "react";
import QuickActionPanel from "@/components/ui/QuickActionPanel";

export default function QuickActions() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <QuickActionPanel
        title="Quick Actions"
        subtitle="Common tasks"
        cols={2}
      />
      <div className="mt-3 border-t pt-2 text-xs text-gray-500">
        <span className="inline-flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="currentColor">
            <path d="M12 22a10 10 0 1 1 10-10 10.011 10.011 0 0 1-10 10zM11 6h2v7h-2zm0 9h2v2h-2z" />
          </svg>
          Customize Actions
        </span>
      </div>
    </div>
  );
}
