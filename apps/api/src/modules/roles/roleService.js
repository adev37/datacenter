// src/modules/roles/roleService.js (ESM)

import { Role } from "#modules/roles/roleModel.js";

export async function listRoles() {
  return Role.find({}).lean();
}

export async function upsertRole({ name, scope, permissions }) {
  await Role.updateOne(
    { name },
    { $set: { name, scope, permissions } },
    { upsert: true }
  );
  return Role.findOne({ name }).lean();
}
