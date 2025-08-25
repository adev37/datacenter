// src/middlewares/errorHandler.js (ESM)

export function errorHandler(err, _req, res, _next) {
  const status =
    err.status || err.statusCode || (err.name === "ZodError" ? 400 : 500);

  const message =
    err.message ||
    (status === 500 ? "Internal server error" : "Request failed");

  // Log once (trim stack for zod)
  if (process.env.NODE_ENV !== "production") {
    console.error("[error]", err.stack || err);
  }

  res.status(status).json({ message });
}
