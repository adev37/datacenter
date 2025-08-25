// src/middlewares/rbac.js
import { Role } from "#modules/roles/roleModel.js";

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
 * Usage: router.get("/path", rbac("patient.read"), handler)
 * Multiple perms => user must have all of them.
 */
export function permit(...required) {
  const needs = required.filter((v) => typeof v === "string" && v.length > 0);

  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthenticated" });

      // SUPER_ADMIN can do everything everywhere
      if ((user.roles || []).includes("SUPER_ADMIN")) return next();

      // Resolve roles and merge permissions
      const sets = await Promise.all((user.roles || []).map(getRole));
      const perms = new Set();
      sets.forEach((r) => r.permissions.forEach((p) => perms.add(p)));

      const hasGlobal = sets.some((r) => r.scope === "GLOBAL");

      // Non-global needs branch header
      if (!hasGlobal && !req.ctx?.branchId) {
        return res.status(400).json({ message: "X-Branch-Id required" });
      }

      if (needs.length && !needs.every((p) => perms.has(p))) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}

// 👇 add this line so `import { rbac } from "#middlewares/rbac.js"` works
export const rbac = permit;
