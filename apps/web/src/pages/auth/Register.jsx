import React, { useState } from "react";
import { useRegisterMutation } from "@/services/auth.api";
import { useNavigate, Link } from "react-router-dom";

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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [name, setName] = useState("Branch Admin");
  const [email, setEmail] = useState("admin@branch.local");
  const [password, setPassword] = useState("ChangeMe123!");
  const [role, setRole] = useState("ADMIN");
  const [branchId, setBranchId] = useState("");
  const [clientErr, setClientErr] = useState("");
  const [registerUser, { isLoading, error }] = useRegisterMutation();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setClientErr("");

    // Client-side validation to mirror backend Zod
    if (!name || !name.trim()) {
      setClientErr("Name is required");
      return;
    }
    if (!emailRegex.test(String(email).trim().toLowerCase())) {
      setClientErr("Email format is invalid");
      return;
    }
    if (!password || password.length < 8) {
      setClientErr("Password must be at least 8 characters");
      return;
    }

    const body = {
      name,
      email,
      password,
      roles: [role],
      branches: branchId ? [branchId] : [],
    };

    try {
      await registerUser(body).unwrap();
      // Send the user to login with a banner and the email prefilled
      nav("/login", { replace: true, state: { registered: true, email } });
    } catch {
      // RTKQ supplies `error` for display below
    }
  };

  const serverMsg = error?.data?.message;

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
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          autoComplete="email"
        />

        <label className="text-sm">Password</label>
        <input
          className="border p-2 mb-3 w-full"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
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

        {clientErr && <p className="text-red-600 text-sm mt-2">{clientErr}</p>}
        {serverMsg && <p className="text-red-600 text-sm mt-2">{serverMsg}</p>}

        <button
          disabled={isLoading}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded w-full">
          {isLoading ? "Creating…" : "Register"}
        </button>

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
