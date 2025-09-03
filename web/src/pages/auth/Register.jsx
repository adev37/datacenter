import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMeQuery } from "@/services/auth.api";
import { skipToken } from "@reduxjs/toolkit/query";
import { useCreateUserMutation } from "@/services/users.api";

const ROLE_OPTIONS = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "FRONT_DESK",
  "PHARMACY",
  "LAB",
  "RADIOLOGY",
  "CASHIER",
  "INVENTORY",
  "HOUSEKEEPING",
  "IT",
];

export default function Register() {
  // If not logged in, meQuery is skipped
  const token = useSelector((s) => s.auth?.token);
  const branchId = useSelector((s) => s.auth?.branchId) || "";
  const { data: me } = useMeQuery(token ? undefined : skipToken);

  const roles = me?.user?.roles || [];
  const perms = new Set(me?.permissions || []);
  const canCreate = roles.includes("SUPER_ADMIN") || perms.has("user.write");

  // If not authenticated → self-serve registration is disabled
  if (!token)
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="bg-white p-6 rounded shadow w-[28rem]">
          <h1 className="text-xl font-semibold mb-2">Registration disabled</h1>
          <p className="text-gray-600">
            Self-service signup is not allowed. Please{" "}
            <Link to="/login" className="text-blue-600 underline">
              sign in
            </Link>{" "}
            as an administrator and create users from here.
          </p>
        </div>
      </div>
    );

  // Authenticated but not allowed
  if (!canCreate)
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="bg-white p-6 rounded shadow w-[28rem]">
          <h1 className="text-xl font-semibold mb-2">403 — Not authorized</h1>
          <p className="text-gray-600">
            You don’t have permission to create users. Contact a Super Admin.
          </p>
        </div>
      </div>
    );

  // Allowed → show admin create-user form
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "ChangeMe123!",
    role: "ADMIN",
    branch: branchId,
  });
  const [createUser, { isLoading, error, isSuccess }] = useCreateUserMutation();

  const onSubmit = async (e) => {
    e.preventDefault();
    await createUser({
      name: form.name,
      email: form.email,
      password: form.password,
      roles: [form.role],
      branches: form.branch ? [form.branch] : [],
    }).unwrap();
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form
        onSubmit={onSubmit}
        className="bg-white p-6 shadow rounded w-[28rem]">
        <h1 className="text-xl font-semibold mb-4">Create a user (Admin)</h1>

        <label className="text-sm">Full name</label>
        <input
          className="border p-2 mb-3 w-full"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
        />

        <label className="text-sm">Email</label>
        <input
          className="border p-2 mb-3 w-full"
          type="email"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
        />

        <label className="text-sm">Password</label>
        <input
          className="border p-2 mb-3 w-full"
          type="password"
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Role</label>
            <select
              className="border p-2 w-full"
              value={form.role}
              onChange={(e) =>
                setForm((s) => ({ ...s, role: e.target.value }))
              }>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Branch ID</label>
            <input
              className="border p-2 w-full"
              value={form.branch}
              onChange={(e) =>
                setForm((s) => ({ ...s, branch: e.target.value }))
              }
              placeholder="e.g. BR001"
            />
          </div>
        </div>

        {error?.data?.message && (
          <p className="text-red-600 text-sm mt-2">{error.data.message}</p>
        )}
        {isSuccess && (
          <p className="text-green-700 text-sm mt-2">User created.</p>
        )}

        <button
          disabled={isLoading}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded w-full">
          {isLoading ? "Creating…" : "Create user"}
        </button>

        <p className="text-sm text-gray-600 mt-3">
          Done here?{" "}
          <Link
            className="text-blue-600 underline"
            to="/settings/user-management">
            Go to User Management
          </Link>
        </p>
      </form>
    </div>
  );
}
