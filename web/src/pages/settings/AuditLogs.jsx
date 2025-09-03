// apps/web/src/pages/settings/AuditLogs.jsx
import React from "react";
import { useListAuditsQuery } from "@/services/audits.api";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";

const Pill = ({ children, tone = "default" }) => {
  const t =
    tone === "success"
      ? "bg-emerald-100 text-emerald-800"
      : tone === "denied"
      ? "bg-amber-100 text-amber-800"
      : tone === "error"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-800";
  return (
    <span className={`rounded-full px-2 py-[2px] text-xs font-medium ${t}`}>
      {children}
    </span>
  );
};

export default function AuditLogs() {
  const { data = [], isFetching, isError } = useListAuditsQuery();

  return (
    <div>
      <NavigationBreadcrumb />
      <h1 className="mb-2 text-2xl font-semibold">Audit Logs</h1>
      <p className="mb-6 text-gray-600">
        Recent administrative actions and security denials.
      </p>

      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm text-gray-600">
            {isFetching ? "Loading…" : `${data.length} recent events`}
          </div>
        </div>

        {isError ? (
          <div className="p-4 text-sm text-red-600">
            Failed to load audit logs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Actor</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Outcome</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Target</th>
                  <th className="px-4 py-2">Branch</th>
                  <th className="px-4 py-2">IP</th>
                </tr>
              </thead>
              <tbody>
                {data.map((e) => {
                  const tone =
                    e.outcome === "success"
                      ? "success"
                      : e.outcome === "denied"
                      ? "denied"
                      : e.outcome === "error"
                      ? "error"
                      : "default";
                  const when = e.at ? new Date(e.at).toLocaleString() : "—";
                  const actor =
                    e.actorEmail ||
                    (e.actorId ? `#${String(e.actorId).slice(-6)}` : "—");
                  const targetEmail = e?.target?.email || "—";
                  const targetRoles = Array.isArray(e?.target?.roles)
                    ? e.target.roles.join(", ")
                    : "";
                  return (
                    <tr key={e._id || `${e.at}-${e.actorId}-${e.action}`}>
                      <td className="px-4 py-2 whitespace-nowrap">{when}</td>
                      <td className="px-4 py-2">
                        <div className="leading-tight">
                          <div className="font-medium">{actor}</div>
                          {Array.isArray(e.actorRoles) &&
                            e.actorRoles.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {e.actorRoles.join(", ")}
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="leading-tight">
                          <div className="font-medium">{e.action}</div>
                          <div className="text-xs text-gray-500">
                            {e.resource || "—"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <Pill tone={tone}>{e.outcome}</Pill>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs text-gray-700">
                          {e.reason || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="leading-tight">
                          <div className="font-medium">{targetEmail}</div>
                          {targetRoles && (
                            <div className="text-xs text-gray-500">
                              {targetRoles}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">{e.branchId || "—"}</td>
                      <td className="px-4 py-2">{e.ip || "—"}</td>
                    </tr>
                  );
                })}
                {!isFetching && data.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-gray-500"
                      colSpan={8}>
                      No events yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
