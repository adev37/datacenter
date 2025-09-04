// api/src/scripts/seedRoles.js
// ESM

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { Role } from "#modules/roles/roleModel.js";
import { PERMS } from "#permissions";
import { User } from "#modules/users/userModel.js";

async function main() {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/datacenter";
  const resetSuper = String(process.env.SEED_RESET_SUPER || "").trim() === "1";

  console.log("[seed] Connecting:", mongoUri);
  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== "production",
  });

  await Promise.allSettled([
    Role.collection.createIndex({ name: 1 }, { unique: true }),
    User.collection.createIndex({ email: 1 }, { unique: true }),
  ]);

  // ───────────────────────────────────────────────────────────────────────────
  // Canonical roles
  //  - SUPER_ADMIN: GLOBAL (full platform)
  //  - ADMIN: BRANCH (single PHC)
  //  - Staff roles: BRANCH
  //  - IT: BRANCH  ✅ (as per Option B)
  // ───────────────────────────────────────────────────────────────────────────
  const ROLE = {
    SUPER_ADMIN: { scope: "GLOBAL", permissions: Object.values(PERMS) },

    ADMIN: {
      scope: "BRANCH",
      permissions: [
        PERMS.USER_READ,
        PERMS.USER_WRITE,
        PERMS.ROLE_READ,
        PERMS.ROLE_WRITE,
        PERMS.FILE_UPLOAD,
        PERMS.FILE_READ,
        PERMS.AUDIT_READ,
        PERMS.SETTINGS_USER,
        PERMS.SETTINGS_ROLE,
        PERMS.SETTINGS_DEPARTMENT,
        PERMS.SETTINGS_PREFERENCES,
        PERMS.PATIENT_READ,
        PERMS.PATIENT_WRITE,
        PERMS.APPOINTMENT_READ,
        PERMS.APPOINTMENT_WRITE,
        PERMS.ENCOUNTER_READ,
        PERMS.ENCOUNTER_WRITE,
        PERMS.VITALS_WRITE,
        PERMS.PRESCRIPTION_WRITE,
        PERMS.LAB_ORDER,
        PERMS.RAD_ORDER,
        PERMS.PHARMACY_DISPENSE,
        PERMS.EMAR_ADMINISTER,
        PERMS.IPD_ADMIT,
        PERMS.IPD_TRANSFER,
        PERMS.IPD_DISCHARGE,
        PERMS.BILLING_INVOICE,
        PERMS.BILLING_PAYMENT,
        PERMS.BILLING_REFUND,
        PERMS.INV_ITEM,
        PERMS.INV_GRN,
        PERMS.INV_TRANSFER,
        PERMS.INV_LEDGER,
        PERMS.INV_ADJUST,
        PERMS.REPORTS_FINANCE,
        PERMS.REPORTS_CLINICAL,
        PERMS.REPORTS_INVENTORY,
        PERMS.STAFF_READ,
        PERMS.STAFF_SCHEDULE,
        PERMS.NOTIFY_SEND,
        PERMS.NOTIFICATIONS_READ,
      ],
    },

    DOCTOR: {
      scope: "BRANCH",
      permissions: [
        PERMS.PATIENT_READ,
        PERMS.APPOINTMENT_READ,
        PERMS.ENCOUNTER_READ,
        PERMS.ENCOUNTER_WRITE,
        PERMS.VITALS_WRITE,
        PERMS.PRESCRIPTION_WRITE,
        PERMS.LAB_ORDER,
        PERMS.RAD_ORDER,
        PERMS.REPORTS_CLINICAL,
      ],
    },

    NURSE: {
      scope: "BRANCH",
      permissions: [
        PERMS.PATIENT_READ,
        PERMS.APPOINTMENT_READ,
        PERMS.ENCOUNTER_READ,
        PERMS.VITALS_WRITE,
        PERMS.EMAR_ADMINISTER,
        PERMS.IPD_ADMIT,
      ],
    },

    FRONT_DESK: {
      scope: "BRANCH",
      permissions: [
        PERMS.PATIENT_READ,
        PERMS.PATIENT_WRITE,
        PERMS.APPOINTMENT_READ,
        PERMS.APPOINTMENT_WRITE,
        PERMS.BILLING_INVOICE,
        PERMS.NOTIFICATIONS_READ,
      ],
    },

    PHARMACY: {
      scope: "BRANCH",
      permissions: [
        PERMS.PATIENT_READ,
        PERMS.PHARMACY_DISPENSE,
        PERMS.PRESCRIPTION_WRITE,
        PERMS.BILLING_PAYMENT,
      ],
    },

    LAB: {
      scope: "BRANCH",
      permissions: [
        PERMS.PATIENT_READ,
        PERMS.LAB_ORDER,
        PERMS.LAB_RESULT,
        PERMS.REPORTS_CLINICAL,
      ],
    },

    RADIOLOGY: {
      scope: "BRANCH",
      permissions: [
        PERMS.PATIENT_READ,
        PERMS.RAD_ORDER,
        PERMS.RAD_REPORT,
        PERMS.REPORTS_CLINICAL,
      ],
    },

    CASHIER: {
      scope: "BRANCH",
      permissions: [
        PERMS.BILLING_INVOICE,
        PERMS.BILLING_PAYMENT,
        PERMS.BILLING_REFUND,
        PERMS.NOTIFICATIONS_READ,
      ],
    },

    INVENTORY: {
      scope: "BRANCH",
      permissions: [
        PERMS.INV_ITEM,
        PERMS.INV_GRN,
        PERMS.INV_TRANSFER,
        PERMS.INV_ADJUST,
        PERMS.INV_LEDGER,
        PERMS.REPORTS_INVENTORY,
      ],
    },

    // ✅ IT is now BRANCH-scoped (local technician per PHC)
    IT: {
      scope: "BRANCH",
      permissions: [
        PERMS.FILE_UPLOAD,
        PERMS.FILE_READ,
        PERMS.NOTIFY_SEND,
        PERMS.NOTIFICATIONS_READ,
        PERMS.AUDIT_READ,
      ],
    },

    HOUSEKEEPING: { scope: "BRANCH", permissions: [] },
  };

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

  // Bootstrap Super Admin
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
