// apps/web/src/services/roles.api.js
import { api } from "./baseApi";

export const rolesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listRoles: build.query({
      query: () => ({ url: "/roles" }),
      providesTags: (res) =>
        res
          ? [
              ...res.map((r) => ({ type: "Role", id: r.name })),
              { type: "Role", id: "LIST" },
            ]
          : [{ type: "Role", id: "LIST" }],
    }),
    upsertRole: build.mutation({
      query: (body) => ({ url: "/roles", method: "POST", body }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),
  }),
});

export const { useListRolesQuery, useUpsertRoleMutation } = rolesApi;
