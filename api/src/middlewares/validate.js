// src/middlewares/validate.js (ESM)
import { ZodError } from "zod";

export const validate = (schema) => (req, _res, next) => {
  try {
    // Support composite schemas: { query?, params?, body? }
    // or bare schemas for body-only.
    if (schema?.shape?.query || schema?.shape?.params || schema?.shape?.body) {
      const out = schema.parse({
        query: req.query,
        params: req.params,
        body: req.body,
      });
      if (out.query) req.query = out.query;
      if (out.params) req.params = out.params;
      if (out.body) req.body = out.body;
    } else {
      req.body = schema.parse(req.body);
    }
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues?.[0]?.message || "Invalid request";
      return next(Object.assign(new Error(msg), { status: 400 }));
    }
    next(e);
  }
};
