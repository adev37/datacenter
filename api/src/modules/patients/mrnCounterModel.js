// ESM
import mongoose from "mongoose";
const { Schema } = mongoose;

const MRNCounterSchema = new Schema(
  {
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    seq: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "mrn_counters" }
);

MRNCounterSchema.index({ branchId: 1 }, { unique: true });

export default mongoose.model("MRNCounter", MRNCounterSchema);
