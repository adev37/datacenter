// src/modules/patients/patientRoutes.js
import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { permit } from "#middlewares/rbac.js";
import { validate } from "#middlewares/validate.js";
import * as ctrl from "./patientController.js";
import {
  createPatientSchema,
  updatePatientSchema,
  searchPatientsSchema,
} from "./schemas.js";

const router = Router();

// All patient endpoints need auth
router.use(requireAuth);

// Search/list
router.get(
  "/",
  permit("patient.read"),
  validate(searchPatientsSchema),
  ctrl.search
);
router.get(
  "/search",
  permit("patient.read"),
  validate(searchPatientsSchema),
  ctrl.search
);

// CRUD
router.post(
  "/",
  permit("patient.write"),
  validate(createPatientSchema),
  ctrl.create
);
router.get("/:id", permit("patient.read"), ctrl.getById);
router.patch(
  "/:id",
  permit("patient.write"),
  validate(updatePatientSchema),
  ctrl.update
);

// Docs (stub ok)
router.post("/:id/documents", permit("patient.write"), ctrl.uploadDoc);

export default router;
