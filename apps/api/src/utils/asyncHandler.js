// src/utils/asyncHandler.js (ESM)

// ------------------------------------------------------------
// asyncHandler(fn)
// ------------------------------------------------------------
// Wraps an async Express route handler so that errors are
// automatically passed to next() instead of needing try/catch
// in every route.
// Usage:
//   router.get("/", asyncHandler(async (req, res) => { ... }))
// ------------------------------------------------------------

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
