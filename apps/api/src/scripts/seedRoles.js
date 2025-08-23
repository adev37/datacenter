require("module-alias/register");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Role } = require("modules/roles/roleModel");
const { PERMS } = require("modules/roles/permissions");
const { User } = require("modules/users/userModel");

async function main() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/datacenter"
  );

  const ROLE = {
    SUPER_ADMIN: { scope: "GLOBAL", permissions: Object.values(PERMS) },
    ADMIN: {
      scope: "BRANCH",
      permissions: [
        PERMS.USER_READ,
        PERMS.USER_WRITE,
        PERMS.ROLE_READ,
        PERMS.PATIENT_READ,
        PERMS.PATIENT_WRITE,
        PERMS.APPT_READ,
        PERMS.APPT_WRITE,
        PERMS.QUEUE_NEXT,
        PERMS.ENCOUNTER_READ,
        PERMS.ENCOUNTER_WRITE,
        PERMS.DIAG_WRITE,
        PERMS.PRESC_WRITE,
        PERMS.LAB_ORDER,
        PERMS.RAD_ORDER,
        PERMS.PHARM_DISPENSE,
        PERMS.INVOICE_WRITE,
        PERMS.PAYMENT_WRITE,
        PERMS.REFUND_WRITE,
        PERMS.ITEM_WRITE,
        PERMS.GRN_WRITE,
        PERMS.TRANSFER_WRITE,
        PERMS.ADJUST_WRITE,
        PERMS.LEDGER_READ,
        PERMS.FILE_UPLOAD,
        PERMS.FILE_READ,
      ],
    },
    DOCTOR: {
      scope: "BRANCH",
      permissions: [
        PERMS.ENCOUNTER_READ,
        PERMS.ENCOUNTER_WRITE,
        PERMS.DIAG_WRITE,
        PERMS.PRESC_WRITE,
        PERMS.LAB_ORDER,
        PERMS.RAD_ORDER,
        PERMS.PATIENT_READ,
      ],
    },
    NURSE: {
      scope: "BRANCH",
      permissions: [
        PERMS.VITALS_WRITE,
        PERMS.EMAR_ADMIN,
        PERMS.PATIENT_READ,
        PERMS.ENCOUNTER_READ,
      ],
    },
    FRONT_DESK: {
      scope: "BRANCH",
      permissions: [
        PERMS.PATIENT_WRITE,
        PERMS.APPT_WRITE,
        PERMS.QUEUE_NEXT,
        PERMS.PATIENT_READ,
      ],
    },
    PHARMACY: {
      scope: "BRANCH",
      permissions: [
        PERMS.PHARM_DISPENSE,
        PERMS.PRESC_WRITE,
        PERMS.PATIENT_READ,
      ],
    },
    LAB: {
      scope: "BRANCH",
      permissions: [PERMS.LAB_ORDER, PERMS.LAB_RESULT, PERMS.PATIENT_READ],
    },
    RADIOLOGY: {
      scope: "BRANCH",
      permissions: [PERMS.RAD_ORDER, PERMS.RAD_REPORT, PERMS.PATIENT_READ],
    },
    CASHIER: {
      scope: "BRANCH",
      permissions: [
        PERMS.INVOICE_WRITE,
        PERMS.PAYMENT_WRITE,
        PERMS.REFUND_WRITE,
      ],
    },
    INSURANCE: {
      scope: "BRANCH",
      permissions: [PERMS.CLAIM_WRITE, PERMS.CLAIM_SUBMIT],
    },
    INVENTORY: {
      scope: "BRANCH",
      permissions: [
        PERMS.ITEM_WRITE,
        PERMS.GRN_WRITE,
        PERMS.TRANSFER_WRITE,
        PERMS.ADJUST_WRITE,
        PERMS.LEDGER_READ,
      ],
    },
    HOUSEKEEPING: { scope: "BRANCH", permissions: [] },
    IT: {
      scope: "GLOBAL",
      permissions: [
        PERMS.NOTIFY_SEND,
        PERMS.FILE_UPLOAD,
        PERMS.FILE_READ,
        PERMS.AUDIT_READ,
      ],
    },
  };

  for (const [name, { scope, permissions }] of Object.entries(ROLE)) {
    await Role.updateOne(
      { name },
      { $set: { name, scope, permissions } },
      { upsert: true }
    );
  }

  const email = "super@admin.local";
  const exists = await User.findOne({ email });
  if (!exists) {
    const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
    await User.create({
      email,
      name: "Super Admin",
      passwordHash,
      roles: ["SUPER_ADMIN"],
      branches: [],
    });
  }

  console.log("✅ Seeded roles + super admin:", email, "/ ChangeMe123!");
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
