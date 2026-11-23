// Top 100 young players
// GET  /api/prospects                       -> public list (hidden rows excluded; staff get everything with ?all=1)
// POST /api/prospects { action: "refresh", group: "GK"|"DEF"|"MID"|"FWD" }   (staff) -> AI research + verify
// POST /api/prospects { action: "update", id, hidden?, club?, highlight?, ... }  (staff)
// POST /api/prospects { action: "delete", id }                                  (staff)
import { requireDb } from "../_lib/db";
import { json, requireRole, getSessionUser, STAFF_ROLES } from "../_lib/auth";
import { ensureProspectTable, refreshGroup, GROUPS, ProspectEnv } from "../_lib/prospects";

type Env = ProspectEnv & { JWT_SECRET?: string; ADMIN_EMAILS?: string };

export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;
  try {
    await ensureProspectTable(env.DB);
    let includeHidden = false;
    if (new URL(request.url).searchParams.get("all") === "1") {
      const s = await getSessionUser(request, env);
      includeHidden = !!s && STAFF_ROLES.includes(s.role);
    }
    const { results } = await env.DB.prepare(
      `SELECT * FROM rmln_prospects ${includeHidden ? "" : "WHERE hidden = 0"} ORDER BY score DESC, birth_date DESC LIMIT 200`
    ).all();
    const updated = await env.DB.prepare("SELECT MAX(updated_at) AS t FROM rmln_prospects").first();
    return json(
      { players: results || [], updatedAt: updated?.t || null, groups: GROUPS },
      200,
      { "Cache-Control": includeHidden ? "no-store" : "public, max-age=300" }
    );
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

const EDITABLE = ["name", "name_th", "birth_date", "nationality", "nationality_th", "position", "position_th", "club", "league", "highlight"];

export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;
  try {
    await ensureProspectTable(env.DB);
    const session = await requireRole(request, env, STAFF_ROLES);
    if (session instanceof Response) return session;
    const body: any = await request.json().catch(() => ({}));

    if (body.action === "refresh") {
      if (!GROUPS[body.group]) return json({ error: "Unknown group" }, 400);
      const result = await refreshGroup(env, body.group);
      return json({ success: true, result });
    }

    if (body.action === "update" || body.action === "delete") {
      const id = String(body.id || "");
      const row = id ? await env.DB.prepare("SELECT id FROM rmln_prospects WHERE id = ?").bind(id).first() : null;
      if (!row) return json({ error: "ไม่พบนักเตะ" }, 404);

      if (body.action === "delete") {
        await env.DB.prepare("DELETE FROM rmln_prospects WHERE id = ?").bind(id).run();
        return json({ success: true });
      }

      const sets: string[] = [];
      const vals: any[] = [];
      for (const k of EDITABLE) {
        if (body[k] !== undefined) {
          sets.push(`${k} = ?`);
          vals.push(String(body[k]).trim() || null);
        }
      }
      if (body.hidden !== undefined) {
        sets.push("hidden = ?");
        vals.push(body.hidden ? 1 : 0);
      }
      if (body.score !== undefined) {
        sets.push("score = ?");
        vals.push(Math.max(1, Math.min(100, Math.round(Number(body.score) || 50))));
      }
      if (!sets.length) return json({ error: "ไม่มีข้อมูลให้แก้ไข" }, 400);
      // A staff edit (other than hiding) marks the row as human-checked and protects it from AI refreshes
      const contentEdit = sets.some((s) => !s.startsWith("hidden"));
      if (contentEdit) {
        sets.push("edited_by_staff = 1", "verified = 1", "verify_note = ?");
        vals.push(`edited by ${session.username}`);
      }
      sets.push("updated_at = ?");
      vals.push(new Date().toISOString());

      await env.DB.prepare(`UPDATE rmln_prospects SET ${sets.join(", ")} WHERE id = ?`).bind(...vals, id).run();
      const player = await env.DB.prepare("SELECT * FROM rmln_prospects WHERE id = ?").bind(id).first();
      return json({ success: true, player });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};
