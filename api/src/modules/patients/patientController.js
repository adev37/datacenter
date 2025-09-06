// ESM
import * as svc from "./patientService.js";
import Notification from "#modules/notifications/notificationModel.js";
import Encounter from "#modules/encounters/encounterModel.js";
import Patient from "./patientModel.js";
import { patientPhotoUpload } from "#middlewares/upload.js";
import fs from "node:fs";
import path from "node:path";
import { buildPatientProfileHTML } from "./printTemplate.js";

/** Resolve effective branch. */
function resolveBranchId(req, { allowUnscopedForRead = false } = {}) {
  const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
  const isSuper = roles.includes("SUPER_ADMIN") || roles.includes("ADMIN");
  const fromHeader = req.get?.("x-branch-id") || req.header?.("X-Branch-Id");
  if (fromHeader) return String(fromHeader);
  if (allowUnscopedForRead && isSuper) return null; // unscoped read
  const ctx = req.ctx?.branchId;
  if (!ctx) {
    const err = new Error("Branch context required");
    err.status = 400;
    throw err;
  }
  return ctx;
}

/* ------------------------------- CRUD (API) ------------------------------- */

export async function create(req, res, next) {
  try {
    const branchId = resolveBranchId(req, { allowUnscopedForRead: false });
    const doc = await svc.createPatient({ branchId, data: req.body });
    req.audit?.log?.("patient.create", {
      patientId: String(doc._id),
      branchId,
    });

    await Notification.create({
      audience: "BRANCH",
      branchId,
      kind: "patient.created",
      title: "New patient added",
      message: `${doc.firstName} ${doc.lastName} (${doc.mrn})`,
      data: { patientId: String(doc._id) },
    });

    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const branchId = resolveBranchId(req, { allowUnscopedForRead: false });
    const { id } = req.params;
    const doc = await svc.updatePatient({ branchId, id, data: req.body });
    if (!doc) return res.status(404).json({ message: "Patient not found" });
    req.audit?.log?.("patient.update", { patientId: id, branchId });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function getOne(req, res, next) {
  try {
    const branchId = resolveBranchId(req, { allowUnscopedForRead: true });
    const { id } = req.params;
    const doc = await svc.getPatient({ branchId, id });
    if (!doc) return res.status(404).json({ message: "Patient not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function list(req, res, next) {
  try {
    const branchId = resolveBranchId(req, { allowUnscopedForRead: true });
    const { search, gender, status, sort = "name" } = req.query;
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(100, Number(req.query.limit ?? 10));

    const out = await svc.listPatients({
      branchId,
      search,
      gender,
      status,
      sort,
      page,
      limit,
    });
    res.json({ ...out, page, limit });
  } catch (e) {
    next(e);
  }
}

/* ------------------------- Status / soft-delete etc ------------------------ */

export const setStatus = async (req, res, next) => {
  try {
    const branchId = resolveBranchId(req, { allowUnscopedForRead: false });
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "deceased"].includes(String(status))) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const doc = await Patient.findOneAndUpdate(
      { _id: id, ...(branchId ? { branchId } : {}), isDeleted: { $ne: true } },
      { $set: { status } },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Patient not found" });

    await Notification.create({
      audience: "BRANCH",
      branchId,
      kind: "patient.status",
      title: "Patient status updated",
      message: `${doc.firstName} ${doc.lastName} → ${status}`,
      data: { patientId: String(doc._id), status },
    });

    req.audit?.log?.("patient.status", { patientId: id, branchId, status });
    res.json(doc);
  } catch (e) {
    next(e);
  }
};

/**
 * Deactivate WITHOUT hiding from list:
 * - DO NOT set isDeleted
 * - Only set status: "inactive"
 */
export const softDelete = async (req, res, next) => {
  try {
    const branchId = resolveBranchId(req, { allowUnscopedForRead: false });
    const { id } = req.params;

    const doc = await Patient.findOneAndUpdate(
      { _id: id, ...(branchId ? { branchId } : {}) },
      { $set: { status: "inactive" } },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Patient not found" });

    await Notification.create({
      audience: "BRANCH",
      branchId,
      kind: "patient.deactivated",
      title: "Patient deactivated",
      message: `${doc.firstName} ${doc.lastName} (${doc.mrn})`,
      data: { patientId: String(doc._id) },
    });

    req.audit?.log?.("patient.deactivate", { patientId: id, branchId });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

/**
 * Keep this for legacy rows that already have isDeleted: true.
 * It will bring them back and set status to active.
 */
export const restore = async (req, res, next) => {
  try {
    const branchId = resolveBranchId(req, { allowUnscopedForRead: false });
    const { id } = req.params;

    const doc = await Patient.findOneAndUpdate(
      { _id: id, ...(branchId ? { branchId } : {}), isDeleted: true },
      {
        $set: { isDeleted: false, status: "active" },
        $unset: { deletedAt: 1, deletedBy: 1 },
      },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Patient not found" });

    await Notification.create({
      audience: "BRANCH",
      branchId,
      kind: "patient.restored",
      title: "Patient reactivated",
      message: `${doc.firstName} ${doc.lastName} reactivated`,
      data: { patientId: String(doc._id) },
    });

    req.audit?.log?.("patient.restore", { patientId: id, branchId });
    res.json(doc);
  } catch (e) {
    next(e);
  }
};

/* ------------------------------- Photo upload ------------------------------ */
export const uploadPhoto = [
  patientPhotoUpload, // multer
  async (req, res, next) => {
    try {
      const branchId = resolveBranchId(req, { allowUnscopedForRead: false });
      const { id } = req.params;
      if (!req.file)
        return res.status(400).json({ message: "photo file is required" });

      const relPath = path.posix.join("patients", path.basename(req.file.path));
      const photoUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/${relPath}`;

      const doc = await Patient.findOneAndUpdate(
        {
          _id: id,
          ...(branchId ? { branchId } : {}),
          isDeleted: { $ne: true },
        },
        { $set: { photoUrl } },
        { new: true }
      ).lean();

      if (!doc) {
        fs.promises.unlink(req.file.path).catch(() => {});
        return res.status(404).json({ message: "Patient not found" });
      }

      req.audit?.log?.("patient.photo", { patientId: id, branchId });
      res.json({ ok: true, photoUrl });
    } catch (e) {
      next(e);
    }
  },
];

/* ------------------------------- Print profile ----------------------------- */
export const printProfile = async (req, res, next) => {
  try {
    resolveBranchId(req, { allowUnscopedForRead: true });
    const { id } = req.params;

    const patient = await svc.getPatient({ id }); // no branch filter here
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const encounters = await Encounter.find({
      patientId: id,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const html = buildPatientProfileHTML({
      patient: { ...(patient.toObject?.() || patient) },
      encounters,
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) {
    next(e);
  }
};

/* ---------------------------------- Notes --------------------------------- */
export const listNotes = async (req, res, next) => {
  try {
    const branchId = resolveBranchId(req, { allowUnscopedForRead: true });
    const { id: patientId } = req.params;
    const items = await svc.listNotes({ patientId, branchId });
    res.json(items);
  } catch (e) {
    next(e);
  }
};

export const addNote = async (req, res, next) => {
  try {
    const branchId = resolveBranchId(req, { allowUnscopedForRead: false });
    const { id: patientId } = req.params;
    const { text } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: "text is required" });
    }
    const note = await svc.addNote({
      patientId,
      branchId,
      text: String(text).trim(),
      authorId: String(req.user?.sub || ""),
    });
    req.audit?.log?.("patient.note.add", { patientId, branchId });
    res.status(201).json(note);
  } catch (e) {
    next(e);
  }
};
