// ESM
import mongoose from "mongoose";
const { Schema } = mongoose;

const ReadBySchema = new Schema(
  {
    userId: { type: String, required: true }, // req.user.sub
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const NotificationSchema = new Schema(
  {
    audience: {
      type: String,
      enum: ["USER", "BRANCH", "ALL"],
      default: "BRANCH",
      index: true,
    },
    branchId: { type: String, index: true }, // for audience BRANCH
    userIds: [{ type: String, index: true }], // for audience USER
    kind: { type: String, trim: true }, // e.g. patient.created
    title: { type: String, trim: true },
    message: { type: String, trim: true },
    severity: {
      type: String,
      enum: ["info", "warning", "error"],
      default: "info",
    },
    data: { type: Object, default: {} }, // arbitrary payload (e.g., { patientId })
    readBy: { type: [ReadBySchema], default: [] }, // per-user read markers
  },
  { timestamps: true, collection: "notifications" }
);

// Helpful indexes
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ audience: 1, branchId: 1, createdAt: -1 });
NotificationSchema.index({ audience: 1, userIds: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);
