// ESM
import MRNCounter from "./mrnCounterModel.js";
import * as repo from "./patientRepository.js";
import PatientNote from "./patientNoteModel.js";

async function generateMRN(branchId) {
  const year = new Date().getFullYear();
  const { seq } = await MRNCounter.findOneAndUpdate(
    { branchId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  const padded = String(seq).padStart(6, "0");
  return `MRN-${year}-${padded}`;
}

export const createPatient = async ({ branchId, data }) => {
  const doc = { ...data, branchId };
  if (!doc.mrn) doc.mrn = await generateMRN(branchId);
  return repo.create(doc);
};

export const updatePatient = ({ branchId = null, id, data }) =>
  repo.updateById(id, branchId, data);

export const getPatient = ({ branchId = null, id }) => repo.byId(id, branchId);

export const listPatients = (args) => repo.search(args);

/** Deactivate = status: 'inactive' (does not hide) */
export const softDeletePatient = async ({ id, branchId = null, by }) => {
  const doc = await repo.setStatusById(id, branchId, "inactive", {
    deactivatedAt: new Date(),
    deactivatedBy: by,
  });
  return !!doc; // true if found & updated
};

/** Reactivate = status: 'active' (works even if previously deactivated) */
export const restorePatient = async ({ id, branchId = null, by }) =>
  repo.setStatusById(id, branchId, "active", {
    restoredAt: new Date(),
    restoredBy: by,
  });

/** Optional: real archive/unarchive if you ever add an “Archive” button */
export const archivePatient = ({ id, branchId = null, by }) =>
  repo.markDeleted(id, branchId, by);
export const unarchivePatient = ({ id, branchId = null, by }) =>
  repo.restoreFromDeleted(id, branchId, by);

/* ---------------- Notes ---------------- */
export const listNotes = ({ patientId, branchId = null }) =>
  PatientNote.find({ patientId, ...(branchId ? { branchId } : {}) })
    .sort({ createdAt: -1 })
    .lean();

export const addNote = ({ patientId, branchId, text, authorId }) =>
  PatientNote.create({ patientId, branchId, text, authorId });
