const encoder = new TextEncoder();

export const ADMIN_AUTH_COOKIE = "adminToken";

export interface AdminTokenPayload {
  sub: string;
  username: string;
  exp: number;
}

function base64UrlEncode(input: string | ArrayBuffer) {
  const bytes = typeof input === "string" ? encoder.encode(input) : new Uint8Array(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return atob(base64);
}

async function importKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export function getAdminTokenSecret() {
  return process.env.ADMIN_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "development-admin-token-secret";
}

export async function signAdminToken(payload: Omit<AdminTokenPayload, "exp">, maxAgeSeconds = 60 * 60 * 8) {
  const body: AdminTokenPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds };
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const data = `${header}.${encodedPayload}`;
  const signature = await crypto.subtle.sign("HMAC", await importKey(getAdminTokenSecret()), encoder.encode(data));
  return `${data}.${base64UrlEncode(signature)}`;
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const data = `${header}.${payload}`;
  const expected = base64UrlEncode(
    await crypto.subtle.sign("HMAC", await importKey(getAdminTokenSecret()), encoder.encode(data)),
  );
  if (signature !== expected) return null;

  const parsed = JSON.parse(base64UrlDecode(payload)) as AdminTokenPayload;
  return parsed.exp >= Math.floor(Date.now() / 1000) ? parsed : null;
}

export function bearerToken(value: string | null) {
  if (!value) return "";
  return value.startsWith("Bearer ") ? value.slice(7) : value;
}
