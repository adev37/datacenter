// ESM
import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { permit } from "#middlewares/rbac.js";
import { validate } from "#middlewares/validate.js";
import { z } from "zod";
import * as ctrl from "./patientEncounterController.js";
import { PERMS } from "#permissions";

const router = Router({ mergeParams: true });

const bodySchema = z.object({
  status: z.enum(["draft", "finalized"]).optional(),
  type: z.string().optional(),
  soap: z
    .object({
      subjective: z.string().optional(),
      objective: z.string().optional(),
      assessment: z.string().optional(),
      plan: z.string().optional(),
    })
    .optional(),
  vitals: z
    .object({
      temperature: z.string().optional(),
      bloodPressure: z.string().optional(),
      heartRate: z.string().optional(),
      respiratoryRate: z.string().optional(),
      oxygenSaturation: z.string().optional(),
      weight: z.string().optional(),
      height: z.string().optional(),
    })
    .optional(),
});

const listQuery = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  type: z.string().optional(),
});

router.use(requireAuth);

router.get(
  "/",
  permit(PERMS.ENCOUNTER_READ),
  validate({ query: listQuery }),
  ctrl.list
);
router.post(
  "/",
  permit(PERMS.ENCOUNTER_WRITE),
  validate({ body: bodySchema }),
  ctrl.create
);
router.patch(
  "/:id",
  permit(PERMS.ENCOUNTER_WRITE),
  validate({ body: bodySchema }),
  ctrl.update
);

export default router;
