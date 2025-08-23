const { Patient } = require("./patientModel");
const listByBranch = (branchId, limit = 50) =>
  Patient.find(branchId ? { branchId } : {})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
const searchByName = (q) =>
  Patient.find(q ? { name: { $regex: q, $options: "i" } } : {})
    .select("mrn name dob sex phones")
    .limit(20)
    .lean();
const createOne = (d) => Patient.create(d);
module.exports = { listByBranch, searchByName, createOne };
