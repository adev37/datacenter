import { api } from "./baseApi";
export const patientsApi = api.injectEndpoints({
  endpoints: (b) => ({
    listPatients: b.query({
      query: () => "/patients",
      providesTags: ["Patient"],
    }),
    createPatient: b.mutation({
      query: (body) => ({ url: "/patients", method: "POST", body }),
      invalidatesTags: ["Patient"],
    }),
  }),
});
export const { useListPatientsQuery, useCreatePatientMutation } = patientsApi;
