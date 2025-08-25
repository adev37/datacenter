// app.js (ESM, no relative paths)

// NOTE: .env should be loaded in server.js via `import "dotenv/config"`
// so we don't load it here again.

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

// Middlewares (named exports expected)
import { branchContext } from "#middlewares/branchContext.js";
import { auditHook } from "#middlewares/auditHook.js";
import { errorHandler } from "#middlewares/errorHandler.js";

// Routers (default exports expected)
import authRoutes from "#modules/auth/authRoutes.js";
import userRoutes from "#modules/users/userRoutes.js";
import roleRoutes from "#modules/roles/roleRoutes.js";
import patientRoutes from "#modules/patients/patientRoutes.js";

const {
  API_CORS_ORIGINS = "",
  NODE_ENV = "development",
  JSON_LIMIT = "1mb",
} = process.env;

const app = express();

// Security & parsing
app.use(helmet());
app.use(
  cors({
    origin:
      API_CORS_ORIGINS.trim() === ""
        ? true // allow all in dev if not set
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

// Errors last
app.use(errorHandler);

export default app;
