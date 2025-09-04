import { api } from "./baseApi";

export const encountersApi = api.injectEndpoints({
  endpoints: (build) => ({
    // GET /patients/:patientId/encounters
    listEncounters: build.query({
      query: ({ patientId, page = 1, limit = 20, type } = {}) => ({
        url: `/patients/${patientId}/encounters`,
        params: { page, limit, type },
      }),
      providesTags: (res, _e, arg) =>
        res?.items
          ? [
              ...res.items.map((x) => ({ type: "Encounter", id: x._id })),
              { type: "Encounter", id: `LIST:${arg?.patientId}` },
            ]
          : [{ type: "Encounter", id: `LIST:${arg?.patientId}` }],
    }),

    // POST /patients/:patientId/encounters
    createEncounter: build.mutation({
      query: ({ patientId, ...body }) => ({
        url: `/patients/${patientId}/encounters`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Encounter", id: `LIST:${arg?.patientId}` },
      ],
    }),

    // PATCH /patients/:patientId/encounters/:id
    updateEncounter: build.mutation({
      query: ({ patientId, id, ...body }) => ({
        url: `/patients/${patientId}/encounters/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Encounter", id: arg.id },
        { type: "Encounter", id: `LIST:${arg?.patientId}` },
      ],
    }),
  }),
});

export const {
  useListEncountersQuery,
  useCreateEncounterMutation,
  useUpdateEncounterMutation,
} = encountersApi;
