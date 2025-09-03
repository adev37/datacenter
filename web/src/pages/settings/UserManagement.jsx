// apps/web/src/pages/settings/UserManagement.jsx
import React, { useMemo, useState } from "react";
import {
  useListUsersQuery,
  useSetUserPermissionsMutation,
} from "@/services/users.api";
import { useListRolesQuery } from "@/services/roles.api";
import { apiErrorMessage } from "@/utils/apiError";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-50 bg-white rounded shadow-xl w-[720px] max-w-[95vw]">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const {
    data: users = [],
    isFetching,
    refetch,
    error: usersErr,
  } = useListUsersQuery();
  const { data: roles = [] } = useListRolesQuery();

  const [editing, setEditing] = useState(null); // user being edited (for overrides)
  const [overrides, setOverrides] = useState([]); // array<string>
  const [saveOverrides, { isLoading: saving, error: saveErr }] =
    useSetUserPermissionsMutation();

  const allPermKeys = useMemo(
    () => Array.from(new Set(roles.flatMap((r) => r.permissions || []))).sort(),
    [roles]
  );

  const openOverrides = (u) => {
    setEditing(u);
    setOverrides(u.permissions || []); // server returns permissions in list endpoint
  };

  const toggle = (p) => {
    const next = new Set(overrides);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setOverrides(Array.from(next));
  };

  const onSave = async () => {
    await saveOverrides({
      id: editing._id || editing.id,
      permissions: overrides,
    }).unwrap();
    setEditing(null);
    await refetch();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">User Management</h1>
        <p className="text-sm text-gray-600">
          Assign roles and manage per-user extra permissions (overrides).
        </p>
      </div>

      {usersErr && (
        <p className="text-red-600 text-sm mb-2">{apiErrorMessage(usersErr)}</p>
      )}

      <div className="bg-white border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Roles</th>
              <th className="text-left px-3 py-2">Branches</th>
              <th className="text-left px-3 py-2">Overrides</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id || u.id} className="border-t">
                <td className="px-3 py-2">{u.name || "—"}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  {(u.roles || []).length ? (
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {r}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {(u.branches || []).length
                    ? (u.branches || []).join(", ")
                    : "—"}
                </td>
                <td className="px-3 py-2">
                  {(u.permissions || []).length
                    ? (u.permissions || []).length
                    : 0}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    className="px-3 py-1.5 rounded border hover:bg-gray-50"
                    onClick={() => openOverrides(u)}>
                    Edit Overrides
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isFetching && (
          <div className="p-3 text-sm text-gray-500 border-t">Loading…</div>
        )}
      </div>

      {/* Overrides editor modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Extra permissions — ${editing?.email || ""}`}>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            These are <b>additional</b> permissions for the user (granted on top
            of their role-based permissions). Remove all to clear overrides.
          </p>

          {saveErr && (
            <p className="text-red-600 text-sm">{apiErrorMessage(saveErr)}</p>
          )}

          <div className="border rounded p-3 max-h-[50vh] overflow-auto">
            {allPermKeys.length === 0 ? (
              <p className="text-sm text-gray-500">
                No role permissions found. Define permissions in Role
                Permissions first.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {allPermKeys.map((k) => (
                  <label
                    key={k}
                    className="flex items-center gap-2 p-2 rounded border">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={overrides.includes(k)}
                      onChange={() => toggle(k)}
                    />
                    <span className="font-mono">{k}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded border"
              onClick={() => setEditing(null)}
              type="button">
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
              disabled={saving}
              onClick={onSave}
              type="button">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
