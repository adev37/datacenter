require("module-alias/register");
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const { branchContext } = require("middlewares/branchContext");
const { auditHook } = require("middlewares/auditHook");
const { errorHandler } = require("middlewares/errorHandler");

// Routers (only routes here; logic in controllers/services)
const authRoutes = require("modules/auth/authRoutes");
const userRoutes = require("modules/users/userRoutes");
const roleRoutes = require("modules/roles/roleRoutes");
const patientRoutes = require("modules/patients/patientRoutes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin:
      (process.env.API_CORS_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(branchContext);
app.use(auditHook);

// health
app.get("/api/v1/health", (_req, res) => res.json({ ok: true }));

// mount routers
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/patients", patientRoutes);

// errors last
app.use(errorHandler);

module.exports = app;
