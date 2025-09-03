import React, { useMemo, useState } from "react";
import { useListRolesQuery, useUpsertRoleMutation } from "@/services/roles.api";
import { useMeQuery } from "@/services/auth.api"; // 👈 get logged-in roles
import { apiErrorMessage } from "@/utils/apiError";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";

export default function RolePermissions() {
  const { data: roles = [], isFetching, refetch } = useListRolesQuery();
  const [upsertRole, { isLoading, error }] = useUpsertRoleMutation();

  // who am i?
  const token = useSelector((s) => s.auth?.token);
  const { data: me } = useMeQuery(token ? undefined : skipToken);
  const isSuper = (me?.user?.roles || []).includes("SUPER_ADMIN");

  const roleNames = useMemo(() => roles.map((r) => r.name), [roles]);
  const [active, setActive] = useState(roleNames[0] || "ADMIN");

  const activeRole = useMemo(
    () =>
      roles.find((r) => r.name === active) || {
        name: active,
        permissions: [],
        scope: "BRANCH",
      },
    [roles, active]
  );

  const [scope, setScope] = useState(activeRole.scope);
  const [permText, setPermText] = useState(
    (activeRole.permissions || []).join("\n")
  );

  React.useEffect(() => {
    setScope(activeRole.scope || "BRANCH");
    setPermText((activeRole.permissions || []).join("\n"));
  }, [activeRole]);

  // 🔒 Only SUPER_ADMIN can change any role's scope.
  //    Branch admins can edit permissions but the scope control is disabled.
  const scopeDisabled = !isSuper || activeRole.name === "SUPER_ADMIN";

  // Optional: block non-super from editing the SUPER_ADMIN role entirely.
  const formDisabled = !isSuper && activeRole.name === "SUPER_ADMIN";

  const onSave = async (e) => {
    e.preventDefault();
    if (formDisabled) return;

    const permissions = permText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    await upsertRole({
      name: activeRole.name,
      scope: scope, // backend will ignore this if not SUPER_ADMIN
      permissions,
    }).unwrap();

    await refetch();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Role Permissions</h1>
        <p className="text-sm text-gray-600">
          Create or update role permission catalogs.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 border rounded bg-white">
          <div className="p-2 border-b font-medium text-sm">Roles</div>
          <ul className="max-h-[60vh] overflow-auto">
            {roleNames.map((r) => (
              <li key={r}>
                <button
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                    active === r ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setActive(r)}>
                  {r.replace(/_/g, " ")}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="col-span-12 md:col-span-9">
          <form
            onSubmit={onSave}
            className="bg-white border rounded p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">Role</label>
                <input
                  value={activeRole.name}
                  readOnly
                  className="mt-1 w-full border rounded px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Scope{" "}
                  {scopeDisabled && (
                    <span className="text-xs text-gray-500">
                      (managed by Super Admin)
                    </span>
                  )}
                </label>
                <select
                  className="mt-1 w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  disabled={scopeDisabled}>
                  <option value="BRANCH">BRANCH</option>
                  <option value="GLOBAL">GLOBAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Permissions (one per line)
              </label>
              <textarea
                className="mt-1 w-full border rounded px-3 py-2 font-mono min-H-[240px]"
                value={permText}
                onChange={(e) => setPermText(e.target.value)}
                placeholder="user.read&#10;patient.write&#10;billing.invoice"
                disabled={formDisabled}
              />
              {!isSuper && activeRole.name === "SUPER_ADMIN" && (
                <p className="text-xs text-amber-600 mt-1">
                  SUPER_ADMIN role can only be edited by a Super Admin.
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-600 text-sm">{apiErrorMessage(error)}</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || formDisabled}
                className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60">
                {isLoading ? "Saving…" : "Save"}
              </button>
              {isFetching && (
                <span className="text-sm text-gray-500">Refreshing…</span>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
