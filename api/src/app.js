// src/app.js (ESM)

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import path from "node:path"; // ← add this

import { branchContext } from "#middlewares/branchContext.js";
import { auditHook } from "#middlewares/auditHook.js";
import { errorHandler } from "#middlewares/errorHandler.js";

import authRoutes from "#modules/auth/authRoutes.js";
import userRoutes from "#modules/users/userRoutes.js";
import roleRoutes from "#modules/roles/roleRoutes.js";
import patientRoutes from "#modules/patients/patientRoutes.js";
import { requireAuth } from "#middlewares/requireAuth.js";
import { getMe } from "#modules/users/me.controller.js";
import { attachCtx } from "./middlewares/ctx.js";
import auditRoutes from "#modules/audit/auditRoutes.js";

const {
  API_CORS_ORIGINS = "",
  NODE_ENV = "development",
  JSON_LIMIT = "1mb",
} = process.env;

const app = express();

// Allow cross-origin use of resources (images) served by this API
app.use(
  helmet({
    // default "same-origin" causes your error; relax it:
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin:
      API_CORS_ORIGINS.trim() === ""
        ? true
        : API_CORS_ORIGINS.split(",")
            .map((s) => s.trim())
            .filter(Boolean),
    credentials: true,
  })
);

app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

if (NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(branchContext);
app.use(auditHook);
app.use(attachCtx);

app.get("/api/v1/health", (_req, res) => res.json({ ok: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/audits", auditRoutes);

// Serve avatars/static uploads
app.use(
  "/uploads",
  // (optional) CORS specifically for static files in dev
  cors({ origin: true, credentials: true }),
  // set CORP header explicitly for this route too
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(process.cwd(), "uploads"))
);

// Alias for frontend convenience
app.get("/api/v1/me", requireAuth, getMe);

app.use(errorHandler);

export default app;
