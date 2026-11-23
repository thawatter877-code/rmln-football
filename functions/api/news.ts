interface Env {
  DB?: any;
}

export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const league = url.searchParams.get("league");
  const slug = url.searchParams.get("slug");

  try {
    if (env.DB) {
      if (slug) {
        const item = await env.DB.prepare("SELECT * FROM rmln_news WHERE slug = ?").bind(slug).first();
        return new Response(JSON.stringify({ news: item }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      let query = "SELECT * FROM rmln_news ORDER BY published_at DESC LIMIT 30";
      const { results } = await env.DB.prepare(query).all();
      return new Response(JSON.stringify({ news: results }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Default response if DB not yet bound
    return new Response(JSON.stringify({ status: "ok", message: "RMLN News API ready" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
