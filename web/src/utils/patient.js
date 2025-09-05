// Small helpers used by the Patients UI (JS not TS)

export function fullName(p = {}) {
  const parts = [p.firstName, p.middleName, p.lastName].filter(Boolean);
  return parts.join(" ").trim();
}

export function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(+d)) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age < 0 ? null : age;
}
