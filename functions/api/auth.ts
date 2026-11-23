import { ensureRmlnSchema, requireDb } from "../_lib/db";
import {
  Env,
  json,
  hashPassword,
  verifyPassword,
  createSessionCookie,
  clearSessionCookie,
  getSessionUser,
  shouldBeAdmin,
  PUBLIC_USER_COLUMNS,
} from "../_lib/auth";

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,24}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function loadPublicUser(env: Env, id: string) {
  return env.DB.prepare(`SELECT ${PUBLIC_USER_COLUMNS} FROM rmln_users WHERE id = ?`).bind(id).first();
}

// GET /api/auth -> current session user (or null)
export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;
  try {
    await ensureRmlnSchema(env.DB);
    const session = await getSessionUser(request, env);
    if (!session) return json({ user: null });
    return json({ user: await loadPublicUser(env, session.id) });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

// POST /api/auth { action: "register" | "login" | "logout", ... }
export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;

  try {
    const body: any = await request.json().catch(() => ({}));
    const action = body.action;
    await ensureRmlnSchema(env.DB);

    if (action === "logout") {
      return json({ success: true }, 200, { "Set-Cookie": clearSessionCookie() });
    }

    if (action === "register") {
      const username = String(body.username || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const favoriteClub = String(body.favoriteClub || "Arsenal").slice(0, 60);

      if (!USERNAME_RE.test(username)) {
        return json({ error: "ชื่อผู้ใช้ต้องเป็น a-z, 0-9, _ หรือ . ความยาว 3-24 ตัวอักษร" }, 400);
      }
      if (!EMAIL_RE.test(email)) return json({ error: "รูปแบบอีเมลไม่ถูกต้อง" }, 400);
      if (password.length < 8) return json({ error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }, 400);

      const existing = await env.DB.prepare("SELECT id FROM rmln_users WHERE username = ? OR email = ?")
        .bind(username, email)
        .first();
      if (existing) return json({ error: "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว" }, 400);

      const userId = `u-${crypto.randomUUID()}`;
      const role = (await shouldBeAdmin(env, email)) ? "admin" : "member";

      await env.DB.prepare(
        `INSERT INTO rmln_users (id, username, email, password_hash, display_name, favorite_club, coins, gems, academy_level, squad_count, max_squad, role)
         VALUES (?, ?, ?, ?, ?, ?, 100000, 200, 'D4', 0, 50, ?)`
      )
        .bind(userId, username, email, await hashPassword(password), username, favoriteClub, role)
        .run();

      const cookie = await createSessionCookie(env, { id: userId, username, role }, request);
      return json({ success: true, user: await loadPublicUser(env, userId) }, 200, { "Set-Cookie": cookie });
    }

    if (action === "login") {
      const identifier = String(body.username || "").trim();
      const password = String(body.password || "");
      if (!identifier || !password) return json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }, 400);

      const user = await env.DB.prepare("SELECT * FROM rmln_users WHERE username = ? OR email = ?")
        .bind(identifier, identifier.toLowerCase())
        .first();

      // Same message for unknown user / wrong password to avoid account enumeration
      const invalid = () => json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, 401);
      if (!user) return invalid();

      const { ok, needsRehash } = await verifyPassword(password, user.password_hash);
      if (!ok) return invalid();

      if (needsRehash) {
        await env.DB.prepare("UPDATE rmln_users SET password_hash = ? WHERE id = ?")
          .bind(await hashPassword(password), user.id)
          .run();
      }

      let role = user.role || "member";
      if (role !== "admin" && (await shouldBeAdmin(env, user.email))) {
        role = "admin";
        await env.DB.prepare("UPDATE rmln_users SET role = 'admin' WHERE id = ?").bind(user.id).run();
      }

      const cookie = await createSessionCookie(env, { id: user.id, username: user.username, role }, request);
      return json({ success: true, user: await loadPublicUser(env, user.id) }, 200, { "Set-Cookie": cookie });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};
