// api/src/middlewares/branchContext.js
// ESM

/**
 * Injects branch scoping from the request header.
 * - Reads X-Branch-Id and places it into req.ctx.branchId
 * - SUPER_ADMIN may omit it (scope handling happens in RBAC)
 */
export function branchContext(req, _res, next) {
  req.ctx = req.ctx || {};
  const branchId = req.header("X-Branch-Id");
  if (branchId) {
    req.ctx.branchId = String(branchId);
  }
  next();
}
