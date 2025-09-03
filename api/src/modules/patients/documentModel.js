// src/modules/patients/documentModel.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const StorageSchema = new Schema(
  {
    provider: { type: String, trim: true, default: "s3" }, // s3|gcs|minio|local
    bucket: { type: String, trim: true },
    key: { type: String, trim: true }, // object key/path
    etag: { type: String, trim: true },
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
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    kind: {
      type: String,
      trim: true,
      enum: ["id", "consent", "report", "scan", "other"],
      default: "other",
    },
    name: { type: String, required: true, trim: true }, // file name shown in UI
    mime: { type: String, trim: true },
    size: { type: Number, min: 0 },

    storage: { type: StorageSchema, default: {} },

    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Common feeds/listing
PatientDocumentSchema.index({ patientId: 1, createdAt: -1 });
PatientDocumentSchema.index({ branchId: 1, createdAt: -1 });

export default mongoose.model("PatientDocument", PatientDocumentSchema);
