const { Router } = require("express");
const { requireAuth } = require("middlewares/authGuard");
const { permit } = require("middlewares/rbac");
const { PERMS } = require("modules/roles/permissions");
const { User } = require("./userModel");

const { handleRegister, handleLogin } = require("./userController");

const r = Router();

// Auth (kept here for simplicity; you also have /auth routes below)
r.post("/register", handleRegister);
r.post("/login", handleLogin);

// Minimal admin list (secured)
r.get("/", requireAuth, permit(PERMS.USER_READ), async (_req, res) => {
  const users = await User.find({})
    .select("email name roles branches createdAt")
    .lean();
  res.json(users);
});

module.exports = r;
