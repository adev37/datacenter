const { listPatients, createPatient } = require("./patientService");
async function getPatients(req, res, next) {
  try {
    res.json(await listPatients(req.ctx.branchId));
  } catch (e) {
    next(e);
  }
}
async function postPatient(req, res, next) {
  try {
    res.status(201).json(await createPatient(req.ctx.branchId, req.body));
  } catch (e) {
    next(e);
  }
}
module.exports = { getPatients, postPatient };
