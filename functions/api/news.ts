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

      // Single article fetch
      if (slug) {
        // 1. Try rmln_news table
        let article = await env.DB.prepare("SELECT * FROM rmln_news WHERE slug = ? OR id = ?").bind(slug, slug).first().catch(() => null);
        
        if (article) {
          await env.DB.prepare("UPDATE rmln_news SET views = views + 1 WHERE id = ?").bind(article.id).run().catch(() => {});
          return new Response(JSON.stringify({ article }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        // 2. Try undes-studio central articles table
        const studioArticle = await env.DB.prepare(
          "SELECT * FROM articles WHERE (slug = ? OR id = ?) AND (is_published = 1 OR is_published IS NULL)"
        ).bind(slug, slug).first().catch(() => null);

        if (studioArticle) {
          await env.DB.prepare("UPDATE articles SET views_count = coalesce(views_count, 0) + 1 WHERE id = ?").bind(studioArticle.id).run().catch(() => {});
          
          const mappedArticle = {
            id: studioArticle.id,
            slug: studioArticle.slug || studioArticle.id,
            title: studioArticle.title,
            excerpt: studioArticle.excerpt || "",
            content: studioArticle.content,
            category: "analysis",
            category_label: studioArticle.category || "บทวิเคราะห์",
            league: studioArticle.tags?.split(",")[0] || "ฟุตบอลยุโรป",
            club: studioArticle.author_name || "RMLN Editorial",
            image_url: studioArticle.cover_image || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
            views: (studioArticle.views_count || 1) + 1,
            author: studioArticle.author_name || "กองบรรณาธิการ RMLN",
            is_breaking: 0,
            is_featured: 1,
            published_at: studioArticle.created_at ? new Date(studioArticle.created_at).toLocaleDateString("th-TH") : "เมื่อเร็วๆ นี้",
            read_time: studioArticle.read_time || "3 นาที",
          };

          return new Response(JSON.stringify({ article: mappedArticle }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ error: "Article not found" }), { status: 404 });
      }

      // Query list from rmln_news
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
      const { results: rmlnResults } = await stmt.all().catch(() => ({ results: [] }));
      const allNews = [...(rmlnResults || [])];

      // Also merge football-related articles from undes-studio articles table
      try {
        const { results: studioArticles } = await env.DB.prepare(
          `SELECT * FROM articles 
           WHERE (category LIKE '%พรีเมียร์ลีก%' 
              OR category LIKE '%แชมเปียนส์ลีก%' 
              OR category LIKE '%ตลาดซื้อขาย%' 
              OR category LIKE '%แท็กติก%' 
              OR category LIKE '%ฟุตบอล%' 
              OR category LIKE '%RMLN%' 
              OR tags LIKE '%football%' 
              OR tags LIKE '%rmln%'
              OR tags LIKE '%Premier League%')
             AND (is_published = 1 OR is_published IS NULL)
           ORDER BY created_at DESC LIMIT 20`
        ).all().catch(() => ({ results: [] }));

        if (studioArticles && studioArticles.length > 0) {
          const mappedStudio = studioArticles.map((sa: any) => ({
            id: sa.id,
            slug: sa.slug || sa.id,
            title: sa.title,
            excerpt: sa.excerpt || "",
            content: sa.content,
            category: "analysis",
            category_label: sa.category || "บทวิเคราะห์แท็กติก",
            league: sa.tags?.split(",")[0] || "ฟุตบอลยุโรป",
            club: "Undes Studio",
            image_url: sa.cover_image || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
            views: sa.views_count || 120,
            author: sa.author_name || "undes studio / RMLN",
            is_breaking: 0,
            is_featured: 1,
            published_at: sa.created_at ? new Date(sa.created_at).toLocaleDateString("th-TH") : "เมื่อเร็วๆ นี้",
            read_time: sa.read_time || "3 นาที",
          }));

          allNews.unshift(...mappedStudio);
        }
      } catch (e) {
        console.warn("Could not fetch studio articles:", e);
      }

      return new Response(JSON.stringify({ news: allNews }), {
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
