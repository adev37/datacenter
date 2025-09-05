// ESM
import mongoose from "mongoose";
const { Schema } = mongoose;

const MRNCounterSchema = new Schema(
  {
    // Use branch code string, not ObjectId
    branchId: { type: String, required: true, index: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "mrn_counters" }
);

// one counter per branch
MRNCounterSchema.index({ branchId: 1 }, { unique: true });

export default mongoose.model("MRNCounter", MRNCounterSchema);
