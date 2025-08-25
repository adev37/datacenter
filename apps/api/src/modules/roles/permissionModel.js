// src/modules/roles/permissionModel.js (ESM)

import mongoose from "mongoose";

// ------------------------------------------------------------
// Permission Schema
// ------------------------------------------------------------
// Each Permission document represents a unique permission key
// that can be assigned to Roles. This ensures consistency and
// allows easier permission management across the system.
// ------------------------------------------------------------

const PermissionSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true }, // e.g. "user.read"
  },
  { timestamps: true }
);

export const Permission = mongoose.model("Permission", PermissionSchema);
