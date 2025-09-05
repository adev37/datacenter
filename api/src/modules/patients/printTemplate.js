// api/src/modules/patients/printTemplate.js
// ESM
import { fullName } from "./utils.js"; // optional tiny helper or inline

function safe(v) {
  return v == null ? "" : String(v);
}

export function buildPatientProfileHTML({ patient, encounters = [] }) {
  const name = `${safe(patient.firstName)} ${safe(patient.middleName)} ${safe(
    patient.lastName
  )}`
    .replace(/\s+/g, " ")
    .trim();

  const age = (() => {
    try {
      const d = new Date(patient.dob);
      const t = new Date();
      let a = t.getFullYear() - d.getFullYear();
      const m = t.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
      return a >= 0 ? a : "";
    } catch {
      return "";
    }
  })();

  const ins = patient.insurance || {};
  const eme = patient.emergency || {};

  const rows = encounters
    .slice(0, 5)
    .map(
      (e) => `<tr>
      <td>${new Date(e.createdAt).toLocaleString()}</td>
      <td>${safe(e.type || "")}</td>
      <td>${safe(e.status || "")}</td>
      <td style="max-width:420px">${safe(
        e.soap?.assessment || e.soap?.plan || ""
      ).slice(0, 300)}</td>
    </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Patient Profile – ${name}</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin:24px; color:#111; }
  h1 { margin:0 0 8px; }
  h2 { margin:24px 0 8px; font-size:16px; border-bottom:1px solid #ddd; padding-bottom:4px; }
  .meta { color:#555; }
  .grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px 24px; }
  table { width:100%; border-collapse: collapse; }
  th, td { border:1px solid #e5e5e5; padding:8px; text-align:left; vertical-align:top; }
  .muted { color:#666; }
  .badge { display:inline-block; font-size:12px; padding:2px 8px; border-radius:999px; background:#eef; }
  .photo { float:right; width:120px; height:120px; border:1px solid #eee; border-radius:8px; object-fit:cover; }
</style>
</head>
<body onload="window.print && window.print()">
  <h1>${name} <span class="badge">${safe(
    patient.status || "active"
  )}</span></h1>
  <div class="meta">MRN: <b>${safe(
    patient.mrn
  )}</b> &nbsp; • &nbsp; Branch: <b>${safe(patient.branchId)}</b></div>
  ${
    patient.photoUrl
      ? `<img class="photo" src="${patient.photoUrl}" alt="Photo" />`
      : ""
  }

  <h2>Personal</h2>
  <div class="grid">
    <div><b>Gender:</b> ${safe(patient.gender)}</div>
    <div><b>DOB:</b> ${
      patient.dob ? new Date(patient.dob).toLocaleDateString() : ""
    } ${age ? `(${age} yrs)` : ""}</div>
    <div><b>Marital Status:</b> ${safe(patient.maritalStatus || "")}</div>
    <div><b>Phone:</b> ${safe(patient.phone || "")}</div>
    <div><b>Email:</b> ${safe(patient.email || "")}</div>
    <div><b>Address:</b> ${[
      patient.address,
      patient.city,
      patient.state,
      patient.zip,
    ]
      .filter(Boolean)
      .join(", ")}</div>
  </div>

  <h2>Insurance</h2>
  <div class="grid">
    <div><b>Provider:</b> ${safe(ins.provider || "")}</div>
    <div><b>Plan:</b> ${safe(ins.plan || "")}</div>
    <div><b>Policy #:</b> ${safe(ins.policyNo || "")}</div>
    <div><b>Coverage:</b> ${safe(ins.coverage || "")}</div>
  </div>

  <h2>Emergency Contact</h2>
  <div class="grid">
    <div><b>Name:</b> ${safe(eme.name || "")}</div>
    <div><b>Relationship:</b> ${safe(eme.relationship || "")}</div>
    <div><b>Phone:</b> ${safe(eme.phone || "")}</div>
  </div>

  <h2>Recent Encounters</h2>
  ${
    rows
      ? `<table>
      <thead><tr><th>Date/Time</th><th>Type</th><th>Status</th><th>Summary</th></tr></thead>
      <tbody>${rows}</tbody></table>`
      : `<div class="muted">No encounters recorded.</div>`
  }

  <div class="muted" style="margin-top:24px">Generated on ${new Date().toLocaleString()}</div>
</body>
</html>`;
}
