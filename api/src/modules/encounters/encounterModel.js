// ESM
import mongoose from "mongoose";
const { Schema } = mongoose;

const SoapSchema = new Schema(
  {
    subjective: { type: String, trim: true },
    objective: { type: String, trim: true },
    assessment: { type: String, trim: true },
    plan: { type: String, trim: true },
  },
  { _id: false }
);

const VitalsSchema = new Schema(
  {
    temperature: String,
    bloodPressure: String,
    heartRate: String,
    respiratoryRate: String,
    oxygenSaturation: String,
    weight: String,
    height: String,
  },
  { _id: false }
);

const EncounterSchema = new Schema(
  {
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "finalized"],
      default: "draft",
      index: true,
    },
    type: { type: String, trim: true, default: "outpatient" },
    soap: { type: SoapSchema, default: {} },
    vitals: { type: VitalsSchema, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "encounters" }
);

EncounterSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model("Encounter", EncounterSchema);
