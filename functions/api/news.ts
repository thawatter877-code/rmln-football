import { ensureRmlnSchema, requireDb } from "../_lib/db";
import { Env, json, requireRole, STAFF_ROLES } from "../_lib/auth";

const CATEGORIES: Record<string, string> = {
  breaking: "ข่าวด่วน",
  transfer: "ตลาดซื้อขาย",
  match_report: "รายงานการแข่งขัน",
  analysis: "บทวิเคราะห์",
  feature: "สกู๊ปพิเศษ",
};

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFC")
    // keep Thai characters, latin letters, digits, spaces and dashes
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  return base || "news";
}

function estimateReadTime(content: string): string {
  const minutes = Math.max(1, Math.round(content.length / 900));
  return `${minutes} นาที`;
}

// GET /api/news?slug=... | ?category=... | ?league=...
export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const category = url.searchParams.get("category");
  const league = url.searchParams.get("league");

  try {
    await ensureRmlnSchema(env.DB);

    if (slug) {
      const article = await env.DB.prepare("SELECT * FROM rmln_news WHERE slug = ? OR id = ?").bind(slug, slug).first();
      if (!article) return json({ error: "Article not found" }, 404);
      await env.DB.prepare("UPDATE rmln_news SET views = views + 1 WHERE id = ?").bind(article.id).run().catch(() => {});
      return json({ article: { ...article, views: (article.views || 0) + 1 } });
    }

    let query = "SELECT * FROM rmln_news";
    const params: string[] = [];
    if (category && category !== "all") {
      query += " WHERE category = ?";
      params.push(category);
    } else if (league && league !== "all") {
      query += " WHERE league LIKE ?";
      params.push(`%${league}%`);
    }
    query += " ORDER BY COALESCE(published_at, created_at) DESC LIMIT 50";

    const stmt = params.length ? env.DB.prepare(query).bind(...params) : env.DB.prepare(query);
    const { results } = await stmt.all();
    return json({ news: results || [] }, 200, { "Cache-Control": "public, max-age=30" });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

// POST /api/news (staff: admin/editor) -> create article
export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;

  try {
    await ensureRmlnSchema(env.DB);
    const session = await requireRole(request, env, STAFF_ROLES);
    if (session instanceof Response) return session;

    const body: any = await request.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    const content = String(body.content || "").trim();
    if (!title || !content) return json({ error: "กรุณากรอกหัวข้อและเนื้อหาข่าว" }, 400);
    if (title.length > 300) return json({ error: "หัวข้อข่าวยาวเกินไป" }, 400);

    const category = CATEGORIES[body.category] ? body.category : "breaking";
    const imageUrl = String(body.imageUrl || "").trim();
    if (imageUrl && !/^https:\/\//i.test(imageUrl)) return json({ error: "ลิงก์รูปภาพต้องขึ้นต้นด้วย https://" }, 400);
    const sourceUrl = String(body.sourceUrl || "").trim();
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) return json({ error: "ลิงก์แหล่งข่าวไม่ถูกต้อง" }, 400);
    if (sourceUrl) {
      const dup = await env.DB.prepare("SELECT slug FROM rmln_news WHERE source_url = ?").bind(sourceUrl).first();
      if (dup) return json({ error: "ข่าวนี้ถูกเรียบเรียงและเผยแพร่ไปแล้ว", slug: dup.slug }, 409);
    }

    // Make the slug unique
    const baseSlug = slugify(title);
    let slug = baseSlug;
    for (let i = 2; await env.DB.prepare("SELECT 1 FROM rmln_news WHERE slug = ?").bind(slug).first(); i++) {
      slug = `${baseSlug}-${i}`;
    }

    const id = `n-${crypto.randomUUID()}`;
    await env.DB.prepare(
      `INSERT INTO rmln_news
       (id, slug, title, excerpt, content, category, category_label, league, club, image_url, views, author, is_breaking, is_featured, published_at, read_time,
        source_url, source_name, original_title, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        slug,
        title,
        String(body.excerpt || "").trim() || title,
        content,
        category,
        CATEGORIES[category],
        String(body.league || "").trim() || null,
        String(body.club || "").trim() || null,
        imageUrl || null,
        String(body.author || "").trim() || "กองบรรณาธิการ RMLN",
        body.isBreaking ? 1 : 0,
        body.isFeatured ? 1 : 0,
        new Date().toISOString(),
        estimateReadTime(content),
        sourceUrl || null,
        String(body.sourceName || "").trim() || null,
        String(body.originalTitle || "").trim() || null,
        session.id
      )
      .run();

    const article = await env.DB.prepare("SELECT * FROM rmln_news WHERE id = ?").bind(id).first();
    return json({ success: true, article }, 201);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

// DELETE /api/news?id=... (admin: any article, editor: only their own)
export const onRequestDelete = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;

  try {
    await ensureRmlnSchema(env.DB);
    const session = await requireRole(request, env, STAFF_ROLES);
    if (session instanceof Response) return session;

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return json({ error: "Missing id" }, 400);

    if (session.role !== "admin") {
      const own = await env.DB.prepare("SELECT created_by FROM rmln_news WHERE id = ?").bind(id).first();
      if (!own) return json({ error: "Article not found" }, 404);
      if (own.created_by !== session.id) return json({ error: "ลบได้เฉพาะข่าวที่คุณเขียนเอง" }, 403);
    }

    await env.DB.prepare("DELETE FROM rmln_comments WHERE news_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM rmln_reactions WHERE news_id = ?").bind(id).run();
    const res = await env.DB.prepare("DELETE FROM rmln_news WHERE id = ?").bind(id).run();
    if (!res.meta?.changes) return json({ error: "Article not found" }, 404);
    return json({ success: true });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};
