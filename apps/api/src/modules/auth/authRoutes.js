// src/modules/auth/authRoutes.js (ESM)
import { Router } from "express";
import { postLogin, postRegister } from "#modules/auth/authController.js";
import { requireAuth } from "#src/middlewares/requireAuth.js"; // <- fixed
import { Role } from "#modules/roles/roleModel.js";

const r = Router();

r.post("/login", postLogin);
r.post("/register", postRegister);

r.get("/me", requireAuth, async (req, res, next) => {
  try {
    const roles = req.user.roles || [];
    const docs = await Role.find({ name: { $in: roles } }).lean();
    const permissions = Array.from(new Set(docs.flatMap((d) => d.permissions)));
    res.json({
      user: { id: req.user.sub, email: req.user.email, roles },
      permissions,
    });
  } catch (e) {
    next(e);
  }
});

export default r;
