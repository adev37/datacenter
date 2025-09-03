// ESM
import path from "node:path";
import fs from "node:fs";
import { z } from "zod";
import { User } from "#modules/users/userModel.js";

/* ------------------------ helpers ------------------------ */

function toAvatarUrl(req, avatarPath = "") {
  if (!avatarPath) return null;
  const clean = String(avatarPath).replace(/\\/g, "/"); // windows-safe
  return `${req.protocol}://${req.get("host")}/uploads/${clean}`;
}

function toFullName(doc) {
  const parts = [doc.title, doc.firstName, doc.lastName].filter(Boolean);
  return parts.length ? parts.join(" ").trim() : doc.name || "User";
}

function conflictOrNext(e, res, next) {
  // Surface Mongo duplicate key as a 409 (e.g., unique phone)
  if (e?.name === "MongoServerError" && e?.code === 11000) {
    return res.status(409).json({
      message: "Duplicate value on a unique field",
      details: e.keyValue,
    });
  }
  next(e);
}

/* ------------------------ GET /me ------------------------ */

export async function getMe(req, res, next) {
  try {
    const u = await User.findById(req.user.sub).lean();
    if (!u) return res.status(401).json({ message: "Unauthenticated" });

    const out = {
      id: String(u._id),
      email: u.email,
      fullName: toFullName(u),
      title: u.title || "",
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      profession: u.profession || u.jobTitle || "",
      role: { name: (u.roles?.[0] || "").toUpperCase() },
      shift: u.shift || { start: "08:00", end: "18:00", tz: "Asia/Kolkata" },
      avatarUrl: toAvatarUrl(req, u.avatarPath),
      branches: u.branches || [],
      updatedAt: u.updatedAt,
    };

    res.json(out);
  } catch (e) {
    next(e);
  }
}

/* -------------------- PUT/PATCH /users/me -------------------- */

const UpdateSchema = z.object({
  title: z.string().max(40).optional(),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  name: z.string().max(160).optional(), // back-compat
  profession: z.string().max(120).optional(),
  jobTitle: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  shift: z
    .object({
      start: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .optional(),
      end: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .optional(),
      tz: z.string().optional(),
    })
    .optional(),
});

export async function updateMe(req, res, next) {
  try {
    const data = UpdateSchema.parse(req.body || {});
    const u = await User.findById(req.user.sub);
    if (!u) return res.status(401).json({ message: "Unauthenticated" });

    // Whitelist updates
    for (const k of Object.keys(data)) {
      if (k === "shift") {
        u.shift = {
          ...(u.shift?.toObject?.() || u.shift || {}),
          ...data.shift,
        };
      } else if (k === "phone") {
        // schema setter in model turns "" => undefined, avoiding unique dup
        u.phone = data.phone;
      } else {
        u[k] = data[k];
      }
    }

    // Keep legacy "name" coherent when parts exist
    if (!data.name && (data.firstName || data.lastName || data.title)) {
      u.name = toFullName(u);
    }

    await u.save();
    // return normalized shape
    return getMe(req, res, next);
  } catch (e) {
    return conflictOrNext(e, res, next);
  }
}

/* --------------- POST /users/me/avatar (multipart) --------------- */

export async function uploadAvatar(req, res, next) {
  try {
    const u = await User.findById(req.user.sub);
    if (!u) return res.status(401).json({ message: "Unauthenticated" });
    if (!req.file)
      return res.status(400).json({ message: "avatar file is required" });

    // delete previous file (best-effort)
    if (u.avatarPath) {
      const oldAbs = path.join(process.cwd(), "uploads", u.avatarPath);
      fs.promises
        .stat(oldAbs)
        .then(() => fs.promises.unlink(oldAbs))
        .catch(() => {});
    }

    // store path relative to /uploads
    const relPath = path.posix.join("avatars", path.basename(req.file.path));
    u.avatarPath = relPath;
    await u.save();

    res.json({
      ok: true,
      avatarUrl: toAvatarUrl(req, relPath),
      updatedAt: u.updatedAt,
    });
  } catch (e) {
    next(e);
  }
}
