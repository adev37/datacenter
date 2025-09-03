// src/modules/audit/auditModel.js
import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema(
  {
    at: { type: Date, default: () => new Date() },

    // actor
    actorId: { type: String },
    actorEmail: { type: String },
    actorRoles: [{ type: String }],

    // context
    ip: { type: String },
    ua: { type: String },
    branchId: { type: String },

    // event
    action: { type: String, required: true }, // e.g. "user.create"
    resource: { type: String, default: "users" },
    outcome: {
      type: String,
      enum: ["success", "denied", "error"],
      required: true,
    },
    reason: { type: String }, // e.g. "ADMIN_TRY_CREATE_ADMIN"

    // useful crumbs (kept small on purpose)
    target: { type: Object }, // { email, roles:[...] }
    extra: { type: Object }, // any small payload/flags
  },
  { timestamps: true }
);

// Optional TTL (auto prune after 90 days). Comment out if you want to keep forever.
// AuditSchema.index({ at: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const Audit = mongoose.model("Audit", AuditSchema);
