import { api } from "./baseApi";

export const auditsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listAudits: build.query({
      query: (params) => ({ url: "/audits", method: "GET", params }),
      providesTags: ["Audit"],
    }),
  }),
});

export const { useListAuditsQuery } = auditsApi;
