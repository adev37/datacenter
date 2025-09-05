import mongoose from "mongoose";
const { Schema } = mongoose;

const StorageSchema = new Schema(
  {
    provider: { type: String, trim: true, default: "s3" },
    bucket: String,
    key: String,
    etag: String,
  },
  { _id: false }
);

const PatientDocumentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    // Use string branch code to match the rest of the system
    branchId: { type: String, required: true, index: true },
    kind: {
      type: String,
      trim: true,
      enum: ["id", "consent", "report", "scan", "other"],
      default: "other",
    },
    name: { type: String, required: true, trim: true },
    mime: { type: String, trim: true },
    size: { type: Number, min: 0 },
    storage: { type: StorageSchema, default: {} },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

PatientDocumentSchema.index({ patientId: 1, createdAt: -1 });
PatientDocumentSchema.index({ branchId: 1, createdAt: -1 });

export default mongoose.model("PatientDocument", PatientDocumentSchema);
