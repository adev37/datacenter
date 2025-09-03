// src/modules/users/userModel.js
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

    // ✅ normalize empty -> undefined so it won't hit the unique index
    phone: {
      type: String,
      trim: true,
      set: (v) =>
        typeof v === "string" && v.trim() !== "" ? v.trim() : undefined,
    },

    passwordHash: { type: String, default: "" },
    roles: [{ type: String }],
    branches: [{ type: String }],
    permissions: [{ type: String, default: [] }],

    // optional profile fields your UI is editing
    title: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    profession: { type: String, trim: true },

    shift: {
      start: { type: String, default: "08:00" },
      end: { type: String, default: "18:00" },
      tz: { type: String, default: "Asia/Kolkata" },
    },

    // avatar fields written by the upload endpoint
    avatarUrl: { type: String, default: "" }, // e.g. "/uploads/avatars/xxx.png"
    avatarPath: { type: String, default: "" }, // e.g. "uploads/avatars/xxx.png"
  },
  { timestamps: true }
);

// ✅ keep the DB index aligned with the new behavior
UserSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $type: "string", $ne: "" } },
  }
);

export const User = mongoose.model("User", UserSchema);
