// src/middlewares/rbac.js (ESM)

import { Role } from "#modules/roles/roleModel.js";
import { User } from "#modules/users/userModel.js";

// roleName -> { permissions:Set, scope }
const roleCache = new Map();

async function getRole(name) {
  if (!name) return { permissions: new Set(), scope: "BRANCH" };
  if (roleCache.has(name)) return roleCache.get(name);

  const doc = await Role.findOne({ name }).lean();
  const val = doc
    ? { permissions: new Set(doc.permissions || []), scope: doc.scope }
    : { permissions: new Set(), scope: "BRANCH" };

  roleCache.set(name, val);
  return val;
}

export function clearRoleCache(name) {
  if (name) roleCache.delete(name);
  else roleCache.clear();
}

/**
 * Usage: router.get("/path", permit("patient.read"), handler)
 * Multiple perms => user must have all of them.
 */
export function permit(...required) {
  const needs = required.filter((v) => typeof v === "string" && v.length > 0);

  return async (req, res, next) => {
    try {
      const tokenUser = req.user;
      if (!tokenUser)
        return res.status(401).json({ message: "Unauthenticated" });

      // Load a fresh snapshot of the user from DB to avoid stale JWT roles/branches.
      const liveUser = await User.findById(tokenUser.sub)
        .select("roles branches permissions")
        .lean();

      if (!liveUser)
        return res.status(401).json({ message: "Unauthenticated" });

      const roles = Array.isArray(liveUser.roles) ? liveUser.roles : [];
      const isSuper = roles.includes("SUPER_ADMIN");

      // 1) SUPER_ADMIN can do everything everywhere
      if (isSuper) return next();

      // 2) Resolve roles and merge role permissions
      const roleDefs = await Promise.all(roles.map(getRole));
      const perms = new Set();
      for (const r of roleDefs) for (const p of r.permissions) perms.add(p);

      // 3) Merge user-specific permissions (overrides)
      (liveUser.permissions || []).forEach((p) => perms.add(p));

      // 4) Scope checks
      const hasGlobalRole = roleDefs.some((r) => r.scope === "GLOBAL");

      // If the user does NOT have any GLOBAL role, they must:
      //  - send X-Branch-Id
      //  - have access to that branch (be assigned to it)
      if (!hasGlobalRole) {
        const branchId = req.ctx?.branchId;
        if (!branchId) {
          return res.status(400).json({ message: "X-Branch-Id required" });
        }

        const allowed = Array.isArray(liveUser.branches)
          ? liveUser.branches.map(String)
          : [];

        if (!allowed.length || !allowed.includes(String(branchId))) {
          return res.status(403).json({ message: "Branch access denied" });
        }
      }

      // 5) Permission check
      if (needs.length && !needs.every((p) => perms.has(p))) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}

// keep alias
export const rbac = permit;
