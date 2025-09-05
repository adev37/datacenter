import { api } from "./baseApi";

export const patientsApi = api.injectEndpoints({
  endpoints: (build) => ({
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
    getPatient: build.query({
      query: (id) => ({ url: `/patients/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Patient", id }],
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
      invalidatesTags: (_r, _e, arg) => [
        { type: "Patient", id: arg.id },
        { type: "Patient", id: "LIST" },
      ],
    }),
    deletePatient: build.mutation({
      query: (id) => ({ url: `/patients/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Patient", id: "LIST" }],
    }),
    deactivatePatient: build.mutation({
      query: (id) => ({
        url: `/patients/${id}`,
        method: "PATCH",
        body: { status: "inactive" },
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),
    activatePatient: build.mutation({
      query: (id) => ({
        url: `/patients/${id}`,
        method: "PATCH",
        body: { status: "active" },
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),
    listPatientNotes: build.query({
      query: (id) => ({ url: `/patients/${id}/notes` }),
      providesTags: (_r, _e, id) => [{ type: "Patient", id: `NOTES-${id}` }],
    }),
    addPatientNote: build.mutation({
      query: ({ id, body }) => ({
        url: `/patients/${id}/notes`,
        method: "POST",
        body: { body },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Patient", id: `NOTES-${id}` },
      ],
    }),
  }),
});

export const {
  useListPatientsQuery,
  useGetPatientQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useDeactivatePatientMutation,
  useActivatePatientMutation,
  useListPatientNotesQuery,
  useAddPatientNoteMutation,
} = patientsApi;
