// api/src/modules/encounters/encounterController.js
const asyncHandler = require("../../utils/asyncHandler");
const Encounter = require("./encounterModel");

function resolveBranchId(req) {
  const isAdmin = req.user?.roles?.includes("Admin");
  const headerBranch = req.get("x-branch-id");
  if (isAdmin && headerBranch) return headerBranch;
  if (!req.branchId) {
    const err = new Error("Branch context required");
    err.status = 400;
    throw err;
  }
  return req.branchId;
}

// POST /api/patients/:patientId/encounters
exports.create = asyncHandler(async (req, res) => {
  const branchId = resolveBranchId(req);
  const { patientId } = req.params;

  const enc = await Encounter.create({
    branchId,
    patientId,
    status: req.body.status || "draft", // 'draft' | 'finalized'
    type: req.body.type || "outpatient", // optional
    soap: req.body.soap, // { subjective, objective, assessment, plan }
    vitals: req.body.vitals, // { temperature, bloodPressure, ... }
    createdBy: req.user?._id,
  });

  req.audit?.log("encounter.create", {
    encounterId: enc._id,
    patientId,
    branchId,
  });
  res.status(201).json(enc);
});

// PATCH /api/patients/:patientId/encounters/:id
exports.update = asyncHandler(async (req, res) => {
  const branchId = resolveBranchId(req);
  const { patientId, id } = req.params;

  const enc = await Encounter.findOneAndUpdate(
    { _id: id, patientId, branchId },
    { $set: { ...req.body, updatedBy: req.user?._id } },
    { new: true }
  );

  if (!enc) return res.status(404).json({ message: "Encounter not found" });
  req.audit?.log("encounter.update", { encounterId: id, patientId, branchId });
  res.json(enc);
});

// GET /api/patients/:patientId/encounters (list latest first)
exports.list = asyncHandler(async (req, res) => {
  const branchId = resolveBranchId(req);
  const { patientId } = req.params;
  const { page = 1, limit = 20, type } = req.query;

  const filter = { branchId, patientId };
  if (type) filter.type = type;

  const total = await Encounter.countDocuments(filter);
  const items = await Encounter.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  res.json({ total, page: Number(page), limit: Number(limit), items });
});
