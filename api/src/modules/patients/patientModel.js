// ESM
import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    branchId: {
      type: String, // e.g., "BR001"
      index: true,
      required: true,
    },

    // MRN is not globally unique; uniqueness is per-branch via compound index below
    mrn: { type: String, trim: true, index: true },

    status: {
      type: String,
      enum: ["active", "inactive", "deceased"],
      default: "active",
      index: true,
    },

    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },

    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    maritalStatus: { type: String },

    phone: { type: String, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },

    address: String,
    city: String,
    state: String,
    zip: String,

    photoUrl: String,

    insurance: {
      provider: String,
      plan: String,
      policyNo: String,
      coverage: String,
    },

    emergency: {
      name: String,
      relationship: String,
      phone: String,
    },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: "patients" }
);

// Full-text index for search
PatientSchema.index(
  {
    mrn: "text",
    firstName: "text",
    lastName: "text",
    phone: "text",
    email: "text",
  },
  {
    name: "patient_text_idx",
    default_language: "none",
    weights: { mrn: 5, lastName: 4, firstName: 3 },
  }
);

// ✅ Unique per-branch MRN
PatientSchema.index({ branchId: 1, mrn: 1 }, { unique: true, sparse: true });

export default mongoose.model("Patient", PatientSchema);
