import React, { useEffect, useState } from "react";
import { useLoginMutation } from "@/services/auth.api";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const loc = useLocation();
  const [email, setEmail] = useState("super@admin.local");
  const [password, setPassword] = useState("ChangeMe123!");
  const [clientErr, setClientErr] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const nav = useNavigate();

  // If we came from Register, prefill email & show banner once
  const justRegistered = Boolean(loc.state?.registered);
  useEffect(() => {
    if (loc.state?.email) setEmail(loc.state.email);
  }, [loc.state]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setClientErr("");

    // Client-side validation to catch obvious mistakes fast
    if (!emailRegex.test(String(email).trim().toLowerCase())) {
      setClientErr("Email format is invalid");
      return;
    }
    if (!password || password.length < 6) {
      setClientErr("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setAuth(res));
      nav("/dashboard");
    } catch {
      // RTKQ will put the error into `error`
      // We don’t need to do anything here.
    }
  };

  const serverMsg = error?.data?.message;

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="bg-white p-6 shadow rounded w-80">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>

        {justRegistered && (
          <div className="mb-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm p-2">
            Account created. Please sign in.
          </div>
        )}

        <input
          className="border p-2 mb-2 w-full"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="username"
        />

        <input
          className="border p-2 mb-2 w-full"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
        />

        {clientErr && <p className="text-red-600 text-sm mb-2">{clientErr}</p>}
        {serverMsg && <p className="text-red-600 text-sm mb-2">{serverMsg}</p>}

        <button
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          {isLoading ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
