// src/modules/patients/patientController.js
import * as service from "./patientService.js";
import { asyncHandler } from "#utils/asyncHandler.js";

// GET /patients or /patients/search
export const search = asyncHandler(async (req, res) => {
  const data = await service.searchPatients({
    query: req.query,
    user: req.user,
    ctx: req.ctx,
  });
  res.json(data);
});

// POST /patients
export const create = asyncHandler(async (req, res) => {
  const patient = await service.createPatient({
    body: req.body,
    user: req.user,
    ctx: req.ctx,
    audit: req.audit,
  });
  res.status(201).json(patient);
});

// GET /patients/:id
export const getById = asyncHandler(async (req, res) => {
  const patient = await service.getPatient({ id: req.params.id });
  if (!patient) return res.status(404).json({ message: "Patient not found" });
  res.json(patient);
});

// PATCH /patients/:id
export const update = asyncHandler(async (req, res) => {
  const patient = await service.updatePatient({
    id: req.params.id,
    body: req.body,
    user: req.user,
  });
  if (!patient) return res.status(404).json({ message: "Patient not found" });
  res.json(patient);
});

// POST /patients/:id/documents (placeholder -> integrate storage later)
export const uploadDoc = asyncHandler(async (_req, res) => {
  // Hand off to modules/documents/storageService.js when ready
  res.status(201).json({ ok: true });
});
