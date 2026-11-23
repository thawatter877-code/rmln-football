import { ensureRmlnSchema, requireDb } from "../_lib/db";
import { Env, json, getSessionUser } from "../_lib/auth";

// GET /api/comments?newsId=...
export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;

  const newsId = new URL(request.url).searchParams.get("newsId");
  if (!newsId) return json({ comments: [] });

  try {
    await ensureRmlnSchema(env.DB);
    const { results } = await env.DB.prepare(
      "SELECT id, news_id, user_id, user_name, user_club, content, likes_count, created_at FROM rmln_comments WHERE news_id = ? ORDER BY created_at DESC LIMIT 100"
    )
      .bind(newsId)
      .all();
    return json({ comments: results || [] });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

// POST /api/comments { newsId, content } — author comes from the session, never the request body
export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;

  try {
    await ensureRmlnSchema(env.DB);
    const session = await getSessionUser(request, env);
    if (!session) return json({ error: "กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น" }, 401);

    const body: any = await request.json().catch(() => ({}));
    const newsId = String(body.newsId || "").trim();
    const content = String(body.content || "").trim();
    if (!newsId || !content) return json({ error: "Missing required fields" }, 400);
    if (content.length > 2000) return json({ error: "ความคิดเห็นยาวเกิน 2,000 ตัวอักษร" }, 400);

    // Basic flood protection: max 1 comment per 10 seconds per user
    const recent = await env.DB.prepare(
      "SELECT 1 FROM rmln_comments WHERE user_id = ? AND created_at > datetime('now', '-10 seconds')"
    )
      .bind(session.id)
      .first();
    if (recent) return json({ error: "กรุณารอสักครู่ก่อนแสดงความคิดเห็นอีกครั้ง" }, 429);

    const user = await env.DB.prepare("SELECT display_name, username, favorite_club FROM rmln_users WHERE id = ?")
      .bind(session.id)
      .first();

    const commentId = `c-${crypto.randomUUID()}`;
    await env.DB.prepare(
      "INSERT INTO rmln_comments (id, news_id, user_id, user_name, user_club, content, likes_count) VALUES (?, ?, ?, ?, ?, ?, 0)"
    )
      .bind(commentId, newsId, session.id, user?.display_name || user?.username || session.username, user?.favorite_club || null, content)
      .run();

    const created = await env.DB.prepare("SELECT * FROM rmln_comments WHERE id = ?").bind(commentId).first();
    return json({ success: true, comment: created }, 201);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};
