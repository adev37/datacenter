// src/modules/audit/auditService.js
import { Audit } from "./auditModel.js";

export async function logAudit(
  req,
  { action, resource = "users", outcome, reason, target = {}, extra = {} }
) {
  try {
    const a = {
      at: req.audit?.at ? new Date(req.audit.at) : new Date(),
      actorId: String(req.user?.sub || ""),
      actorEmail: req.user?.email || "",
      actorRoles: req.user?.roles || [],
      ip: req.audit?.ip || req.ip,
      ua: req.audit?.ua || req.headers["user-agent"],
      branchId: req.ctx?.branchId || "",
      action,
      resource,
      outcome,
      reason,
      target,
      extra,
    };
    await Audit.create(a);
  } catch (e) {
    // Never crash business flow because of auditing
    if (process.env.NODE_ENV !== "production") {
      console.warn("[audit] failed to write audit record:", e?.message || e);
    }
  }
}
