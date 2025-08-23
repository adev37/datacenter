const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true },
    name: String,
    passwordHash: String,
    roles: [{ type: String }], // e.g., ['ADMIN','DOCTOR']
    branches: [{ type: String }], // branch IDs user can access
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = { User };
