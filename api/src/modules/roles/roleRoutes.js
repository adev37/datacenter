// src/modules/roles/roleRoutes.js (ESM)

import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { permit, clearRoleCache } from "#middlewares/rbac.js";
import { listRoles, upsertRole } from "#modules/roles/roleService.js";
import { PERMS } from "#permissions";

const r = Router();

// List all roles
r.get("/", requireAuth, permit(PERMS.ROLE_READ), async (_req, res, next) => {
  try {
    const roles = await listRoles();
    res.json(roles);
  } catch (e) {
    next(e);
  }
});

// Create/Update a role
r.post("/", requireAuth, permit(PERMS.ROLE_WRITE), async (req, res, next) => {
  try {
    const isSuper = (req.user?.roles || []).includes("SUPER_ADMIN");
    const { name } = req.body;

    // Non-super admins cannot modify SUPER_ADMIN role at all
    if (!isSuper && name === "SUPER_ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Non-super admins cannot change scope (only permissions)
    const payload = { ...req.body };
    if (!isSuper) delete payload.scope;

    const role = await upsertRole(payload);

    // Invalidate role permissions cache so changes take effect immediately
    clearRoleCache(role?.name || payload?.name);

    res.status(201).json(role);
  } catch (e) {
    next(e);
  }
});

export default r;
