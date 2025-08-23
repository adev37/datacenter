import React from "react";
import { useSelector } from "react-redux";
import { useMeQuery } from "@/services/auth.api";

/** Rehydrates /auth/me when a token exists, shows loader while fetching */
export default function AuthGate({ children }) {
  const token = useSelector((s) => s.auth?.token);
  const { isFetching } = useMeQuery(undefined, { skip: !token });

  if (token && isFetching) {
    return (
      <div className="w-full min-h-screen grid place-items-center text-gray-600">
        Loading session…
      </div>
    );
  }
  return children;
}
