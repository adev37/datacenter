// api/src/modules/users/userModel.js
// ESM

import mongoose from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      index: true,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => emailRegex.test(v),
        message: "Email format is invalid",
      },
    },
    name: { type: String },
    department: { type: String, trim: true },
    registrationNo: { type: String, trim: true }, // medical license, if you use it

    // Normalize empty -> undefined so it won't hit the unique index
    phone: {
      type: String,
      trim: true,
      set: (v) =>
        typeof v === "string" && v.trim() !== "" ? v.trim() : undefined,
    },

    passwordHash: { type: String, default: "" },

    // RBAC
    roles: [{ type: String }], // e.g. ["ADMIN"], ["DOCTOR"], etc.
    branches: [{ type: String }], // e.g. ["BR0001"]
    permissions: [{ type: String, default: [] }], // user-specific overrides

    // Optional profile fields your UI is editing
    title: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    profession: { type: String, trim: true },

    shift: {
      start: { type: String, default: "08:00" },
      end: { type: String, default: "18:00" },
      tz: { type: String, default: "Asia/Kolkata" },
    },

    // Avatar fields written by the upload endpoint
    avatarUrl: { type: String, default: "" }, // e.g. "/uploads/avatars/xxx.png"
    avatarPath: { type: String, default: "" }, // e.g. "uploads/avatars/xxx.png"
  },
  { timestamps: true }
);

// Keep the DB index aligned with the behavior above
UserSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $type: "string", $ne: "" } },
  }
);

export const User = mongoose.model("User", UserSchema);
