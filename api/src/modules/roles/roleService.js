import { Role } from "#modules/roles/roleModel.js";

export async function listRoles() {
  return Role.find({}).lean();
}

/**
 * Upsert role.
 * - If `scope` is undefined, we DO NOT change the stored scope.
 * - If creating a brand-new role and no scope is provided, default to "BRANCH".
 */
export async function upsertRole({ name, scope, permissions = [] }) {
  const existing = await Role.findOne({ name }).lean();

  const $set = { name, permissions };
  if (typeof scope === "string") {
    $set.scope = scope; // super admin path (or allowed call)
  } else if (!existing) {
    $set.scope = "BRANCH"; // new role from non-super → branch by default
  }

  await Role.updateOne({ name }, { $set }, { upsert: true });
  return Role.findOne({ name }).lean();
}
