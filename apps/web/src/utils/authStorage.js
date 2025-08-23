const KEY = "auth";

export function saveAuth(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}
export function loadAuth() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function clearAuth() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
