// src/modules/roles/permissions.js (ESM)

// ------------------------------------------------------------
// Single source of truth for permission keys across the system
// ------------------------------------------------------------
// Each key here represents a named permission used in RBAC (Role-Based Access Control).
// These map directly to routes or functional capabilities in your app.
// Example: "user.read" may be required for GET /api/v1/users
// ------------------------------------------------------------

export const PERMS = {
  // User & Role Management
  USER_READ: "user.read", // View user list/details
  USER_WRITE: "user.write", // Create or update users
  ROLE_READ: "role.read", // View available roles
  ROLE_WRITE: "role.write", // Create or update roles

  // Pricing & Audit
  PRICE_MANAGE: "price.manage", // Update pricing configurations
  AUDIT_READ: "audit.read", // View audit logs

  // Patient & Appointment Management
  PATIENT_READ: "patient.read", // View patients
  PATIENT_WRITE: "patient.write", // Create/update patient records
  APPT_READ: "appointment.read", // View appointments
  APPT_WRITE: "appointment.write", // Create/update appointments
  QUEUE_NEXT: "queue.next", // Advance patient queue

  // Clinical Records
  ENCOUNTER_READ: "encounter.read", // View encounters
  ENCOUNTER_WRITE: "encounter.write", // Create/update encounters
  NOTE_WRITE: "note.write", // Add clinical notes
  VITALS_WRITE: "vitals.write", // Record patient vitals
  DIAG_WRITE: "diagnosis.write", // Record diagnoses
  PROC_WRITE: "procedure.write", // Record procedures
  PRESC_WRITE: "prescription.write", // Write prescriptions

  // Lab & Radiology
  LAB_ORDER: "lab.order", // Order lab tests
  LAB_RESULT: "lab.result", // Enter/view lab results
  RAD_ORDER: "rad.order", // Order radiology investigations
  RAD_REPORT: "rad.report", // Enter/view radiology reports

  // Pharmacy & EMAR
  PHARM_DISPENSE: "pharmacy.dispense", // Dispense medications
  EMAR_ADMIN: "emar.administer", // Administer meds (eMAR)

  // Inpatient (IPD)
  ADMIT: "ipd.admit", // Admit patient
  TRANSFER: "ipd.transfer", // Transfer patient between wards/rooms
  DISCHARGE: "ipd.discharge", // Discharge patient

  // Billing & Claims
  INVOICE_WRITE: "billing.invoice", // Create/update invoices
  PAYMENT_WRITE: "billing.payment", // Record payments
  REFUND_WRITE: "billing.refund", // Process refunds
  CLAIM_WRITE: "claim.write", // Create insurance claims
  CLAIM_SUBMIT: "claim.submit", // Submit claims

  // Inventory Management
  ITEM_WRITE: "inv.item", // Manage inventory items
  GRN_WRITE: "inv.grn", // Goods Receipt Notes
  TRANSFER_WRITE: "inv.transfer", // Transfer stock
  ADJUST_WRITE: "inv.adjust", // Adjust stock counts
  LEDGER_READ: "inv.ledger", // View stock ledger
  CSSD_WRITE: "cssd.write", // Sterile supply tracking

  // File & Notifications
  FILE_UPLOAD: "file.upload", // Upload files
  FILE_READ: "file.read", // View/download files
  NOTIFY_SEND: "notify.send", // Send system notifications
};
