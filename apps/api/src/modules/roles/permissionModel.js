const mongoose = require("mongoose");
const PermissionSchema = new mongoose.Schema(
  { key: { type: String, unique: true } },
  { timestamps: true }
);
const Permission = mongoose.model("Permission", PermissionSchema);
module.exports = { Permission };
