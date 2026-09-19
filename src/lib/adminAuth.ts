// ── Owner password for the Add Music panel ────────────────────────────────────
// Change OWNER_PASSWORD to whatever you want. This is a client-side check —
// enough to stop random visitors, not a cryptographic secret.

const OWNER_PASSWORD = "libr4admin";
const SESSION_KEY    = "libr4_owner_auth";

export function checkPassword(input: string): boolean {
  return input === OWNER_PASSWORD;
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function setAuthenticated() {
  sessionStorage.setItem(SESSION_KEY, "1");
}
