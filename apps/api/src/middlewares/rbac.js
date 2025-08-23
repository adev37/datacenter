const { Role } = require("modules/roles/roleModel");

const roleCache = new Map(); // roleName -> { permissions:Set, scope }

async function getRole(name) {
  if (roleCache.has(name)) return roleCache.get(name);
  const doc = await Role.findOne({ name }).lean();
  const val = doc
    ? { permissions: new Set(doc.permissions || []), scope: doc.scope }
    : { permissions: new Set(), scope: "BRANCH" };
  roleCache.set(name, val);
  return val;
}
function clearRoleCache(name) {
  if (name) roleCache.delete(name);
  else roleCache.clear();
}

function permit(...required) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthenticated" });

      if ((user.roles || []).includes("SUPER_ADMIN")) return next();

      const sets = await Promise.all((user.roles || []).map(getRole));
      const perms = new Set();
      sets.forEach((r) => r.permissions.forEach((p) => perms.add(p)));

      const hasGlobal = sets.some((r) => r.scope === "GLOBAL");
      if (!hasGlobal && !req.ctx?.branchId) {
        return res.status(400).json({ message: "X-Branch-Id required" });
      }
      const ok = required.every((p) => perms.has(p));
      if (!ok) return res.status(403).json({ message: "Forbidden" });
      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { permit, clearRoleCache };
