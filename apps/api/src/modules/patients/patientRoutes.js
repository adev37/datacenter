import { Router } from "express";
import { rbac } from "#middlewares/rbac.js";
import { validate } from "#middlewares/validate.js"; // your wrapper
import * as ctrl from "./patientController.js";
import {
  createPatientSchema,
  updatePatientSchema,
  searchPatientsSchema,
} from "./schemas.js";

const router = Router();

// Search/list
router.get(
  "/",
  rbac("patient.read"),
  validate(searchPatientsSchema),
  ctrl.search
);
router.get(
  "/search",
  rbac("patient.read"),
  validate(searchPatientsSchema),
  ctrl.search
);

// CRUD
router.post(
  "/",
  rbac("patient.write"),
  validate(createPatientSchema),
  ctrl.create
);
router.get("/:id", rbac("patient.read"), ctrl.getById);
router.patch(
  "/:id",
  rbac("patient.write"),
  validate(updatePatientSchema),
  ctrl.update
);

// Documents (optional v1)
router.post("/:id/documents", rbac("patient.write"), ctrl.uploadDoc);

export default router;
