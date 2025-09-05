// ESM
import Encounter from "./encounterModel.js";

/** Resolve effective branch */
function resolveBranchId(req) {
  const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
  const isAdmin = roles.includes("ADMIN"); // 👈 FIXED (all caps)
  const headerBranch = req.get?.("x-branch-id");
  if (isAdmin && headerBranch) return headerBranch;

  const branchId = req.ctx?.branchId;
  if (!branchId) {
    const err = new Error("Branch context required");
    err.status = 400;
    throw err;
  }
  return branchId;
}

/* Create */
export async function create(req, res, next) {
  try {
    const branchId = resolveBranchId(req);
    const { patientId } = req.params;

    const enc = await Encounter.create({
      branchId,
      patientId,
      status: req.body.status || "draft",
      type: req.body.type || "outpatient",
      soap: req.body.soap,
      vitals: req.body.vitals,
      createdBy: req.user?.sub,
    });

    req.audit?.log?.("encounter.create", {
      encounterId: enc._id,
      patientId,
      branchId,
    });
    res.status(201).json(enc);
  } catch (e) {
    next(e);
  }
}

/* Update */
export async function update(req, res, next) {
  try {
    const branchId = resolveBranchId(req);
    const { patientId, id } = req.params;

    const enc = await Encounter.findOneAndUpdate(
      { _id: id, patientId, branchId },
      { $set: { ...req.body, updatedBy: req.user?.sub } },
      { new: true }
    );

    if (!enc) return res.status(404).json({ message: "Encounter not found" });
    req.audit?.log?.("encounter.update", {
      encounterId: id,
      patientId,
      branchId,
    });
    res.json(enc);
  } catch (e) {
    next(e);
  }
}

/* List */
export async function list(req, res, next) {
  try {
    const branchId = resolveBranchId(req);
    const { patientId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const filter = { branchId, patientId };
    if (type) filter.type = type;

    const total = await Encounter.countDocuments(filter);
    const items = await Encounter.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({ total, page: Number(page), limit: Number(limit), items });
  } catch (e) {
    next(e);
  }
}
