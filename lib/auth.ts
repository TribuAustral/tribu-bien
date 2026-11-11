// Sesión simple con contraseña compartida. Funciona en Edge (middleware) y Node.
export const COOKIE_NAME = "club_session";

// Sin APP_PASSWORD configurada nadie puede entrar (no hay clave por defecto).
const NO_PASSWORD = "__sin-clave__" + crypto.randomUUID();
export function appPassword(): string {
  return process.env.APP_PASSWORD?.trim() || NO_PASSWORD;
}

export async function expectedToken(): Promise<string> {
  const password = appPassword();
  const secret = process.env.AUTH_SECRET?.trim() || "dev-secret";
  const data = new TextEncoder().encode(`${password}::${secret}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  return token === (await expectedToken());
}
