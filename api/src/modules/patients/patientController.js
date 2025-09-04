// ESM
import * as svc from "./patientService.js";

function resolveBranchId(req) {
  // Admin can switch branches via header; others must send X-Branch-Id pre-set in req.ctx
  const isAdmin = req.user?.roles?.includes("Admin");
  const headerBranch = req.get("x-branch-id");
  if (isAdmin && headerBranch) return headerBranch;
  const branchId = req.ctx?.branchId;
  if (!branchId) {
    const e = new Error("Branch context required");
    e.status = 400;
    throw e;
  }
  return branchId;
}

export const create = async (req, res, next) => {
  try {
    const branchId = resolveBranchId(req);
    const patient = await svc.createPatient({ branchId, data: req.body });
    req.audit?.log?.("patient.create", { patientId: patient._id, branchId });
    res.status(201).json(patient);
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const branchId = resolveBranchId(req);
    const { id } = req.params;
    const patient = await svc.updatePatient({ branchId, id, data: req.body });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    req.audit?.log?.("patient.update", { patientId: id, branchId });
    res.json(patient);
  } catch (e) {
    next(e);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const branchId = resolveBranchId(req);
    const { id } = req.params;
    const patient = await svc.getPatient({ branchId, id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (e) {
    next(e);
  }
};

export const list = async (req, res, next) => {
  try {
    const branchId = resolveBranchId(req);
    const {
      search,
      gender,
      status,
      sort = "name",
      page = 1,
      limit = 10,
    } = req.query;
    const result = await svc.listPatients({
      branchId,
      search,
      gender,
      status,
      sort,
      page: Number(page),
      limit: Number(limit),
    });
    res.json({
      total: result.total,
      page: Number(page),
      limit: Number(limit),
      items: result.items,
    });
  } catch (e) {
    next(e);
  }
};
