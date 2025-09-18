// ESM
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Weekly template per doctor (branch scoped)
 * slots: working windows; stepMin controls grid
 * breaks: static breaks inside working windows
 * exceptions: date-based overrides
 */
const Window = new Schema(
  { from: String, to: String, stepMin: { type: Number, default: 30 } },
  { _id: false }
);
const Break = new Schema({ from: String, to: String }, { _id: false });

const Exception = new Schema(
  {
    date: String, // "YYYY-MM-DD"
    blocks: [Break],
  },
  { _id: false }
);

const ScheduleTemplateSchema = new Schema(
  {
    branchId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6, index: true },
    slots: { type: [Window], default: [] },
    breaks: { type: [Break], default: [] },
    exceptions: { type: [Exception], default: [] },
  },
  { timestamps: true, collection: "doctor_schedules" }
);

ScheduleTemplateSchema.index(
  { branchId: 1, doctorId: 1, dayOfWeek: 1 },
  { unique: true }
);

export default mongoose.model("ScheduleTemplate", ScheduleTemplateSchema);
