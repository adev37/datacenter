// api/src/modules/roles/roleService.js
// ESM

import { Role } from "#modules/roles/roleModel.js";

/** Return all roles (lean documents). */
export async function listRoles() {
  return Role.find({}).lean();
}

/**
 * Upsert a role (create or update).
 * Notes:
 *  - If `scope` is undefined, we DO NOT change the stored scope.
 *  - If creating a brand-new role and no scope is provided, default to "BRANCH".
 *  - Callers (routes) already enforce: non-Super cannot change scope, cannot touch SUPER_ADMIN.
 */
export async function upsertRole({ name, scope, permissions = [] }) {
  const existing = await Role.findOne({ name }).lean();

  const $set = { name, permissions };
  if (typeof scope === "string") {
    // Super Admin path (or a guarded/allowed call)
    $set.scope = scope;
  } else if (!existing) {
    // New role created by non-super → default to BRANCH
    $set.scope = "BRANCH";
  }

  await Role.updateOne({ name }, { $set }, { upsert: true });
  return Role.findOne({ name }).lean();
}
