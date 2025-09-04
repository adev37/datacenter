// api/src/middlewares/auditHook.js
// ESM

/**
 * auditHook
 * - Attaches a lightweight audit context to the request
 * - Used by controllers/services to record who/when/where
 */
export function auditHook(req, _res, next) {
  req.audit = {
    at: new Date().toISOString(),
    ip: req.ip,
    ua: req.headers["user-agent"],
  };
  next();
}
