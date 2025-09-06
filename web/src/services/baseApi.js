import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { loadAuth } from "@/utils/authStorage";
import { signOut } from "@/store/slices/authSlice";

export const API_BASE = (import.meta.env.VITE_API_BASE || "/api/v1").replace(
  /\/+$/,
  ""
);

export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
})();

export function toAbsUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${p}`;
}

const rawBaseQuery = fetchBaseQuery({
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
});

const baseQueryWithAuthGuard = async (args, api, extraOptions) => {
  const res = await rawBaseQuery(args, api, extraOptions);
  if (res?.error?.status === 401) {
    api.dispatch(signOut());
  }
  return res;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuthGuard,
  tagTypes: [
    "Auth",
    "Role",
    "User",
    "Patient",
    "Encounter",
    "Audit",
    "Notification",
  ],
  endpoints: () => ({}),
});
