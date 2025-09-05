// ESM
import MRNCounter from "./mrnCounterModel.js";
import * as repo from "./patientRepository.js";
import PatientNote from "./patientNoteModel.js"; // ← relative path to avoid alias resolution issues

// MRN generator (per-branch)
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

export const softDeletePatient = async ({ id, branchId = null, by }) => {
  const r = await repo.markDeleted(id, branchId, by);
  return r.modifiedCount > 0;
};

/* ---------------- Notes (optional) ---------------- */
export const listNotes = ({ patientId, branchId = null }) =>
  PatientNote.find({ patientId, ...(branchId ? { branchId } : {}) })
    .sort({ createdAt: -1 })
    .lean();

export const addNote = ({ patientId, branchId, text, authorId }) =>
  PatientNote.create({ patientId, branchId, text, authorId });
