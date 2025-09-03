// apps/web/src/services/audits.api.js
import { api } from "./baseApi";

export const auditsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listAudits: build.query({
      // server already limits to ~200 latest; params left for future extension
      query: () => ({ url: "/audits", method: "GET" }),
      providesTags: ["Audit"],
    }),
  }),
});

export const { useListAuditsQuery } = auditsApi;
