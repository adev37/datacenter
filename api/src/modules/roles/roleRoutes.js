// api/src/modules/roles/roleRoutes.js
// ESM

import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { permit, clearRoleCache } from "#middlewares/rbac.js";
import { listRoles, upsertRole } from "#modules/roles/roleService.js";
import { PERMS } from "#permissions";

const r = Router();

/**
 * GET /api/v1/roles
 * List all roles.
 * - Guarded by role.read
 * - Returns { name, scope, permissions } for each role.
 * - Frontend should hide SUPER_ADMIN from Admin users (UX guard).
 */
r.get("/", requireAuth, permit(PERMS.ROLE_READ), async (_req, res, next) => {
  try {
    const roles = await listRoles();
    res.json(roles);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/v1/roles
 * Create/Update a role.
 * - Guarded by role.write
 * - Non-Super Admins:
 *    • cannot modify SUPER_ADMIN at all (403)
 *    • cannot change a role's scope (only its permissions)
 * - Super Admin can set scope and edit any role.
 */
r.post("/", requireAuth, permit(PERMS.ROLE_WRITE), async (req, res, next) => {
  try {
    const isSuper = (req.user?.roles || []).includes("SUPER_ADMIN");
    const { name } = req.body || {};

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
