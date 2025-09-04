// api/src/middlewares/errorHandler.js
// ESM

/**
 * Centralized error handler.
 * - Maps Zod and custom .status errors to HTTP codes.
 * - Hides stack traces in production.
 * - Always returns { message } JSON.
 */
export function errorHandler(err, _req, res, _next) {
  const status =
    err.status || err.statusCode || (err.name === "ZodError" ? 400 : 500);

  const message =
    err.message ||
    (status === 500 ? "Internal server error" : "Request failed");

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error("[error]", err.stack || err);
  }

  res.status(status).json({ message });
}
