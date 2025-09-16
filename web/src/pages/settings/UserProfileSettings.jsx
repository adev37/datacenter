import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import NavigationBreadcrumb from "@/components/ui/NavigationBreadcrumb";
import useCurrentUser from "@/hooks/useCurrentUser";
import {
  useUpdateMeMutation,
  useUploadMyAvatarMutation,
} from "@/services/users.api";
// ✅ NEW
import ImgWithFallback from "@/components/ImgWithFallback";
import Cropper from "react-easy-crop"; // npm i react-easy-crop

/**
 * Avatar upload requirements implemented:
 * - User can pick an image and crop it (square) before upload
 * - Final image is client-side processed to be < 2 MB
 * - Optional downscaling to a target size for consistent avatars
 */

const TZ_OPTIONS = [
  "Asia/Kolkata",
  "UTC",
  "Asia/Dubai",
  "Asia/Kathmandu",
  "Asia/Dhaka",
];

// ===== Helpers for cropping & compression =====
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const TARGET_PX = 512; // final avatar resolution (square)

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function getCroppedBlob({ imageSrc, cropPixels, mime = "image/jpeg" }) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  // Draw cropped area first
  const { width, height, x, y } = cropPixels;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  // Now scale to TARGET_PX square for consistency
  const out = document.createElement("canvas");
  out.width = TARGET_PX;
  out.height = TARGET_PX;
  const octx = out.getContext("2d");
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(canvas, 0, 0, TARGET_PX, TARGET_PX);

  // Export under the size limit; lower quality until < 2MB
  let quality = 0.92; // start high
  let blob = await new Promise((res) => out.toBlob(res, mime, quality));
  while (blob && blob.size > MAX_SIZE_BYTES && quality > 0.4) {
    quality -= 0.1;
    blob = await new Promise((res) => out.toBlob(res, mime, quality));
  }
  // If still too large, fallback to PNG->JPEG or final pass at lower size
  if (blob && blob.size > MAX_SIZE_BYTES) {
    // try another downscale step if huge
    const fallback = document.createElement("canvas");
    const smaller = Math.max(256, Math.round(TARGET_PX * 0.75));
    fallback.width = smaller;
    fallback.height = smaller;
    fallback.getContext("2d").drawImage(out, 0, 0, smaller, smaller);
    quality = 0.85;
    blob = await new Promise((res) => fallback.toBlob(res, mime, quality));
  }
  return blob;
}

function blobToFile(blob, filename) {
  return new File([blob], filename, { type: blob.type });
}

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

  // ===== Avatar & Crop state =====
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileUrl, setFileUrl] = useState(null); // object URL for original file
  const urlRef = useRef(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      // cleanup any object URLs when unmounting
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  function onFileChange(e) {
    setError("");
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    // allow picking any size, but warn if too huge to process comfortably (> 20MB)
    if (f.size > 20 * 1024 * 1024) {
      setError("Image is too large (max 20MB to open). Pick a smaller one.");
      return;
    }
    // Create object URL for cropper
    const url = URL.createObjectURL(f);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = url;
    setFileUrl(url);
    setShowCropper(true);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  }

  async function handleCropConfirm() {
    try {
      setError("");
      if (!fileUrl || !croppedAreaPixels) return;
      const blob = await getCroppedBlob({
        imageSrc: fileUrl,
        cropPixels: croppedAreaPixels,
      });
      if (!blob) {
        setError("Failed to crop the image. Try again.");
        return;
      }
      if (blob.size > MAX_SIZE_BYTES) {
        setError(
          "Cropped image exceeds 2 MB even after compression. Try a smaller crop or source."
        );
        return;
      }
      const file = blobToFile(blob, "avatar.jpg");
      const url = URL.createObjectURL(file);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setPreviewUrl(url); // show final preview
      setShowCropper(false);
    } catch (err) {
      setError("Something went wrong while processing the image.");
    }
  }

  function handleCropCancel() {
    setShowCropper(false);
    // keep previous preview if any
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  }

  async function onUploadAvatar(e) {
    e.preventDefault();
    setError("");
    try {
      // previewUrl is an object URL backed by our processed File (via blob)
      if (!previewUrl) return;
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      if (blob.size > MAX_SIZE_BYTES) {
        setError("Please ensure the final image is under 2 MB.");
        return;
      }
      const file = blobToFile(blob, "avatar.jpg");
      await uploadAvatar(file).unwrap(); // invalidates ME
    } catch (err) {
      setError("Failed to upload avatar.");
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

        {/* Avatar upload w/ crop */}
        <form
          onSubmit={onUploadAvatar}
          className="mb-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <div>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="block w-full text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Pick an image to crop. Final upload must be under 2 MB.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!previewUrl || uploadState.isLoading}
              className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
              {uploadState.isLoading ? "Uploading…" : "Upload photo"}
            </button>
            {uploadState.isError && (
              <span className="text-sm text-red-600">Failed to upload</span>
            )}
            {uploadState.isSuccess && (
              <span className="text-sm text-emerald-700">Saved</span>
            )}
          </div>
        </form>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Profile form */}
        <ProfileForm
          form={form}
          setForm={setForm}
          onSave={onSave}
          updateState={updateState}
        />
      </div>

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Crop your avatar</h3>
            <div className="relative h-72 w-full overflow-hidden rounded-lg bg-gray-100">
              <Cropper
                image={fileUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition
                showGrid={false}
              />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <label htmlFor="zoom" className="text-sm text-gray-600">
                Zoom
              </label>
              <input
                id="zoom"
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleCropCancel}
                className="rounded border px-3 py-2 text-sm">
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="rounded bg-blue-600 px-3 py-2 text-sm text-white">
                Use cropped photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileForm({ form, setForm, onSave, updateState }) {
  return (
    <form onSubmit={onSave} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="text-sm text-gray-700">Title</label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
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
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
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
              onChange={(e) => setForm((s) => ({ ...s, end: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Time zone</label>
            <select
              className="mt-1 w-full rounded border p-2"
              value={form.tz}
              onChange={(e) => setForm((s) => ({ ...s, tz: e.target.value }))}>
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
  );
}
