import { api } from "@/services/baseApi";

export const patientsApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchPatients: build.query({
      query: (params) => ({ url: "/patients/search", params }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((p) => ({ type: "Patient", id: p._id })),
              { type: "Patient", id: "LIST" },
            ]
          : [{ type: "Patient", id: "LIST" }],
    }),
    getPatient: build.query({
      query: (id) => `/patients/${id}`,
      providesTags: (res, err, id) => [{ type: "Patient", id }],
    }),
    createPatient: build.mutation({
      query: (body) => ({ url: "/patients", method: "POST", body }),
      invalidatesTags: [{ type: "Patient", id: "LIST" }],
    }),
    updatePatient: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/patients/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (res, err, { id }) => [{ type: "Patient", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSearchPatientsQuery,
  useGetPatientQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
} = patientsApi;
