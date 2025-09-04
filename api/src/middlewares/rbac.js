// api/src/middlewares/rbac.js
// ESM

import { Role } from "#modules/roles/roleModel.js";
import { User } from "#modules/users/userModel.js";

// In-memory cache: roleName -> { permissions:Set<string>, scope:"GLOBAL"|"BRANCH" }
const roleCache = new Map();

/** Load role definition with a tiny cache. */
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

/** Clear the cached entry for a role (or everything if no name). */
export function clearRoleCache(name) {
  if (name) roleCache.delete(name);
  else roleCache.clear();
}

/**
 * RBAC gate.
 * Usage:
 *   router.get("/path", requireAuth, permit("patient.read","encounter.write"), handler)
 * All listed permissions must be granted.
 */
export function permit(...required) {
  const needs = required.filter((p) => typeof p === "string" && p.length > 0);

  return async (req, res, next) => {
    try {
      // 0) Must be authenticated (requireAuth should run earlier; still safe-check)
      const tokenUser = req.user;
      if (!tokenUser)
        return res.status(401).json({ message: "Unauthenticated" });

      // 1) Fetch a fresh user snapshot to avoid stale JWT roles/branches
      const liveUser = await User.findById(tokenUser.sub)
        .select("roles branches permissions")
        .lean();

      if (!liveUser)
        return res.status(401).json({ message: "Unauthenticated" });

      const roles = Array.isArray(liveUser.roles) ? liveUser.roles : [];
      const isSuper = roles.includes("SUPER_ADMIN");

      // 2) SUPER_ADMIN bypass: full access, all branches
      if (isSuper) return next();

      // 3) Resolve role definitions and aggregate permissions
      const roleDefs = await Promise.all(roles.map(getRole));

      const perms = new Set();
      for (const r of roleDefs) for (const p of r.permissions) perms.add(p);

      // 4) Merge user-specific overrides
      (liveUser.permissions || []).forEach((p) => perms.add(p));

      // 5) Scope enforcement
      const hasGlobalRole = roleDefs.some((r) => r.scope === "GLOBAL");

      // If user does NOT have any GLOBAL-scoped role:
      //   - require X-Branch-Id header
      //   - require membership in that branch
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

      // 6) Permission check (all required must be present)
      if (needs.length && !needs.every((p) => perms.has(p))) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}

// Friendly alias
export const rbac = permit;
