// ESM
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Notification audience model.
 * - audience: "BRANCH" => visible to all users of branchId
 * - audience: "USER"   => visible only to listed userIds
 * - readBy: userIds who have read the item (for per-user read state)
 */
const NotificationSchema = new Schema(
  {
    audience: {
      type: String,
      enum: ["BRANCH", "USER"],
      default: "BRANCH",
      index: true,
    },
    branchId: { type: String, index: true }, // required for BRANCH audience
    userIds: [{ type: String, index: true }], // used for USER audience
    kind: { type: String, default: "info", index: true }, // e.g., "patient.created"
    title: { type: String, required: true },
    message: { type: String, default: "" },
    data: { type: Object, default: {} }, // e.g., { patientId, mrn }
    readBy: [{ type: String, index: true }], // userIds who read it
  },
  { timestamps: true, collection: "notifications" }
);

NotificationSchema.index({ createdAt: -1 });
export default mongoose.model("Notification", NotificationSchema);
