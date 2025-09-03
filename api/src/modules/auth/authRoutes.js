// src/modules/auth/authRoutes.js (ESM)

import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { Role } from "#modules/roles/roleModel.js";
import { User } from "#modules/users/userModel.js";
import { PERMS } from "#permissions";

const r = Router();

// Public login only
r.post("/login", async (req, res, next) => {
  // delegate to users service via controller (you had this split before)
  try {
    const { login } = await import("#modules/users/userService.js");
    const out = await login(req.body);
    res.json(out);
  } catch (e) {
    next(e);
  }
});

// Current session details with effective permissions
r.get("/me", requireAuth, async (req, res, next) => {
  try {
    const udoc = await User.findById(req.user.sub)
      .select("email roles branches permissions")
      .lean();

    if (!udoc) return res.status(401).json({ message: "Unauthenticated" });

    const roles = udoc.roles || [];
    const isSuper = roles.includes("SUPER_ADMIN");

    if (isSuper) {
      const allPerms = Object.values(PERMS);
      return res.json({
        user: {
          id: String(req.user.sub),
          email: udoc.email,
          roles,
          branches: udoc.branches || [],
        },
        permissions: allPerms,
      });
    }

    const roleDocs = await Role.find({ name: { $in: roles } })
      .select("permissions scope name")
      .lean();

    const rolePerms = new Set(roleDocs.flatMap((d) => d.permissions || []));
    (udoc.permissions || []).forEach((p) => rolePerms.add(p));

    res.json({
      user: {
        id: String(req.user.sub),
        email: udoc.email,
        roles,
        branches: udoc.branches || [],
      },
      permissions: Array.from(rolePerms),
    });
  } catch (e) {
    next(e);
  }
});

export default r;
