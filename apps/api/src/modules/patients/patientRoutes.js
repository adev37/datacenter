const { Router } = require("express");
const { requireAuth } = require("middlewares/authGuard");
const { permit } = require("middlewares/rbac");
const { PERMS } = require("modules/roles/permissions");
const { getPatients, postPatient } = require("./patientController");

const r = Router();
r.get("/", requireAuth, permit(PERMS.PATIENT_READ), getPatients);
r.post("/", requireAuth, permit(PERMS.PATIENT_WRITE), postPatient);
module.exports = r;
