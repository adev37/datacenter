const { Patient } = require("./patientModel");

async function listPatients(branchId) {
  return Patient.find(branchId ? { branchId } : {})
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
}
async function createPatient(branchId, payload) {
  const mrn = payload.mrn || `MRN${Date.now()}`;
  return Patient.create({ ...payload, mrn, branchId });
}
module.exports = { listPatients, createPatient };
