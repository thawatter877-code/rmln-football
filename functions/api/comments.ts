import { ensureRmlnSchema } from "../_lib/db";

interface Env {
  DB?: any;
}

export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const url = new URL(request.url);
  const newsId = url.searchParams.get("newsId");

  try {
    if (env.DB && newsId) {
      await ensureRmlnSchema(env.DB);
      const { results } = await env.DB.prepare(
        "SELECT * FROM rmln_comments WHERE news_id = ? ORDER BY created_at DESC LIMIT 100"
      ).bind(newsId).all();

      return new Response(JSON.stringify({ comments: results || [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ comments: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  try {
    const body: any = await request.json();
    const { newsId, userId, userName, userClub, content } = body;

    if (!newsId || !content || !content.trim()) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    if (env.DB) {
      await ensureRmlnSchema(env.DB);
      const commentId = `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      await env.DB.prepare(`
        INSERT INTO rmln_comments (id, news_id, user_id, user_name, user_club, content, likes_count)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `).bind(
        commentId,
        newsId,
        userId || "anonymous",
        userName || "แฟนบอล RMLN",
        userClub || "Arsenal",
        content.trim()
      ).run();

      const created = await env.DB.prepare("SELECT * FROM rmln_comments WHERE id = ?").bind(commentId).first();

      return new Response(JSON.stringify({ success: true, comment: created }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, comment: body }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
