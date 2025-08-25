// src/middlewares/branchContext.js (ESM)

// Injects branch scoping (X-Branch-Id).
// Super Admins may query all (future: ?scope=all).
export function branchContext(req, _res, next) {
  req.ctx = req.ctx || {};
  const branchId = req.header("X-Branch-Id");
  if (branchId) {
    req.ctx.branchId = branchId;
  }
  next();
}
