const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true }, // 'SUPER_ADMIN','ADMIN','DOCTOR',...
    scope: { type: String, enum: ["GLOBAL", "BRANCH"], default: "BRANCH" },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", RoleSchema);
module.exports = { Role };
