// api/src/modules/roles/permissions.js
// ESM

// ------------------------------------------------------------
// Single source of truth for permission keys across the system
// Keep these in sync with <PrivateRoute requirePerm="..."/>.
// ------------------------------------------------------------

export const PERMS = {
  // ── Users / Roles / System (admin-ish; also used for UI gating) ────────────
  USER_READ: "user.read",
  USER_WRITE: "user.write",
  ROLE_READ: "role.read",
  ROLE_WRITE: "role.write",
  PRICE_MANAGE: "price.manage",
  AUDIT_READ: "audit.read",
  FILE_UPLOAD: "file.upload",
  FILE_READ: "file.read",
  NOTIFY_SEND: "notify.send",

  // ── Settings pages (frontend route/menu guards) ────────────────────────────
  SETTINGS_USER: "settings.user",
  SETTINGS_ROLE: "settings.role",
  SETTINGS_DEPARTMENT: "settings.department",
  SETTINGS_PREFERENCES: "settings.preferences",

  // ── Patients & Appointments ────────────────────────────────────────────────
  PATIENT_READ: "patient.read",
  PATIENT_WRITE: "patient.write",
  APPOINTMENT_READ: "appointment.read",
  APPOINTMENT_WRITE: "appointment.write",

  // ── Clinical Records / Encounters ──────────────────────────────────────────
  ENCOUNTER_READ: "encounter.read",
  ENCOUNTER_WRITE: "encounter.write",
  VITALS_WRITE: "vitals.write",
  PRESCRIPTION_WRITE: "prescription.write",

  // ── Lab ────────────────────────────────────────────────────────────────────
  LAB_ORDER: "lab.order",
  LAB_RESULT: "lab.result",

  // ── Radiology ──────────────────────────────────────────────────────────────
  RAD_ORDER: "rad.order",
  RAD_REPORT: "rad.report",

  // ── Pharmacy / eMAR ───────────────────────────────────────────────────────
  PHARMACY_DISPENSE: "pharmacy.dispense",
  EMAR_ADMINISTER: "emar.administer",

  // ── IPD (In-Patient Dept) ─────────────────────────────────────────────────
  IPD_ADMIT: "ipd.admit",
  IPD_TRANSFER: "ipd.transfer",
  IPD_DISCHARGE: "ipd.discharge",

  // ── Billing ────────────────────────────────────────────────────────────────
  BILLING_INVOICE: "billing.invoice",
  BILLING_PAYMENT: "billing.payment",
  BILLING_REFUND: "billing.refund",

  // ── Inventory ─────────────────────────────────────────────────────────────
  INV_ITEM: "inv.item",
  INV_GRN: "inv.grn",
  INV_TRANSFER: "inv.transfer",
  INV_LEDGER: "inv.ledger",
  INV_ADJUST: "inv.adjust",
  CSSD_WRITE: "cssd.write",

  // ── Reports / Staff / Notifications (guards for future/extra pages) ───────
  REPORTS_FINANCE: "reports.finance",
  REPORTS_CLINICAL: "reports.clinical",
  REPORTS_INVENTORY: "reports.inventory",

  STAFF_READ: "staff.read",
  STAFF_SCHEDULE: "staff.schedule",

  NOTIFICATIONS_READ: "notifications.read",
};

// Handy grouped export to assemble roles quickly in seeds/admin UI
export const PERM_GROUPS = {
  patients: [PERMS.PATIENT_READ, PERMS.PATIENT_WRITE],
  appointments: [PERMS.APPOINTMENT_READ, PERMS.APPOINTMENT_WRITE],
  encounters: [
    PERMS.ENCOUNTER_READ,
    PERMS.ENCOUNTER_WRITE,
    PERMS.VITALS_WRITE,
    PERMS.PRESCRIPTION_WRITE,
  ],
  lab: [PERMS.LAB_ORDER, PERMS.LAB_RESULT],
  radiology: [PERMS.RAD_ORDER, PERMS.RAD_REPORT],
  pharmacy: [PERMS.PHARMACY_DISPENSE, PERMS.EMAR_ADMINISTER],
  ipd: [PERMS.IPD_ADMIT, PERMS.IPD_TRANSFER, PERMS.IPD_DISCHARGE],
  billing: [PERMS.BILLING_INVOICE, PERMS.BILLING_PAYMENT, PERMS.BILLING_REFUND],
  inventory: [
    PERMS.INV_ITEM,
    PERMS.INV_GRN,
    PERMS.INV_TRANSFER,
    PERMS.INV_LEDGER,
    PERMS.INV_ADJUST,
    PERMS.CSSD_WRITE,
  ],
  reports: [
    PERMS.REPORTS_FINANCE,
    PERMS.REPORTS_CLINICAL,
    PERMS.REPORTS_INVENTORY,
  ],
  staff: [PERMS.STAFF_READ, PERMS.STAFF_SCHEDULE],
  settings: [
    PERMS.SETTINGS_USER,
    PERMS.SETTINGS_ROLE,
    PERMS.SETTINGS_DEPARTMENT,
    PERMS.SETTINGS_PREFERENCES,
  ],
  notifications: [PERMS.NOTIFICATIONS_READ],
  admin: [
    PERMS.USER_READ,
    PERMS.USER_WRITE,
    PERMS.ROLE_READ,
    PERMS.ROLE_WRITE,
    PERMS.PRICE_MANAGE,
    PERMS.AUDIT_READ,
    PERMS.FILE_UPLOAD,
    PERMS.FILE_READ,
    PERMS.NOTIFY_SEND,
  ],
};

// One-liner for “give me everything”
export const ALL_PERMS = Object.values(PERMS);

// Small helper for guards (optional)
export const hasPerm = (userPerms, perm) =>
  Array.isArray(userPerms) && userPerms.includes(perm);
