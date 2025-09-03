// utils/authStorage.js
const KEY = "auth";
const BRANCH_KEY = "X-Branch-Id";

export function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}
export function saveAuth({ token, user, branchId }) {
  const payload = {
    token: token ?? null,
    user: user ?? null,
    branchId: branchId ?? null,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
    if (payload.token) localStorage.setItem("token", payload.token);
    else localStorage.removeItem("token");
    if (payload.branchId) localStorage.setItem(BRANCH_KEY, payload.branchId);
    else localStorage.removeItem(BRANCH_KEY);
  } catch {}
}
export function clearAuth() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem("token");
    localStorage.removeItem(BRANCH_KEY);
  } catch {}
}
