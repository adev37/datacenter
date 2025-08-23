import React from "react";
import { useDispatch } from "react-redux";
import { signOut } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const logout = () => {
    dispatch(signOut());
    nav("/login");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="px-3 py-1 rounded bg-gray-800 text-white">
          Logout
        </button>
      </div>
      <p className="text-gray-600 mt-2">
        You are logged in. Start building modules.
      </p>
    </div>
  );
}
