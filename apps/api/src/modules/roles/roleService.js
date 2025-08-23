const { Role } = require("./roleModel");
async function listRoles() {
  return Role.find({}).lean();
}
async function upsertRole({ name, scope, permissions }) {
  await Role.updateOne(
    { name },
    { $set: { name, scope, permissions } },
    { upsert: true }
  );
  return Role.findOne({ name }).lean();
}
module.exports = { listRoles, upsertRole };
