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

    // Deactivate (no hide)
    deletePatient: build.mutation({
      query: (id) => ({ url: `/patients/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Patient", id: "LIST" }],
    }),

    // Reactivate legacy soft-deleted rows
    restorePatient: build.mutation({
      query: (id) => ({ url: `/patients/${id}/restore`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),

    // Set arbitrary status (used for re-activate when not deleted)
    setPatientStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/patients/${id}/status`,
        method: "POST",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
      ],
    }),

    uploadPatientPhoto: build.mutation({
      query: ({ id, file }) => {
        const fd = new FormData();
        fd.append("photo", file);
        return { url: `/patients/${id}/photo`, method: "POST", body: fd };
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: "Patient", id }],
    }),

    listPatientNotes: build.query({
      query: (id) => ({ url: `/patients/${id}/notes` }),
      providesTags: (_r, _e, id) => [{ type: "Patient", id: `NOTES-${id}` }],
    }),
    addPatientNote: build.mutation({
      query: ({ id, text }) => ({
        url: `/patients/${id}/notes`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Patient", id },
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
  useRestorePatientMutation,
  useSetPatientStatusMutation, // <-- ensure exported
  useUploadPatientPhotoMutation,
  useListPatientNotesQuery,
  useAddPatientNoteMutation,
} = patientsApi;
