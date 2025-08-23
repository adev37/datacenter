const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    mrn: { type: String, unique: true, index: true },
    name: String,
    dob: Date,
    sex: String,
    phones: [String],
    addresses: [{}],
    alerts: [String],
    branchId: { type: String, index: true },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", PatientSchema);
module.exports = { Patient };
