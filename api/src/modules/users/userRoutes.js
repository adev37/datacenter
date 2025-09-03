// src/modules/users/userRoutes.js
import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { permit } from "#middlewares/rbac.js";
import { PERMS } from "#permissions";
import { User } from "#modules/users/userModel.js";
import { Role } from "#modules/roles/roleModel.js";
import { avatarUpload } from "#middlewares/upload.js";
import { getMe, updateMe, uploadAvatar } from "./me.controller.js";
import {
  getUserPermissions,
  setUserPermissions,
} from "#modules/users/userRepository.js";

const r = Router();

/* ───────────────  Self profile  ─────────────── */
r.get("/me", requireAuth, getMe);
r.patch("/me", requireAuth, updateMe);
r.put("/me", requireAuth, updateMe);
r.post("/me/avatar", requireAuth, avatarUpload, uploadAvatar);

/* ───────────────  Provisioned users  ─────────────── */
r.post("/", requireAuth, permit(PERMS.USER_WRITE), async (req, res, next) => {
  try {
    const { register } = await import("#modules/users/userService.js");
    const requester = await User.findById(req.user.sub)
      .select("roles branches")
      .lean();

    const isSuper = (requester?.roles || []).includes("SUPER_ADMIN");

    // Normalize incoming arrays
    const inputRoles = Array.isArray(req.body.roles) ? req.body.roles : [];
    let inputBranches = Array.isArray(req.body.branches)
      ? req.body.branches
      : [];

    if (!isSuper) {
      // ❌ Non-super may NOT create ADMIN or SUPER_ADMIN
      if (inputRoles.includes("ADMIN") || inputRoles.includes("SUPER_ADMIN")) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Force branch to creator's active branch; ignore payload
      const branchId = String(req.ctx?.branchId || "");
      if (!branchId) {
        return res
          .status(400)
          .json({ message: "Active branch is required for this action" });
      }
      inputBranches = [branchId];

      // Only BRANCH-scoped roles
      const roleDocs = await Role.find({ name: { $in: inputRoles } })
        .select("name scope")
        .lean();

      const invalidRole =
        roleDocs.length !== inputRoles.length ||
        roleDocs.some((r) => r.scope !== "BRANCH" || r.name === "SUPER_ADMIN");
      if (invalidRole) {
        return res
          .status(403)
          .json({ message: "Cannot assign requested roles" });
      }
    } else {
      // SUPER path — still validate roles exist
      const roleDocs = await Role.find({ name: { $in: inputRoles } })
        .select("name scope")
        .lean();
      if (roleDocs.length !== inputRoles.length) {
        return res.status(400).json({ message: "Unknown roles specified" });
      }

      // If creating an ADMIN, require exactly one branch and enforce uniqueness
      if (inputRoles.includes("ADMIN")) {
        if (inputBranches.length !== 1 || !inputBranches[0]) {
          return res
            .status(400)
            .json({ message: "ADMIN must be created with exactly one branch" });
        }
        const branchId = String(inputBranches[0]);

        const existing = await User.findOne({
          roles: "ADMIN",
          branches: branchId,
        })
          .select("_id email")
          .lean();

        if (existing) {
          return res.status(409).json({
            message: "Branch already has an ADMIN",
          });
        }
      }
    }

    const out = await register({
      ...req.body,
      roles: inputRoles,
      branches: inputBranches,
    });

    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
});

/* ───────────────  Listing  ─────────────── */
r.get("/", requireAuth, permit(PERMS.USER_READ), async (req, res, next) => {
  try {
    const requester = await User.findById(req.user.sub).select("roles").lean();
    const isSuper = (requester?.roles || []).includes("SUPER_ADMIN");

    const query = {};
    if (!isSuper) {
      const branchId = req.ctx?.branchId;
      query.branches = String(branchId);
    }

    const users = await User.find(query)
      .select(
        "email name firstName lastName title profession roles branches permissions createdAt"
      )
      .lean();
    res.json(users);
  } catch (e) {
    next(e);
  }
});

/* ───────────────  Extra permissions  ─────────────── */
r.get(
  "/:id/permissions",
  requireAuth,
  permit(PERMS.USER_READ),
  async (req, res, next) => {
    try {
      const requester = await User.findById(req.user.sub)
        .select("roles")
        .lean();
      const isSuper = (requester?.roles || []).includes("SUPER_ADMIN");

      if (!isSuper) {
        const branchId = String(req.ctx?.branchId || "");
        const target = await User.findById(req.params.id)
          .select("branches")
          .lean();
        if (!target) return res.status(404).json({ message: "User not found" });
        const sameBranch = (target.branches || [])
          .map(String)
          .includes(branchId);
        if (!sameBranch)
          return res.status(403).json({ message: "Branch access denied" });
      }

      const doc = await getUserPermissions(req.params.id);
      if (!doc) return res.status(404).json({ message: "User not found" });
      res.json({ permissions: doc.permissions || [] });
    } catch (e) {
      next(e);
    }
  }
);

r.put(
  "/:id/permissions",
  requireAuth,
  permit(PERMS.USER_WRITE),
  async (req, res, next) => {
    try {
      const { permissions } = req.body;
      if (!Array.isArray(permissions)) {
        return res
          .status(400)
          .json({ message: "permissions must be an array of strings" });
      }

      const requester = await User.findById(req.user.sub)
        .select("roles")
        .lean();
      const isSuper = (requester?.roles || []).includes("SUPER_ADMIN");

      if (!isSuper) {
        const branchId = String(req.ctx?.branchId || "");
        const target = await User.findById(req.params.id)
          .select("branches")
          .lean();
        if (!target) return res.status(404).json({ message: "User not found" });
        const sameBranch = (target.branches || [])
          .map(String)
          .includes(branchId);
        if (!sameBranch)
          return res.status(403).json({ message: "Branch access denied" });
      }

      await setUserPermissions(req.params.id, permissions);
      const out = await getUserPermissions(req.params.id);
      if (!out) return res.status(404).json({ message: "User not found" });
      res.json({ permissions: out.permissions || [] });
    } catch (e) {
      next(e);
    }
  }
);

export default r;
