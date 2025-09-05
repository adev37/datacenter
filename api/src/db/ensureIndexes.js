// ESM
import mongoose from "mongoose";
import Patient from "#modules/patients/patientModel.js";

export async function ensurePatientIndexes() {
  const coll = mongoose.connection.collection("patients");

  // Drop legacy global-unique mrn index if present
  try {
    const indexes = await coll.indexes();
    const hasLegacy = indexes.some((i) => i.name === "mrn_1" && i.unique);
    if (hasLegacy) {
      await coll.dropIndex("mrn_1");
      console.log("[idx] Dropped legacy patients.mrn_1 unique index");
    }
  } catch (e) {
    if (e?.codeName !== "IndexNotFound") {
      console.warn("[idx] Could not check/drop mrn_1:", e.message);
    }
  }

  // Ensure the new compound unique { branchId, mrn } is in place
  await Patient.syncIndexes();
  console.log("[idx] patients indexes synced");
}
