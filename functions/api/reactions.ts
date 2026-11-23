import { ensureRmlnSchema, requireDb } from "../_lib/db";
import { Env, json, getSessionUser } from "../_lib/auth";

const TYPES = ["fire", "magic", "clap"] as const;

async function counts(env: Env, newsId: string) {
  const { results } = await env.DB.prepare(
    "SELECT reaction_type, COUNT(*) AS total FROM rmln_reactions WHERE news_id = ? GROUP BY reaction_type"
  )
    .bind(newsId)
    .all();
  const out: Record<string, number> = { fire: 0, magic: 0, clap: 0 };
  for (const r of results || []) if (r.reaction_type in out) out[r.reaction_type] = r.total;
  return out;
}

// GET /api/reactions?newsId=... -> { reactions, mine }
export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;
  const newsId = new URL(request.url).searchParams.get("newsId");
  if (!newsId) return json({ error: "Missing newsId" }, 400);
  try {
    await ensureRmlnSchema(env.DB);
    const session = await getSessionUser(request, env);
    const mine = session
      ? await env.DB.prepare("SELECT reaction_type FROM rmln_reactions WHERE news_id = ? AND user_id = ?")
          .bind(newsId, session.id)
          .first()
      : null;
    return json({ reactions: await counts(env, newsId), mine: mine?.reaction_type || null });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

// POST /api/reactions { newsId, type } — one reaction per user per article (changing it replaces the old one)
export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;
  try {
    await ensureRmlnSchema(env.DB);
    const session = await getSessionUser(request, env);
    if (!session) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);

    const body: any = await request.json().catch(() => ({}));
    const newsId = String(body.newsId || "").trim();
    const type = body.type;
    if (!newsId || !TYPES.includes(type)) return json({ error: "Invalid reaction" }, 400);

    await env.DB.prepare("DELETE FROM rmln_reactions WHERE news_id = ? AND user_id = ?").bind(newsId, session.id).run();
    await env.DB.prepare("INSERT INTO rmln_reactions (id, news_id, user_id, reaction_type) VALUES (?, ?, ?, ?)")
      .bind(`r-${crypto.randomUUID()}`, newsId, session.id, type)
      .run();

    return json({ success: true, reactions: await counts(env, newsId), mine: type });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};
