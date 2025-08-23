import React, { useState } from "react";
import { useRegisterMutation } from "@/services/auth.api";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";

// Minimal role options for MVP.
// TIP: In real app, drive this from GET /roles.
const ROLE_OPTIONS = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "FRONT_DESK",
  "PHARMACY",
  "LAB",
  "RADIOLOGY",
  "CASHIER",
  "INSURANCE",
  "INVENTORY",
  "HOUSEKEEPING",
  "IT",
];

export default function Register() {
  const [name, setName] = useState("Branch Admin");
  const [email, setEmail] = useState("admin@branch.local");
  const [password, setPassword] = useState("ChangeMe123!");
  const [role, setRole] = useState("ADMIN");
  const [branchId, setBranchId] = useState(""); // optional
  const [registerUser, { isLoading, error }] = useRegisterMutation();
  const dispatch = useDispatch();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const body = {
      name,
      email,
      password,
      roles: [role],
      // If left blank, server will accept [].
      branches: branchId ? [branchId] : [],
    };
    const res = await registerUser(body).unwrap();
    // server returns { accessToken, user }
    dispatch(setAuth(res));
    nav("/dashboard");
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form
        onSubmit={onSubmit}
        className="bg-white p-6 shadow rounded w-[28rem]">
        <h1 className="text-xl font-semibold mb-4">Create an account</h1>

        <label className="text-sm">Full name</label>
        <input
          className="border p-2 mb-3 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
        />

        <label className="text-sm">Email</label>
        <input
          className="border p-2 mb-3 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
        />

        <label className="text-sm">Password</label>
        <input
          className="border p-2 mb-3 w-full"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Role</label>
            <select
              className="border p-2 w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm">Branch ID (optional)</label>
            <input
              className="border p-2 w-full"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              placeholder="e.g. BR001"
            />
          </div>
        </div>

        <button
          disabled={isLoading}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded w-full">
          {isLoading ? "Creating…" : "Register"}
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-2">
            {error.data?.message || "Registration failed"}
          </p>
        )}

        <p className="text-sm text-gray-600 mt-3">
          Already have an account?{" "}
          <Link className="text-blue-600 underline" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
