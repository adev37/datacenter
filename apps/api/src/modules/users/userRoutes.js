// src/modules/users/userRoutes.js (ESM)
import { Router } from "express";
import { requireAuth } from "#src/middlewares/requireAuth.js"; // <- fixed
import { permit } from "#middlewares/rbac.js"; // <- keep rbac.js
import { PERMS } from "#modules/roles/permissions.js";
import { User } from "#modules/users/userModel.js";
import { handleRegister, handleLogin } from "#modules/users/userController.js";

const r = Router();

r.post("/register", handleRegister);
r.post("/login", handleLogin);

r.get("/", requireAuth, permit(PERMS.USER_READ), async (_req, res, next) => {
  try {
    const users = await User.find({})
      .select("email name roles branches createdAt")
      .lean();
    res.json(users);
  } catch (e) {
    next(e);
  }
});

export default r;
