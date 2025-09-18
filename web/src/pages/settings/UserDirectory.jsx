// apps/web/src/pages/settings/UserDirectory.jsx
import React, { useMemo, useState } from "react";
import {
  useGetUserStatsQuery,
  useListUsersByRoleQuery,
} from "@/services/users.api";
import { useListRolesQuery } from "@/services/roles.api";
import { apiErrorMessage } from "@/utils/apiError";

function StatCard({ label, value, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg border px-4 py-3 text-left transition
        ${
          active ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"
        }`}>
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value ?? 0}</div>
    </button>
  );
}

function RoleUsersTable({ role }) {
  const {
    data = [],
    isFetching,
    error,
  } = useListUsersByRoleQuery(role, {
    skip: !role,
  });

  if (!role) return null;

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-medium">
          {role} <span className="text-gray-500 text-sm">({data.length})</span>
        </h3>
        {isFetching && <span className="text-sm text-gray-500">Loading…</span>}
      </div>

      {error ? (
        <div className="p-4 text-sm text-red-600">{apiErrorMessage(error)}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Title/Profession</th>
                <th className="text-left px-3 py-2">Branches</th>
                <th className="text-left px-3 py-2">Roles</th>
                <th className="text-left px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-gray-500" colSpan={6}>
                    No users found for this role.
                  </td>
                </tr>
              ) : (
                data.map((u) => (
                  <tr key={u._id || u.id} className="border-t">
                    <td className="px-3 py-2">{u.name || u.fullName || "—"}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">
                      {u.title || u.profession || u.jobTitle || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {(u.branches || []).length
                        ? (u.branches || []).join(", ")
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {(u.roles || []).join(", ") || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function UserDirectory() {
  const {
    data: stats = {},
    isFetching: statsLoading,
    error: statsErr,
  } = useGetUserStatsQuery();
  const { data: rolesFromApi = [] } = useListRolesQuery();

  // Order roles nicely: use the roles catalog if present, fall back to keys from stats
  const roleOrder = useMemo(() => {
    const fromCatalog = rolesFromApi
      .map((r) => r.name)
      .filter((n) => n && n !== "SUPER_ADMIN"); // hide SUPER_ADMIN in UI
    const fromStats = Object.keys(stats.counts || {}).filter(
      (r) => r !== "SUPER_ADMIN"
    );
    const merged = Array.from(new Set([...fromCatalog, ...fromStats]));
    return merged;
  }, [rolesFromApi, stats]);

  const [activeRole, setActiveRole] = useState(() => roleOrder[0] || "");

  // Keep activeRole valid if roleOrder changes
  React.useEffect(() => {
    if (!activeRole && roleOrder.length) setActiveRole(roleOrder[0]);
    if (activeRole && !roleOrder.includes(activeRole) && roleOrder.length) {
      setActiveRole(roleOrder[0]);
    }
  }, [activeRole, roleOrder]);

  const counts = stats.counts || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">User Directory</h1>
        <p className="text-sm text-gray-600">
          See how many users are registered in each role, then click to view the
          list.
        </p>
      </div>

      {statsErr && (
        <div className="text-sm text-red-600">{apiErrorMessage(statsErr)}</div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {roleOrder.length === 0 ? (
          <div className="text-sm text-gray-500">
            {statsLoading ? "Loading…" : "No roles to display."}
          </div>
        ) : (
          roleOrder.map((role) => (
            <StatCard
              key={role}
              label={role}
              value={counts[role] ?? 0}
              active={activeRole === role}
              onClick={() => setActiveRole(role)}
            />
          ))
        )}
      </div>

      {/* Users table for selected role */}
      {activeRole && <RoleUsersTable role={activeRole} />}
    </div>
  );
}
