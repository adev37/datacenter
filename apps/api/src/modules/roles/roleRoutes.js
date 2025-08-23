const { Router } = require("express");
const { requireAuth } = require("middlewares/authGuard");
const { permit } = require("middlewares/rbac");
const { listRoles, upsertRole } = require("./roleService");
const { PERMS } = require("./permissions");

const r = Router();

r.get("/", requireAuth, permit(PERMS.ROLE_READ), async (_req, res, next) => {
  try {
    res.json(await listRoles());
  } catch (e) {
    next(e);
  }
});

r.post("/", requireAuth, permit(PERMS.ROLE_WRITE), async (req, res, next) => {
  try {
    const role = await upsertRole(req.body);
    res.status(201).json(role);
  } catch (e) {
    next(e);
  }
});

module.exports = r;
