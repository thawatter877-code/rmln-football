import { ensureRmlnSchema } from "../_lib/db";

interface Env {
  DB?: any;
}

export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const category = url.searchParams.get("category");
  const league = url.searchParams.get("league");

  try {
    if (env.DB) {
      await ensureRmlnSchema(env.DB);

      if (slug) {
        const article = await env.DB.prepare("SELECT * FROM rmln_news WHERE slug = ? OR id = ?").bind(slug, slug).first();
        if (!article) {
          return new Response(JSON.stringify({ error: "Article not found" }), { status: 404 });
        }
        // Increment views
        await env.DB.prepare("UPDATE rmln_news SET views = views + 1 WHERE id = ?").bind(article.id).run().catch(() => {});
        return new Response(JSON.stringify({ article }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      let query = "SELECT * FROM rmln_news";
      const params: any[] = [];

      if (category && category !== "all") {
        query += " WHERE category = ?";
        params.push(category);
      } else if (league && league !== "all") {
        query += " WHERE league LIKE ?";
        params.push(`%${league}%`);
      }

      query += " ORDER BY created_at DESC LIMIT 50";

      const stmt = params.length > 0 ? env.DB.prepare(query).bind(...params) : env.DB.prepare(query);
      const { results } = await stmt.all();

      return new Response(JSON.stringify({ news: results || [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ news: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
