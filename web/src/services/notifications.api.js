import { api } from "./baseApi";

export const notificationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // List for bell or page; pass { unreadOnly: 1 } for the bell
    listNotifications: build.query({
      query: (params = {}) => ({ url: "/notifications", params }),
      providesTags: (res) =>
        res?.items
          ? [
              ...res.items.map((n) => ({ type: "Notification", id: n._id })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    // Cheap unread counter
    unreadCount: build.query({
      query: () => ({
        url: "/notifications",
        params: { unreadOnly: 1, countOnly: 1, limit: 1 },
      }),
      transformResponse: (r) => r?.total ?? 0,
      providesTags: [{ type: "Notification", id: "UNREAD_COUNT" }],
    }),

    // Single mark-read with optimistic removal from both possible caches
    markRead: build.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const targets = [
          { unreadOnly: 1, page: 1, limit: 5 },
          { unreadOnly: true, page: 1, limit: 5 },
        ];
        const undos = targets.map((args) =>
          dispatch(
            notificationsApi.util.updateQueryData(
              "listNotifications",
              args,
              (draft) => {
                if (!draft?.items) return;
                draft.items = draft.items.filter((n) => n._id !== id);
                draft.total = Math.max(0, (draft.total || 1) - 1);
              }
            )
          )
        );

        const undoCount = dispatch(
          notificationsApi.util.updateQueryData("unreadCount", undefined, (d) =>
            Math.max(0, (Number(d) || 1) - 1)
          )
        );

        try {
          await queryFulfilled;
        } catch {
          undos.forEach((u) => u.undo && u.undo());
          undoCount.undo();
        }
      },
      invalidatesTags: (_r, _e, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),

    // Bulk mark-read with optimistic clear
    markAllRead: build.mutation({
      query: () => ({ url: "/notifications/read-all", method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const targets = [
          { unreadOnly: 1, page: 1, limit: 5 },
          { unreadOnly: true, page: 1, limit: 5 },
        ];
        const undos = targets.map((args) =>
          dispatch(
            notificationsApi.util.updateQueryData(
              "listNotifications",
              args,
              (draft) => {
                if (!draft) return;
                draft.items = [];
                draft.total = 0;
              }
            )
          )
        );

        const undoCount = dispatch(
          notificationsApi.util.updateQueryData(
            "unreadCount",
            undefined,
            () => 0
          )
        );

        try {
          await queryFulfilled;
        } catch {
          undos.forEach((u) => u.undo && u.undo());
          undoCount.undo();
        }
      },
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
  }),
});

export const {
  useListNotificationsQuery,
  useUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationsApi;
