// src/modules/roles/roleRoutes.js (ESM)

import { Router } from "express";
import { requireAuth } from "#src/middlewares/requireAuth.js";
import { permit } from "#middlewares/rbac.js";
import { listRoles, upsertRole } from "#modules/roles/roleService.js";
import { PERMS } from "#modules/roles/permissions.js";

const r = Router();

r.get("/", requireAuth, permit(PERMS.ROLE_READ), async (_req, res, next) => {
  try {
    const roles = await listRoles();
    res.json(roles);
  } catch (e) {
    next(e);
  }
});

r.post("/", requireAuth, permit(PERMS.ROLE_WRITE), async (req, res, next) => {
  try {
    const role = await upsertRole(req.body);
    res.status(201).json(role);
  } catch (e) {
    next(e);
  }
});

export default r;
