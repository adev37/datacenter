const { Router } = require("express");
const { postLogin, postRegister } = require("./authController");
const { requireAuth } = require("middlewares/authGuard");
const { Role } = require("modules/roles/roleModel");

const r = Router();
r.post("/login", postLogin);
r.post("/register", postRegister);

r.get("/me", requireAuth, async (req, res) => {
  const roles = req.user.roles || [];
  const docs = await Role.find({ name: { $in: roles } }).lean();
  const permissions = Array.from(new Set(docs.flatMap((d) => d.permissions)));
  res.json({
    user: { id: req.user.sub, email: req.user.email, roles },
    permissions,
  });
});

module.exports = r;
