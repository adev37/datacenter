// src/modules/audit/auditRoutes.js
import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { permit } from "#middlewares/rbac.js";
import { PERMS } from "#permissions";
import { Audit } from "./auditModel.js";

const r = Router();

r.get("/", requireAuth, permit(PERMS.AUDIT_READ), async (req, res, next) => {
  try {
    const q = {};
    if (!(req.user?.roles || []).includes("SUPER_ADMIN")) {
      // Non-super: limit to actor’s branch
      q.branchId = String(req.ctx?.branchId || "");
    }
    const items = await Audit.find(q).sort({ at: -1 }).limit(200).lean();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

export default r;
