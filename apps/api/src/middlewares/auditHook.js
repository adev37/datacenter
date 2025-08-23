function auditHook(req, _res, next) {
  req.audit = {
    at: new Date().toISOString(),
    ip: req.ip,
    ua: req.headers["user-agent"],
  };
  next();
}
module.exports = { auditHook };
