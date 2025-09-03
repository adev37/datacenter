// apps/web/src/services/baseApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { loadAuth } from "@/utils/authStorage";

// Canonical API base (supports absolute VITE_API_BASE or relative `/api/v1`)
export const API_BASE = (import.meta.env.VITE_API_BASE || "/api/v1").replace(
  /\/+$/,
  ""
);

// 👉 NEW: figure out the origin where the API is served (for static files like /uploads)
export const API_ORIGIN = (() => {
  try {
    // If API_BASE is absolute => use its origin, else fall back to current page origin
    return new URL(API_BASE, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
})();

// 👉 NEW: make any path absolute on the API origin; leaves http(s) URLs alone
export function toAbsUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${p}`;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const state = getState?.();
      const token = state?.auth?.token ?? loadAuth()?.token ?? null;
      const branchId = state?.auth?.branchId ?? loadAuth()?.branchId ?? null;

      if (token) headers.set("authorization", `Bearer ${token}`);
      if (branchId) headers.set("X-Branch-Id", String(branchId));

      return headers;
    },
  }),
  tagTypes: ["Auth", "Role", "User"],
  endpoints: () => ({}),
});
