// apps/web/src/utils/authStorage.js
const KEY = "auth:v1";

const canUseStorage =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function loadAuth() {
  if (!canUseStorage) return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth(data) {
  if (!canUseStorage) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function clearAuth() {
  if (!canUseStorage) return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
