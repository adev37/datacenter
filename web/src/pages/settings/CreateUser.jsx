// apps/web/src/pages/settings/CreateUser.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateUserMutation } from "@/services/users.api";
import { useListRolesQuery } from "@/services/roles.api";
import { useMeQuery } from "@/services/auth.api";
import { skipToken } from "@reduxjs/toolkit/query";
import { apiErrorMessage } from "@/utils/apiError";

export default function CreateUser() {
  const nav = useNavigate();

  // Current auth snapshot
  const token = useSelector((s) => s.auth?.token);
  const branchId = useSelector((s) => s.auth?.branchId) || "";
  const { data: me } = useMeQuery(token ? undefined : skipToken);
  const myRoles = me?.user?.roles || [];
  const isSuper = myRoles.includes("SUPER_ADMIN");

  // Roles from server (with scope info)
  const { data: roles = [], isFetching: rolesLoading } = useListRolesQuery();

  // UX guard:
  // - SUPER_ADMIN never appears in dropdown for anyone
  // - ADMIN appears only for Super Admin (non-super cannot create Admins)
  const roleOptions = useMemo(() => {
    if (isSuper) {
      return roles.filter((r) => r.name !== "SUPER_ADMIN").map((r) => r.name);
    }
    return roles
      .filter((r) => r.scope === "BRANCH")
      .filter((r) => r.name !== "SUPER_ADMIN" && r.name !== "ADMIN")
      .map((r) => r.name);
  }, [isSuper, roles]);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "ChangeMe123!",
    role: roleOptions[0] || "",
    branch: isSuper ? "" : branchId, // non-super: locked to active branch
  });

  // local validation error (UI only)
  const [localError, setLocalError] = useState("");

  // Keep defaults valid when roleOptions load or change
  useEffect(() => {
    setForm((s) => ({
      ...s,
      role: roleOptions.includes(s.role) ? s.role : roleOptions[0] || "",
      branch: isSuper ? s.branch : branchId, // keep non-super locked
    }));
  }, [roleOptions, isSuper, branchId]);

  const [createUser, { isLoading, error, isSuccess }] = useCreateUserMutation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // Guard: When SUPER creates an ADMIN, a single branch is required
    if (isSuper && form.role === "ADMIN" && !form.branch.trim()) {
      setLocalError("Branch ID is required when creating an ADMIN.");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      roles: form.role ? [form.role] : [],
      // For non-super the API ignores branches and forces X-Branch-Id.
      // We still send branch for SUPER (and clarity).
      branches: form.branch ? [form.branch] : [],
    };

    try {
      await createUser(payload).unwrap();
      // Optional success navigation:
      // nav("/settings/user-management");
    } catch {
      // handled by RTKQ error state
    }
  };

  const disabledBranchInput = !isSuper; // lock branch for non-super
  const errMsg = apiErrorMessage(error);

  const policyNote = isSuper
    ? "As Super Admin, you can assign any role (except Super Admin) and any branch."
    : "As Branch-scoped user, branch is locked to your hospital and you cannot create Admins.";

  return (
    <div className="max-w-xl bg-white p-6 rounded shadow">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Create User</h1>
        <p className="text-sm text-gray-600">{policyNote}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="text-sm">Full name</label>
          <input
            className="border p-2 w-full"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm">Email</label>
          <input
            className="border p-2 w-full"
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm">Password</label>
          <input
            className="border p-2 w-full"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((s) => ({ ...s, password: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Role</label>
            <select
              className="border p-2 w-full"
              value={form.role}
              disabled={rolesLoading || roleOptions.length === 0}
              onChange={(e) =>
                setForm((s) => ({ ...s, role: e.target.value }))
              }>
              {roleOptions.length === 0 ? (
                <option value="" disabled>
                  {rolesLoading ? "Loading roles…" : "No roles available"}
                </option>
              ) : (
                roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))
              )}
            </select>
            {!isSuper && (
              <p className="mt-1 text-xs text-gray-500">
                Only branch-scoped roles are available. Admin cannot be created
                by non-super users.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm">Branch ID</label>
            <input
              className="border p-2 w-full disabled:bg-gray-100 disabled:text-gray-500"
              value={form.branch}
              onChange={(e) =>
                setForm((s) => ({ ...s, branch: e.target.value }))
              }
              placeholder="e.g. BR001"
              disabled={disabledBranchInput}
            />
            {!isSuper && (
              <p className="mt-1 text-xs text-gray-500">
                Locked to your hospital.
              </p>
            )}
          </div>
        </div>

        {localError && <p className="text-red-600 text-sm">{localError}</p>}
        {errMsg && <p className="text-red-600 text-sm">{errMsg}</p>}
        {isSuccess && (
          <p className="text-green-700 text-sm">User created successfully.</p>
        )}

        <div className="flex gap-2">
          <button
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60">
            {isLoading ? "Creating…" : "Create user"}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded border"
            onClick={() => nav("/settings/user-management")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
