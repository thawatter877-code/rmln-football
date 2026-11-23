// Server-side authentication helpers: password hashing, JWT session cookies, role checks.
import { SignJWT, jwtVerify } from "jose";

export interface Env {
  DB?: any;
  JWT_SECRET?: string;
  ADMIN_EMAILS?: string; // comma-separated list of emails that get the admin role
}

export interface SessionUser {
  id: string;
  username: string;
  role: string;
}

const COOKIE_NAME = "rmln_session";
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 100_000; // Cloudflare Workers caps PBKDF2 at 100k iterations

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders },
  });
}

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return toHex(bits);
}

/** Format: pbkdf2$<iterations>$<saltHex>$<hashHex> */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${hash}`;
}

/** Old accounts were stored as sha256(password + static salt). */
async function legacyHash(password: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password + "rmln_magic_salt"));
  return toHex(buf);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Returns { ok, needsRehash } so legacy hashes can be upgraded after a successful login. */
export async function verifyPassword(password: string, stored: string): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (stored.startsWith("pbkdf2$")) {
    const [, iterStr, saltHex, hashHex] = stored.split("$");
    const hash = await pbkdf2(password, fromHex(saltHex), Number(iterStr));
    return { ok: safeEqual(hash, hashHex), needsRehash: false };
  }
  return { ok: safeEqual(await legacyHash(password), stored), needsRehash: true };
}

function getSecret(env: Env): Uint8Array {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET is not configured (set a random string of 32+ characters in Cloudflare Pages settings)");
  }
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function createSessionCookie(env: Env, user: SessionUser, request: Request): Promise<string> {
  const token = await new SignJWT({ username: user.username, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret(env));
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

/** Verifies the session cookie. Role is re-read from the DB so demotions take effect immediately. */
export async function getSessionUser(request: Request, env: Env): Promise<SessionUser | null> {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(env));
    if (!payload.sub) return null;
    if (env.DB) {
      const row = await env.DB.prepare("SELECT id, username, role FROM rmln_users WHERE id = ?").bind(payload.sub).first();
      if (!row) return null;
      return { id: row.id, username: row.username, role: row.role || "member" };
    }
    return { id: payload.sub, username: String(payload.username || ""), role: String(payload.role || "member") };
  } catch {
    return null;
  }
}

export function isAdminEmail(env: Env, email: string): boolean {
  const list = (env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

/**
 * RMLN shares its D1 database with undes-studio. An email that is an admin in undes-studio's
 * `users` table is treated as an RMLN admin too. Fails closed if that table doesn't exist.
 */
export async function isUndesStudioAdmin(env: Env, email: string): Promise<boolean> {
  if (!env.DB) return false;
  const row = await env.DB.prepare("SELECT role FROM users WHERE lower(email) = ? LIMIT 1")
    .bind(email.trim().toLowerCase())
    .first()
    .catch(() => null);
  return row?.role === "admin";
}

export async function shouldBeAdmin(env: Env, email: string): Promise<boolean> {
  return isAdminEmail(env, email) || (await isUndesStudioAdmin(env, email));
}

export const STAFF_ROLES = ["admin", "editor"];

/** Returns the session user if they have one of the roles, otherwise a 401/403 Response. */
export async function requireRole(request: Request, env: Env, roles: string[]): Promise<SessionUser | Response> {
  const session = await getSessionUser(request, env);
  if (!session) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  if (!roles.includes(session.role)) return json({ error: "คุณไม่มีสิทธิ์ทำรายการนี้" }, 403);
  return session;
}

export const PUBLIC_USER_COLUMNS =
  "id, username, email, display_name, favorite_club, coins, gems, academy_level, squad_count, max_squad, role";
