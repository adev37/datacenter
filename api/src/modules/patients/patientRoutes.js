// ESM
import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { permit } from "#middlewares/rbac.js";
import { validate } from "#middlewares/validate.js";
import * as ctrl from "./patientController.js";
import {
  createPatientSchema,
  updatePatientSchema,
  listPatientsSchema,
} from "./schemas.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  permit("patients:read"),
  validate(listPatientsSchema),
  ctrl.list
);
router.post(
  "/",
  permit("patients:create"),
  validate(createPatientSchema),
  ctrl.create
);
router.get("/:id", permit("patients:read"), ctrl.getOne);
router.patch(
  "/:id",
  permit("patients:update"),
  validate(updatePatientSchema),
  ctrl.update
);

export default router;
