// api/src/modules/patients/utils.js
export function fullName(p = {}) {
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");
}
