// api/src/app.js
// ESM

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";

import { branchContext } from "#middlewares/branchContext.js";
import { auditHook } from "#middlewares/auditHook.js";
import { errorHandler } from "#middlewares/errorHandler.js";

import authRoutes from "#modules/auth/authRoutes.js";
import userRoutes from "#modules/users/userRoutes.js";
import roleRoutes from "#modules/roles/roleRoutes.js";

import auditRoutes from "#modules/audit/auditRoutes.js";

import { requireAuth } from "#middlewares/requireAuth.js";
import { getMe } from "#modules/users/me.controller.js";
// ...existing imports
import patientRoutes from "#modules/patients/patientRoutes.js";
import patientEncounterRoutes from "#modules/encounters/patientEncounterRoutes.js";
import notificationRoutes from "#modules/notifications/notificationRoutes.js";

import appointmentRoutes from "#modules/appointments/appointmentRoutes.js";
import scheduleRoutes from "#modules/appointments/scheduleRoutes.js";

const {
  API_CORS_ORIGINS = "",
  NODE_ENV = "development",
  JSON_LIMIT = "1mb",
} = process.env;

const app = express();

// Security headers (relax CORP for serving static files cross-origin)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS
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

// Parsers
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

// Dev logger
if (NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Context & audit
app.use(branchContext);
app.use(auditHook);

// Health
app.get("/api/v1/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/patients/:patientId/encounters", patientEncounterRoutes);
app.use("/api/v1/audits", auditRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/schedules", scheduleRoutes);

// Serve avatars/static uploads
app.use(
  "/uploads",
  cors({ origin: true, credentials: true }),
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(process.cwd(), "uploads"))
);

// Alias for frontend convenience
app.get("/api/v1/me", requireAuth, getMe);

// Error handler
app.use(errorHandler);

export default app;
