// ESM
import MRNCounter from "./mrnCounterModel.js";
import * as repo from "./patientRepository.js";

/** Format: MRN-<YYYY>-<BRANCHSEQ> (seq is zero-padded to 6) */
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

export const updatePatient = ({ branchId, id, data }) =>
  repo.updateById(id, branchId, data);

export const getPatient = ({ branchId, id }) => repo.byId(id, branchId);

export const listPatients = (args) => repo.search(args);
