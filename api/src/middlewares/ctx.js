// src/middlewares/ctx.js
export function attachCtx(req, _res, next) {
  req.ctx = req.ctx || {};
  const hdr = req.header("X-Branch-Id");
  if (hdr) req.ctx.branchId = String(hdr);
  next();
}
