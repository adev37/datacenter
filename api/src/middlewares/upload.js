// api/src/middlewares/upload.js
// ESM

import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const root = process.cwd();
const uploadRoot = path.join(root, "uploads");
const avatarDir = path.join(uploadRoot, "avatars");
const patientDir = path.join(uploadRoot, "patients");

// Ensure folders exist
for (const dir of [uploadRoot, avatarDir, patientDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const imgExtOk = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
function safeExt(original) {
  const ext = path.extname(original || "").toLowerCase();
  return imgExtOk.includes(ext) ? ext : ".jpg";
}

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const base = `user-${req.user?.sub || "anon"}-${Date.now()}${safeExt(
      file.originalname
    )}`;
    cb(null, base);
  },
});

const patientStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, patientDir),
  filename: (req, file, cb) => {
    const id = req.params?.id || "unknown";
    const base = `patient-${id}-${Date.now()}${safeExt(file.originalname)}`;
    cb(null, base);
  },
});

function fileFilter(_req, file, cb) {
  const ok =
    file.mimetype?.startsWith("image/") &&
    /jpe?g|png|gif|webp$/i.test(file.mimetype);
  cb(ok ? null : new Error("Only image files are allowed"), ok);
}

export const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single("avatar");

export const patientPhotoUpload = multer({
  storage: patientStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single("photo");
