import { api } from "./baseApi";

export const patientsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // GET /patients?search=&gender=&status=&sort=&page=&limit=
    listPatients: build.query({
      query: (params = {}) => ({ url: "/patients", params }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((p) => ({ type: "Patient", id: p._id })),
              { type: "Patient", id: "LIST" },
            ]
          : [{ type: "Patient", id: "LIST" }],
    }),

    // GET /patients/:id
    getPatient: build.query({
      query: (id) => ({ url: `/patients/${id}` }),
      providesTags: (_res, _err, id) => [{ type: "Patient", id }],
    }),

    // POST /patients (MRN is auto-generated server-side)
    createPatient: build.mutation({
      query: (body) => ({ url: "/patients", method: "POST", body }),
      invalidatesTags: [{ type: "Patient", id: "LIST" }],
    }),

    // PATCH /patients/:id
    updatePatient: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/patients/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Patient", id: arg.id },
        { type: "Patient", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListPatientsQuery,
  useGetPatientQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
} = patientsApi;
