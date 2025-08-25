// apps/web/src/services/baseApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE } from "./apiClient";
import { signOut } from "@/store/slices/authSlice";

const rawBase = fetchBaseQuery({
  baseUrl: API_BASE,
  prepareHeaders: (headers, { getState }) => {
    const s = getState();
    const token = s.auth?.token;
    const branchId = s.auth?.branchId;

    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (branchId) headers.set("X-Branch-Id", branchId);

    return headers;
  },
});

// Intercept 401 → logout
const baseQuery = async (args, api, extra) => {
  const res = await rawBase(args, api, extra);
  if (res?.error?.status === 401) {
    api.dispatch(signOut());
  }
  return res;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Auth", "Patient", "Role"],
  endpoints: () => ({}),
});
