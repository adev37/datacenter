import mongoose from "mongoose";
const { Schema } = mongoose;

const NameSchema = new Schema(
  {
    first: { type: String, trim: true },
    middle: { type: String, trim: true },
    last: { type: String, trim: true },
    full: { type: String, trim: true },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

const ConsentSchema = new Schema(
  {
    type: { type: String, trim: true },
    givenAt: { type: Date },
    by: { type: String, trim: true },
  },
  { _id: false }
);

const PatientSchema = new Schema(
  {
    mrn: { type: String, required: true, unique: true, index: true },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    name: { type: NameSchema, default: {} },
    dob: { type: Date },
    sex: { type: String, enum: ["M", "F", "O", "U"], default: "U" },

    phones: [{ type: String, trim: true }],
    email: { type: String, trim: true },
    addresses: [AddressSchema],
    alerts: [{ type: String, trim: true }],
    consents: [ConsentSchema],

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Sort-heavy views by branch + time
PatientSchema.index({ branchId: 1, createdAt: -1 });
PatientSchema.index({ "name.full": 1 });

// Auto-build full name if not provided
PatientSchema.pre("save", function (next) {
  if (this.name) {
    const parts = [this.name.first, this.name.middle, this.name.last].filter(
      Boolean
    );
    if (!this.name.full) this.name.full = parts.join(" ").trim();
  }
  next();
});

export default mongoose.model("Patient", PatientSchema);
