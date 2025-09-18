// ESM
import mongoose from "mongoose";
const { Schema } = mongoose;

/** Ad-hoc blocks (leave/OT/etc.) */
const ScheduleBlockSchema = new Schema(
  {
    branchId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // "YYYY-MM-DD"
    from: { type: String, required: true }, // "HH:mm"
    to: { type: String, required: true },
    reason: { type: String, trim: true },
    createdBy: { type: String },
  },
  { timestamps: true, collection: "schedule_blocks" }
);

ScheduleBlockSchema.index({ branchId: 1, doctorId: 1, date: 1, from: 1 });

export default mongoose.model("ScheduleBlock", ScheduleBlockSchema);
