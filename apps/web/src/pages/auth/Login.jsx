import React, { useState } from "react";
import { useLoginMutation } from "@/services/auth.api";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("super@admin.local");
  const [password, setPassword] = useState("ChangeMe123!");
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await login({ email, password }).unwrap();
    dispatch(setAuth(res));
    nav("/dashboard");
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="bg-white p-6 shadow rounded w-80">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <input
          className="border p-2 mb-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="border p-2 mb-4 w-full"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          {isLoading ? "Signing in…" : "Login"}
        </button>
        {error && (
          <p className="text-red-600 text-sm mt-2">
            {error.data?.message || "Login failed"}
          </p>
        )}
      </form>
    </div>
  );
}
