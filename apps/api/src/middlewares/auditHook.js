// src/middlewares/auditHook.js (ESM)

export function auditHook(req, _res, next) {
  req.audit = {
    at: new Date().toISOString(),
    ip: req.ip,
    ua: req.headers["user-agent"],
  };
  next();
}
