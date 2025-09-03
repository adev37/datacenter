// ESM
import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { permit } from "#middlewares/rbac.js";
import { PERMS } from "#permissions";
import { User } from "#modules/users/userModel.js";
import { Role } from "#modules/roles/roleModel.js";
import { avatarUpload } from "#middlewares/upload.js";
import { logAudit } from "#modules/audit/auditService.js";
import { getMe, updateMe, uploadAvatar } from "./me.controller.js";
import {
  getUserPermissions,
  setUserPermissions,
} from "#modules/users/userRepository.js";

const r = Router();

/* ───────────────  Self profile  ─────────────── */
// GET /api/v1/users/me
r.get("/me", requireAuth, getMe);

// Accept BOTH verbs to keep clients stable
// PATCH is the canonical semantic update
r.patch("/me", requireAuth, updateMe);
r.put("/me", requireAuth, updateMe);

// POST /api/v1/users/me/avatar
r.post("/me/avatar", requireAuth, avatarUpload, uploadAvatar);

/* ───────────────  Provisioned users  ─────────────── */
r.post("/", requireAuth, permit(PERMS.USER_WRITE), async (req, res, next) => {
  try {
    const { register } = await import("#modules/users/userService.js");
    const requester = await User.findById(req.user.sub)
      .select("email roles branches")
      .lean();

    const rolesOfCreator = requester?.roles || [];
    const isSuper = rolesOfCreator.includes("SUPER_ADMIN");
    const isBranchAdmin = rolesOfCreator.includes("ADMIN");

    const inputRoles = Array.isArray(req.body.roles) ? req.body.roles : [];
    let inputBranches = Array.isArray(req.body.branches)
      ? req.body.branches
      : [];

    if (!isSuper) {
      const branchId = String(req.ctx?.branchId || "");
      if (!branchId) {
        await logAudit(req, {
          action: "user.create",
          outcome: "denied",
          reason: "NO_ACTIVE_BRANCH",
          target: { email: req.body?.email, roles: inputRoles },
        });
        return res
          .status(400)
          .json({ message: "Active branch is required for this action" });
      }
      inputBranches = [branchId];

      // ❌ Admin cannot create Admin
      if (isBranchAdmin && inputRoles.includes("ADMIN")) {
        await logAudit(req, {
          action: "user.create",
          outcome: "denied",
          reason: "ADMIN_TRY_CREATE_ADMIN",
          target: { email: req.body?.email, roles: inputRoles },
        });
        return res
          .status(403)
          .json({ message: "Admins cannot create other Admin users" });
      }

      // BRANCH-scoped roles only; never SUPER_ADMIN
      const roleDocs = await Role.find({ name: { $in: inputRoles } })
        .select("name scope")
        .lean();

      const invalidRole =
        roleDocs.length !== inputRoles.length ||
        roleDocs.some((r) => r.scope !== "BRANCH" || r.name === "SUPER_ADMIN");

      if (invalidRole) {
        await logAudit(req, {
          action: "user.create",
          outcome: "denied",
          reason: "ROLE_SCOPE_VIOLATION",
          target: { email: req.body?.email, roles: inputRoles },
        });
        return res
          .status(403)
          .json({ message: "Cannot assign requested roles" });
      }
    } else {
      // SUPER: still verify roles exist
      const roleDocs = await Role.find({ name: { $in: inputRoles } })
        .select("name")
        .lean();
      if (roleDocs.length !== inputRoles.length) {
        await logAudit(req, {
          action: "user.create",
          outcome: "denied",
          reason: "UNKNOWN_ROLE",
          target: { email: req.body?.email, roles: inputRoles },
        });
        return res.status(400).json({ message: "Unknown roles specified" });
      }
    }

    const out = await register({
      ...req.body,
      roles: inputRoles,
      branches: inputBranches,
    });

    await logAudit(req, {
      action: "user.create",
      outcome: "success",
      target: {
        email: req.body?.email,
        roles: inputRoles,
        branches: inputBranches,
      },
    });

    res.status(201).json(out);
  } catch (e) {
    await logAudit(req, {
      action: "user.create",
      outcome: "error",
      reason: e?.message || "UNEXPECTED",
      target: { email: req.body?.email, roles: req.body?.roles },
    });
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
