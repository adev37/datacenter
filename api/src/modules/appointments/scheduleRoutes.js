// ESM
import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { permit } from "#middlewares/rbac.js";
import { PERMS } from "#permissions";
import { validate as v } from "#middlewares/validate.js";
import * as ctrl from "./scheduleController.js";

import {
  getScheduleSchema,
  upsertTemplateSchema,
  createBlockSchema,
} from "./schemas.js";

const r = Router();
r.use(requireAuth);

// read availability
r.get(
  "/",
  permit(PERMS.APPOINTMENT_READ),
  v(getScheduleSchema),
  ctrl.getSchedule
);

// manage templates and ad-hoc blocks
r.post(
  "/templates",
  permit(PERMS.APPOINTMENT_WRITE),
  v(upsertTemplateSchema),
  ctrl.upsertTemplate
);

r.post(
  "/blocks",
  permit(PERMS.APPOINTMENT_WRITE),
  v(createBlockSchema),
  ctrl.createBlock
);

export default r;
