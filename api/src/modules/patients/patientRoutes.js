// ESM
import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import * as RBAC from "#middlewares/rbac.js";
import { validate } from "#middlewares/validate.js";
import { PERMS } from "#permissions";
import * as ctrl from "./patientController.js";
import { z } from "zod";
import {
  createPatientSchema,
  updatePatientSchema,
  listPatientsSchema,
} from "./schemas.js";

const router = Router();
const permit = RBAC.permit || RBAC.hasPerm;

router.use(requireAuth);

// list / create / get / update
router.get(
  "/",
  permit(PERMS.PATIENT_READ),
  validate(listPatientsSchema),
  ctrl.list
);
router.post(
  "/",
  permit(PERMS.PATIENT_WRITE),
  validate(createPatientSchema),
  ctrl.create
);
router.get("/:id", permit(PERMS.PATIENT_READ), ctrl.getOne);
router.patch(
  "/:id",
  permit(PERMS.PATIENT_WRITE),
  validate(updatePatientSchema),
  ctrl.update
);

// status
const statusSchema = z.object({
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) }),
  body: z.object({ status: z.enum(["active", "inactive", "deceased"]) }),
});
router.post(
  "/:id/status",
  permit(PERMS.PATIENT_WRITE),
  validate(statusSchema),
  ctrl.setStatus
);

// deactivate (no hide) / restore (legacy)
router.delete("/:id", permit(PERMS.PATIENT_WRITE), ctrl.softDelete);
router.post("/:id/restore", permit(PERMS.PATIENT_WRITE), ctrl.restore);

// photo / print / notes
router.post("/:id/photo", permit(PERMS.PATIENT_WRITE), ctrl.uploadPhoto);
router.get("/:id/print", permit(PERMS.PATIENT_READ), ctrl.printProfile);
router.get("/:id/notes", permit(PERMS.PATIENT_READ), ctrl.listNotes);
router.post("/:id/notes", permit(PERMS.PATIENT_WRITE), ctrl.addNote);

export default router;
