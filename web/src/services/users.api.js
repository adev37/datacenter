import { api } from "./baseApi";

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    // current user
    getMe: build.query({
      query: () => ({ url: "/me", method: "GET" }),
      providesTags: [{ type: "User", id: "ME" }],
    }),
    updateMe: build.mutation({
      query: (body) => ({ url: "/users/me", method: "PUT", body }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    getUserStats: build.query({
      query: () => ({ url: "/users/stats" }),
      providesTags: [{ type: "User", id: "STATS" }],
    }),
    listUsersByRole: build.query({
      query: (role) => ({ url: `/users/by-role/${role}` }),
      providesTags: (_r, _e, role) => [{ type: "User", id: `ROLE_${role}` }],
    }),
    uploadMyAvatar: build.mutation({
      query: (file) => {
        const form = new FormData();
        form.append("avatar", file);
        return { url: "/users/me/avatar", method: "POST", body: form };
      },
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    // admin users
    listUsers: build.query({
      query: () => ({ url: "/users" }),
      providesTags: (res) =>
        res
          ? [
              ...res.map((u) => ({ type: "User", id: u._id || u.id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    createUser: build.mutation({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    setUserPermissions: build.mutation({
      query: ({ id, permissions }) => ({
        url: `/users/${id}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
        { type: "User", id: "ME" },
      ],
    }),
    getUserPermissions: build.query({
      query: (id) => ({ url: `/users/${id}/permissions` }),
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useUploadMyAvatarMutation,
  useListUsersQuery,
  useCreateUserMutation,
  useSetUserPermissionsMutation,
  useGetUserPermissionsQuery,
  useGetUserStatsQuery, // 👈 new
  useListUsersByRoleQuery, // 👈 new
} = usersApi;
