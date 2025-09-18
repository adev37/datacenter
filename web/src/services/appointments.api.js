import { api } from "./baseApi";

export const appointmentsApi = api.injectEndpoints({
  endpoints: (b) => ({
    // SCHEDULES
    getSchedule: b.query({
      query: (params) => ({ url: "/schedules", params }),
      providesTags: (_r, _e, q) => [
        { type: "Schedule", id: JSON.stringify(q) },
      ],
    }),
    upsertTemplate: b.mutation({
      query: (body) => ({ url: "/schedules/templates", method: "POST", body }),
      invalidatesTags: ["Schedule"],
    }),
    createBlock: b.mutation({
      query: (body) => ({ url: "/schedules/blocks", method: "POST", body }),
      invalidatesTags: ["Schedule"],
    }),

    // APPOINTMENTS
    listAppointments: b.query({
      query: (params) => ({ url: "/appointments", params }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((a) => ({ type: "Appointment", id: a._id })),
              { type: "Appointment", id: "LIST" },
            ]
          : [{ type: "Appointment", id: "LIST" }],
    }),
    createAppointment: b.mutation({
      query: (body) => ({ url: "/appointments", method: "POST", body }),
      invalidatesTags: [{ type: "Appointment", id: "LIST" }, "Schedule"],
    }),
    updateAppointment: b.mutation({
      query: ({ id, ...body }) => ({
        url: `/appointments/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Appointment", id: arg.id },
        { type: "Appointment", id: "LIST" },
        "Schedule",
      ],
    }),
    setAppointmentStatus: b.mutation({
      query: ({ id, status }) => ({
        url: `/appointments/${id}/status`,
        method: "POST",
        body: { status },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Appointment", id: arg.id },
        { type: "Appointment", id: "LIST" },
        "Schedule",
      ],
    }),
  }),
});

export const {
  useGetScheduleQuery,
  useUpsertTemplateMutation,
  useCreateBlockMutation,
  useListAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useSetAppointmentStatusMutation,
} = appointmentsApi;
