// src/scripts/seedRoles.js
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { Role } from "#modules/roles/roleModel.js";
import { PERMS } from "#modules/roles/permissions.js";
import { User } from "#modules/users/userModel.js";

async function main() {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/datacenter";
  const resetSuper = String(process.env.SEED_RESET_SUPER || "").trim() === "1";

  console.log("[seed] Connecting:", mongoUri);
  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== "production",
  });

  // Helpful in dev; won’t error if already present
  await Promise.allSettled([
    Role.collection.createIndex({ name: 1 }, { unique: true }),
    User.collection.createIndex({ email: 1 }, { unique: true }),
  ]);

  // ---------- Roles ----------
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

  // Upsert all roles in a single bulk
  const roleOps = Object.entries(ROLE).map(
    ([name, { scope, permissions }]) => ({
      updateOne: {
        filter: { name },
        update: { $set: { name, scope, permissions } },
        upsert: true,
      },
    })
  );
  await Role.bulkWrite(roleOps);
  console.log("[seed] Roles upserted:", Object.keys(ROLE).length);

  // ---------- Super Admin ----------
  const email = "super@admin.local";
  const defaultPassword = "ChangeMe123!";

  let superAdmin = await User.findOne({ email });

  if (!superAdmin) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    superAdmin = await User.create({
      email,
      name: "Super Admin",
      passwordHash,
      roles: ["SUPER_ADMIN"],
      branches: [],
    });
    console.log(`✅ Super Admin created: ${email} / ${defaultPassword}`);
  } else {
    // Ensure role is present
    if (
      !Array.isArray(superAdmin.roles) ||
      !superAdmin.roles.includes("SUPER_ADMIN")
    ) {
      await User.updateOne(
        { _id: superAdmin._id },
        { $addToSet: { roles: "SUPER_ADMIN" } }
      );
      console.log("ℹ️ Ensured SUPER_ADMIN role on existing user.");
    }
    // Optional password reset
    if (resetSuper) {
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      await User.updateOne({ _id: superAdmin._id }, { $set: { passwordHash } });
      console.log(
        `🔁 Super Admin password reset to default: ${defaultPassword}`
      );
    } else {
      console.log("ℹ️ Super Admin already exists; password unchanged.");
    }
  }

  await mongoose.disconnect();
  console.log("✅ Seed complete.");
}

main().catch(async (e) => {
  console.error("❌ Seed error:", e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
