// api/src/modules/roles/roleModel.js
// ESM

import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true }, // e.g. 'SUPER_ADMIN','ADMIN','DOCTOR','IT', ...
    scope: { type: String, enum: ["GLOBAL", "BRANCH"], default: "BRANCH" },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

// Useful indexes
RoleSchema.index({ name: 1 }, { unique: true });

export const Role = mongoose.model("Role", RoleSchema);
