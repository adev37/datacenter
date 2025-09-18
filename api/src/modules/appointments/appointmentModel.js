// ESM
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Appointment documents are BRANCH scoped.
 * We denormalize tiny patient/doctor snapshots for fast list UIs.
 */
const PatientSnap = new Schema(
  {
    id: String, // Patient _id as string
    mrn: String,
    name: String,
    phone: String,
    email: String,
  },
  { _id: false }
);

const DoctorSnap = new Schema(
  {
    id: String, // staff/doctor id or user id (string)
    name: String,
    department: String,
  },
  { _id: false }
);

const AppointmentSchema = new Schema(
  {
    branchId: { type: String, required: true, index: true },

    date: { type: String, required: true, index: true }, // "YYYY-MM-DD"
    time: { type: String, required: true }, // "HH:mm"
    durationMin: { type: Number, default: 30, min: 5 },

    status: {
      type: String,
      enum: [
        "scheduled",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "scheduled",
      index: true,
    },

    type: { type: String, default: "consultation", trim: true },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent", "emergency"],
      default: "normal",
    },

    doctorId: { type: String, required: true, index: true },
    doctor: { type: DoctorSnap, default: {} },

    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patient: { type: PatientSnap, default: {} },

    tokenNumber: { type: String, trim: true },
    symptoms: String,
    referredBy: String,
    insuranceProvider: String,
    copayAmount: { type: Number, min: 0 },
    notes: String,

    createdBy: { type: String }, // req.user.sub
    meta: { type: Object, default: {} },

    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: String,
  },
  { timestamps: true, collection: "appointments" }
);

// Speed up main calendar/list queries
AppointmentSchema.index({ branchId: 1, doctorId: 1, date: 1, time: 1 });
AppointmentSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model("Appointment", AppointmentSchema);
