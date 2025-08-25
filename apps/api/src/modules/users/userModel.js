// src/modules/users/userModel.js (ESM)

import mongoose from "mongoose";

const emailRegex =
  // simple, fast format check; we still normalize & check uniqueness
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      index: true,
      required: true,
      lowercase: true, // normalize
      trim: true, // normalize
      validate: {
        validator: (v) => emailRegex.test(v),
        message: "Email format is invalid",
      },
    },
    name: { type: String },
    passwordHash: { type: String, default: "" },
    roles: [{ type: String }],
    branches: [{ type: String }],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
