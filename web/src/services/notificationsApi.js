// apps/web/src/services/notifications.api.js
import { api } from "./baseApi";

export const notificationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listNotifications: build.query({
      query: (q) => ({
        url: "/notifications",
        params: { unreadOnly: true, limit: 20, ...(q || {}) },
      }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((n) => ({ type: "Notification", id: n._id })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
      keepUnusedDataFor: 15,
    }),
    markRead: build.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useListNotificationsQuery, useMarkReadMutation } =
  notificationsApi;
