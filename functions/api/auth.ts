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

/** undes-studio shares this D1 database; its accounts live in the `users` table (missing -> null) */
async function findUndesUser(env: Env, email: string): Promise<any | null> {
  if (!email.includes("@")) return null;
  return env.DB.prepare("SELECT id, name, email, password_hash, role FROM users WHERE lower(email) = ? LIMIT 1")
    .bind(email.trim().toLowerCase())
    .first()
    .catch(() => null);
}

async function undesPasswordOk(undes: any, password: string): Promise<boolean> {
  const stored = String(undes?.password_hash || "");
  if (!stored.startsWith("pbkdf2$")) return false; // oauth / legacy accounts must use undes-studio first
  return (await verifyPassword(password, stored)).ok;
}

/** Pick a free RMLN username based on the undes-studio name/email */
async function freeUsername(env: Env, seed: string): Promise<string> {
  let base = seed.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 18);
  if (base.length < 3) base = `fan${base}`;
  let candidate = base;
  for (let i = 2; await env.DB.prepare("SELECT 1 FROM rmln_users WHERE lower(username) = ?").bind(candidate).first(); i++) {
    candidate = `${base}${i}`;
  }
  return candidate;
}

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

      const role = (await shouldBeAdmin(env, email)) ? "admin" : "member";
      const nowIso = new Date().toISOString();

      const existing = await env.DB.prepare(
        "SELECT id, username, lower(email) AS email, last_login_at FROM rmln_users WHERE lower(username) = lower(?) OR lower(email) = ?"
      )
        .bind(username, email)
        .first();

      if (existing) {
        // An account whose sign-up never completed (no session was ever issued, e.g. the server
        // failed right after saving it) can be finished by signing up again with the SAME
        // username AND email. Any account that has ever logged in is never overwritten.
        const unfinished =
          !existing.last_login_at && String(existing.username).toLowerCase() === username.toLowerCase() && existing.email === email;
        if (!unfinished) {
          if (existing.email === email && (await findUndesUser(env, email))) {
            return json({ error: "อีเมลนี้มีบัญชีอยู่แล้ว เข้าสู่ระบบด้วยอีเมลและรหัสผ่านเดียวกับ undes-studio ได้เลย" }, 400);
          }
          return json({ error: "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว" }, 400);
        }

        const cookie = await createSessionCookie(env, { id: existing.id, username, role }, request);
        await env.DB.prepare(
          "UPDATE rmln_users SET password_hash = ?, favorite_club = ?, role = ?, last_login_at = ? WHERE id = ?"
        )
          .bind(await hashPassword(password), favoriteClub, role, nowIso, existing.id)
          .run();
        return json({ success: true, user: await loadPublicUser(env, existing.id) }, 200, { "Set-Cookie": cookie });
      }

      const userId = `u-${crypto.randomUUID()}`;
      // Create the session first so a failure here can't leave a half-created account behind
      const cookie = await createSessionCookie(env, { id: userId, username, role }, request);

      await env.DB.prepare(
        `INSERT INTO rmln_users (id, username, email, password_hash, display_name, favorite_club, coins, gems, academy_level, squad_count, max_squad, role, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, 100000, 200, 'D4', 0, 50, ?, ?)`
      )
        .bind(userId, username, email, await hashPassword(password), username, favoriteClub, role, nowIso)
        .run();

      return json({ success: true, user: await loadPublicUser(env, userId) }, 200, { "Set-Cookie": cookie });
    }

    if (action === "login") {
      const identifier = String(body.username || "").trim();
      const password = String(body.password || "");
      if (!identifier || !password) return json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }, 400);

      let user = await env.DB.prepare("SELECT * FROM rmln_users WHERE lower(username) = lower(?) OR lower(email) = ?")
        .bind(identifier, identifier.toLowerCase())
        .first();

      // Same message for unknown user / wrong password to avoid account enumeration
      const invalid = () => json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, 401);

      let ok = false;
      let needsRehash = false;
      if (user) ({ ok, needsRehash } = await verifyPassword(password, user.password_hash));

      // Single sign-on with undes-studio (same D1): its email + password also work here
      if (!ok) {
        const undes = await findUndesUser(env, user?.email || identifier);
        if (undes && (await undesPasswordOk(undes, password))) {
          ok = true;
          needsRehash = true; // keep the RMLN password in sync with undes-studio
          if (!user) {
            const id = `u-${crypto.randomUUID()}`;
            const uname = await freeUsername(env, String(undes.email).split("@")[0]);
            await env.DB.prepare(
              `INSERT INTO rmln_users (id, username, email, password_hash, display_name, favorite_club, coins, gems, academy_level, squad_count, max_squad, role)
               VALUES (?, ?, ?, ?, ?, '', 100000, 200, 'D4', 0, 50, 'member')`
            )
              .bind(id, uname, String(undes.email).toLowerCase(), await hashPassword(password), String(undes.name || uname).slice(0, 60))
              .run();
            user = await env.DB.prepare("SELECT * FROM rmln_users WHERE id = ?").bind(id).first();
          }
        }
      }
      if (!user || !ok) return invalid();

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
      await env.DB.prepare("UPDATE rmln_users SET last_login_at = ? WHERE id = ?").bind(new Date().toISOString(), user.id).run();
      return json({ success: true, user: await loadPublicUser(env, user.id) }, 200, { "Set-Cookie": cookie });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};
