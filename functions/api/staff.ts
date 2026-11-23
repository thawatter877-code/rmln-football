// Staff management (admin only): list staff, search members, change roles.
import { ensureRmlnSchema, requireDb } from "../_lib/db";
import { Env, json, requireRole } from "../_lib/auth";

const ROLES = ["admin", "editor", "member"];
const COLUMNS = "id, username, email, display_name, role, created_at";

// GET /api/staff            -> { staff: [...] }  (admins + editors)
// GET /api/staff?q=somchai  -> { results: [...] } (search any user by username/email)
export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;
  try {
    await ensureRmlnSchema(env.DB);
    const session = await requireRole(request, env, ["admin"]);
    if (session instanceof Response) return session;

    const q = (new URL(request.url).searchParams.get("q") || "").trim().toLowerCase();
    if (q) {
      const like = `%${q.replace(/[%_]/g, "")}%`;
      const { results } = await env.DB.prepare(
        `SELECT ${COLUMNS} FROM rmln_users WHERE lower(username) LIKE ? OR lower(email) LIKE ? OR lower(display_name) LIKE ? ORDER BY created_at DESC LIMIT 20`
      )
        .bind(like, like, like)
        .all();
      return json({ results: results || [] });
    }

    const { results } = await env.DB.prepare(
      `SELECT ${COLUMNS} FROM rmln_users WHERE role IN ('admin', 'editor') ORDER BY role, created_at`
    ).all();
    return json({ staff: results || [] });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

// POST /api/staff { userId, role: "admin" | "editor" | "member" }
export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;
  try {
    await ensureRmlnSchema(env.DB);
    const session = await requireRole(request, env, ["admin"]);
    if (session instanceof Response) return session;

    const body: any = await request.json().catch(() => ({}));
    const userId = String(body.userId || "");
    const role = String(body.role || "");
    if (!userId || !ROLES.includes(role)) return json({ error: "ข้อมูลไม่ถูกต้อง" }, 400);
    if (userId === session.id && role !== "admin") {
      return json({ error: "ไม่สามารถลดสิทธิ์ตัวเองได้ ให้ผู้ดูแลคนอื่นทำแทน" }, 400);
    }

    const res = await env.DB.prepare("UPDATE rmln_users SET role = ? WHERE id = ?").bind(role, userId).run();
    if (!res.meta?.changes) return json({ error: "ไม่พบผู้ใช้" }, 404);

    const user = await env.DB.prepare(`SELECT ${COLUMNS} FROM rmln_users WHERE id = ?`).bind(userId).first();
    return json({ success: true, user });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};
