// api/src/middlewares/requireAuth.js
// ESM

import jwt from "jsonwebtoken";

/**
 * requireAuth
 * - Expects Authorization: Bearer <token>
 * - Verifies token with API_JWT_SECRET
 * - Attaches payload to req.user: { sub, email, roles, branches }
 */
export function requireAuth(req, res, next) {
  const auth = req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  try {
    const payload = jwt.verify(token, process.env.API_JWT_SECRET);
    req.user = payload; // { sub, email, roles, branches }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
