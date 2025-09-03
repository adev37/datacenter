import React, { useEffect, useMemo, useState } from "react";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import useCurrentUser from "@/hooks/useCurrentUser";
import {
  useUpdateMeMutation,
  useUploadMyAvatarMutation,
} from "@/services/users.api";
// ✅ NEW
import ImgWithFallback from "@/components/ImgWithFallback";

const TZ_OPTIONS = [
  "Asia/Kolkata",
  "UTC",
  "Asia/Dubai",
  "Asia/Kathmandu",
  "Asia/Dhaka",
];

export default function UserProfileSettings() {
  const { user } = useCurrentUser(); // returns .photoUrl
  const [updateMe, updateState] = useUpdateMeMutation();
  const [uploadAvatar, uploadState] = useUploadMyAvatarMutation();

  const initial = useMemo(
    () => ({
      title: user?.raw?.title || "",
      firstName: user?.raw?.firstName || "",
      lastName: user?.raw?.lastName || "",
      profession: user?.raw?.profession || user?.raw?.jobTitle || "",
      phone: user?.raw?.phone || "",
      start: user?.raw?.shift?.start || "08:00",
      end: user?.raw?.shift?.end || "18:00",
      tz: user?.raw?.shift?.tz || "Asia/Kolkata",
    }),
    [user]
  );

  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }

  async function onUploadAvatar(e) {
    e.preventDefault();
    if (!file) return;
    try {
      await uploadAvatar(file).unwrap(); // invalidates ME; hook returns cache-busted URL
    } finally {
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  async function onSave(e) {
    e.preventDefault();
    const payload = {
      title: form.title,
      firstName: form.firstName,
      lastName: form.lastName,
      profession: form.profession,
      phone: form.phone,
      shift: { start: form.start, end: form.end, tz: form.tz },
    };
    try {
      await updateMe(payload).unwrap();
    } catch {}
  }

  const initialsBubble = (
    <div className="grid h-14 w-14 place-content-center rounded-full bg-gray-300 text-white">
      <span className="text-base font-semibold">{user.initials}</span>
    </div>
  );

  return (
    <div>
      <NavigationBreadcrumb />
      <h1 className="mb-2 text-2xl font-semibold">Profile Settings</h1>
      <p className="mb-6 text-gray-600">Manage your personal info and shift.</p>

      <div className="rounded-xl border bg-white p-4">
        {/* Header card */}
        <div className="mb-5 flex items-center gap-3">
          <ImgWithFallback
            src={previewUrl || user.photoUrl}
            alt={user.fullName}
            className="h-14 w-14 rounded-full object-cover bg-gray-200"
            fallback={
              <div className="grid h-14 w-14 place-content-center rounded-full bg-gray-300 text-white">
                <span className="text-base font-semibold">{user.initials}</span>
              </div>
            }
          />
          <div className="min-w-0">
            <div className="truncate text-lg font-medium">{user.fullName}</div>
            <div className="text-sm text-gray-500">
              {user.profession || "—"}
            </div>
            <div className="text-xs text-gray-500">{user.shiftLabel}</div>
          </div>
        </div>

        {/* Avatar upload */}
        <form
          onSubmit={onUploadAvatar}
          className="mb-6 flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="block w-full text-sm"
          />
          <button
            disabled={!file || uploadState.isLoading}
            className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
            {uploadState.isLoading ? "Uploading…" : "Upload photo"}
          </button>
          {uploadState.isError && (
            <span className="ml-2 text-sm text-red-600">Failed to upload</span>
          )}
          {uploadState.isSuccess && (
            <span className="ml-2 text-sm text-emerald-700">Saved</span>
          )}
        </form>

        {/* Profile form (unchanged) */}
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm text-gray-700">Title</label>
              <input
                className="mt-1 w-full rounded border p-2"
                value={form.title}
                onChange={(e) =>
                  setForm((s) => ({ ...s, title: e.target.value }))
                }
                placeholder="Dr."
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">First name</label>
              <input
                className="mt-1 w-full rounded border p-2"
                value={form.firstName}
                onChange={(e) =>
                  setForm((s) => ({ ...s, firstName: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Last name</label>
              <input
                className="mt-1 w-full rounded border p-2"
                value={form.lastName}
                onChange={(e) =>
                  setForm((s) => ({ ...s, lastName: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-gray-700">Profession</label>
              <input
                className="mt-1 w-full rounded border p-2"
                value={form.profession}
                onChange={(e) =>
                  setForm((s) => ({ ...s, profession: e.target.value }))
                }
                placeholder="Cardiologist"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Phone</label>
              <input
                className="mt-1 w-full rounded border p-2"
                value={form.phone}
                onChange={(e) =>
                  setForm((s) => ({ ...s, phone: e.target.value }))
                }
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-gray-700">Shift</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs text-gray-500">Start</label>
                <input
                  type="time"
                  className="mt-1 w-full rounded border p-2"
                  value={form.start}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, start: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">End</label>
                <input
                  type="time"
                  className="mt-1 w-full rounded border p-2"
                  value={form.end}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, end: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Time zone</label>
                <select
                  className="mt-1 w-full rounded border p-2"
                  value={form.tz}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, tz: e.target.value }))
                  }>
                  {TZ_OPTIONS.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
              disabled={updateState.isLoading}>
              {updateState.isLoading ? "Saving…" : "Save changes"}
            </button>
            {updateState.isError && (
              <span className="text-sm text-red-600">Failed to save</span>
            )}
            {updateState.isSuccess && (
              <span className="text-sm text-emerald-700">Saved</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
