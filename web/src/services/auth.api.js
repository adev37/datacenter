// apps/web/src/services/auth.api.js
import { api } from "./baseApi";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    me: build.query({
      query: () => ({ url: "/auth/me" }),
      providesTags: ["Auth"],
    }),
    login: build.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useMeQuery, useLoginMutation } = authApi;
