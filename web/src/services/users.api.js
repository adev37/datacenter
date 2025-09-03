// apps/web/src/services/users.api.js
import { api } from "./baseApi";

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query({
      query: () => ({ url: "/me", method: "GET" }),
      providesTags: [{ type: "User", id: "ME" }],
    }),

    // 👉 NEW: update current user's profile fields
    updateMe: build.mutation({
      query: (body) => ({ url: "/users/me", method: "PUT", body }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    // 👉 NEW: upload avatar
    uploadMyAvatar: build.mutation({
      query: (file) => {
        const form = new FormData();
        form.append("avatar", file);
        return { url: "/users/me/avatar", method: "POST", body: form };
      },
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    // Existing …
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
  useUpdateMeMutation, // NEW
  useUploadMyAvatarMutation, // NEW
  useListUsersQuery,
  useCreateUserMutation,
  useSetUserPermissionsMutation,
  useGetUserPermissionsQuery,
} = usersApi;
