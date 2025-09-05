// ESM
import mongoose from "mongoose";
const { Schema } = mongoose;

const PatientNoteSchema = new Schema(
  {
    branchId: { type: String, index: true, required: true },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      index: true,
      required: true,
    },
    text: { type: String, trim: true, required: true }, // note content
    authorId: { type: String }, // req.user.sub
  },
  { timestamps: true, collection: "patient_notes" }
);

export default mongoose.model("PatientNote", PatientNoteSchema);
