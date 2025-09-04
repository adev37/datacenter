// api/src/middlewares/upload.js
// ESM

import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const root = process.cwd();
const uploadRoot = path.join(root, "uploads");
const avatarDir = path.join(uploadRoot, "avatars");

// Ensure folders exist
for (const dir of [uploadRoot, avatarDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    // user-<id>-<timestamp>.<ext>
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)
      ? ext
      : ".jpg";
    const base = `user-${req.user?.sub || "anon"}-${Date.now()}${safeExt}`;
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
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
}).single("avatar");
