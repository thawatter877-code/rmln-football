import { ensureRmlnSchema, requireDb } from "../_lib/db";
import { Env, json, requireRole, getSessionUser, STAFF_ROLES } from "../_lib/auth";
import { CATEGORIES, insertArticle, estimateReadTime } from "../_lib/articles";

const PUBLISHED = "COALESCE(status, 'published') = 'published'";

// GET /api/news?slug=... | ?category=... | ?league=... | ?status=draft|all (staff only)
export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const category = url.searchParams.get("category");
  const league = url.searchParams.get("league");
  const statusParam = url.searchParams.get("status");

  try {
    await ensureRmlnSchema(env.DB);

    if (slug) {
      const article = await env.DB.prepare("SELECT * FROM rmln_news WHERE slug = ? OR id = ?").bind(slug, slug).first();
      if (!article) return json({ error: "Article not found" }, 404);
      if ((article.status || "published") !== "published") {
        const session = await getSessionUser(request, env);
        if (!session || !STAFF_ROLES.includes(session.role)) return json({ error: "Article not found" }, 404);
        return json({ article });
      }
      await env.DB.prepare("UPDATE rmln_news SET views = views + 1 WHERE id = ?").bind(article.id).run().catch(() => {});
      return json({ article: { ...article, views: (article.views || 0) + 1 } });
    }

    const where: string[] = [];
    const params: string[] = [];

    if (statusParam === "draft" || statusParam === "all") {
      const session = await getSessionUser(request, env);
      if (!session || !STAFF_ROLES.includes(session.role)) return json({ error: "คุณไม่มีสิทธิ์ทำรายการนี้" }, 403);
      if (statusParam === "draft") where.push("status = 'draft'");
    } else {
      where.push(PUBLISHED);
    }

    if (category && category !== "all") {
      where.push("category = ?");
      params.push(category);
    } else if (league && league !== "all") {
      where.push("league LIKE ?");
      params.push(`%${league}%`);
    }

    let query = "SELECT * FROM rmln_news";
    if (where.length) query += " WHERE " + where.join(" AND ");
    query += " ORDER BY COALESCE(published_at, created_at) DESC LIMIT 60";

    const stmt = params.length ? env.DB.prepare(query).bind(...params) : env.DB.prepare(query);
    const { results } = await stmt.all();
    const cache = statusParam ? "private, no-store" : "public, max-age=30";
    return json({ news: results || [] }, 200, { "Cache-Control": cache });
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

    const imageUrl = String(body.imageUrl || "").trim();
    if (imageUrl && !/^https:\/\//i.test(imageUrl)) return json({ error: "ลิงก์รูปภาพต้องขึ้นต้นด้วย https://" }, 400);
    const sourceUrl = String(body.sourceUrl || "").trim();
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) return json({ error: "ลิงก์แหล่งข่าวไม่ถูกต้อง" }, 400);
    if (sourceUrl) {
      const dup = await env.DB.prepare("SELECT slug FROM rmln_news WHERE source_url = ?").bind(sourceUrl).first();
      if (dup) return json({ error: "ข่าวนี้ถูกเรียบเรียงและเผยแพร่ไปแล้ว", slug: dup.slug }, 409);
    }

    const article = await insertArticle(env.DB, {
      title,
      excerpt: String(body.excerpt || ""),
      content,
      category: body.category,
      league: String(body.league || "").trim() || null,
      club: String(body.club || "").trim() || null,
      imageUrl: imageUrl || null,
      author: String(body.author || ""),
      isBreaking: !!body.isBreaking,
      isFeatured: !!body.isFeatured,
      sourceUrl: sourceUrl || null,
      sourceName: String(body.sourceName || "").trim() || null,
      originalTitle: String(body.originalTitle || "").trim() || null,
      createdBy: session.id,
      status: "published",
    });

    // The AI desk must not pick this story up again
    if (sourceUrl) {
      await env.DB.prepare(
        "INSERT OR REPLACE INTO rmln_ai_jobs (source_url, status, news_id, updated_at) VALUES (?, 'published', ?, CURRENT_TIMESTAMP)"
      )
        .bind(sourceUrl, article.id)
        .run()
        .catch(() => {});
    }

    return json({ success: true, article }, 201);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

// PATCH /api/news { id, title?, excerpt?, content?, category?, imageUrl?, isFeatured?, isBreaking?, status? } (staff)
// Used to review/edit AI drafts and publish them.
export const onRequestPatch = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;

  try {
    await ensureRmlnSchema(env.DB);
    const session = await requireRole(request, env, STAFF_ROLES);
    if (session instanceof Response) return session;

    const body: any = await request.json().catch(() => ({}));
    const id = String(body.id || "");
    const existing = id ? await env.DB.prepare("SELECT * FROM rmln_news WHERE id = ?").bind(id).first() : null;
    if (!existing) return json({ error: "Article not found" }, 404);

    // Editors may edit their own articles and AI-desk articles; admins anything
    if (session.role !== "admin" && existing.created_by !== session.id && existing.created_by !== "ai-desk") {
      return json({ error: "แก้ไขได้เฉพาะข่าวของคุณหรือข่าวจาก AI" }, 403);
    }

    const title = body.title !== undefined ? String(body.title).trim() : existing.title;
    const content = body.content !== undefined ? String(body.content).trim() : existing.content;
    if (!title || !content) return json({ error: "หัวข้อและเนื้อหาต้องไม่ว่าง" }, 400);
    const category = CATEGORIES[body.category] ? body.category : existing.category;
    const status = body.status === "draft" || body.status === "published" ? body.status : existing.status || "published";
    const imageUrl = body.imageUrl !== undefined ? String(body.imageUrl).trim() : existing.image_url;
    if (imageUrl && !/^https:\/\//i.test(imageUrl)) return json({ error: "ลิงก์รูปภาพต้องขึ้นต้นด้วย https://" }, 400);

    const becomingPublished = status === "published" && (existing.status || "published") !== "published";

    await env.DB.prepare(
      `UPDATE rmln_news SET title = ?, excerpt = ?, content = ?, category = ?, category_label = ?, image_url = ?,
         is_featured = ?, is_breaking = ?, status = ?, read_time = ?, published_at = ?
       WHERE id = ?`
    )
      .bind(
        title,
        body.excerpt !== undefined ? String(body.excerpt).trim() || title : existing.excerpt,
        content,
        category,
        CATEGORIES[category],
        imageUrl || null,
        body.isFeatured !== undefined ? (body.isFeatured ? 1 : 0) : existing.is_featured,
        body.isBreaking !== undefined ? (body.isBreaking ? 1 : 0) : existing.is_breaking,
        status,
        estimateReadTime(content),
        becomingPublished ? new Date().toISOString() : existing.published_at,
        id
      )
      .run();

    if (becomingPublished && existing.source_url) {
      await env.DB.prepare("UPDATE rmln_ai_jobs SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE source_url = ?")
        .bind(existing.source_url)
        .run()
        .catch(() => {});
    }

    const article = await env.DB.prepare("SELECT * FROM rmln_news WHERE id = ?").bind(id).first();
    return json({ success: true, article });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

// DELETE /api/news?id=... (admin: any article, editor: own articles and AI drafts)
export const onRequestDelete = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;

  try {
    await ensureRmlnSchema(env.DB);
    const session = await requireRole(request, env, STAFF_ROLES);
    if (session instanceof Response) return session;

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return json({ error: "Missing id" }, 400);

    const row = await env.DB.prepare("SELECT created_by, status, source_url FROM rmln_news WHERE id = ?").bind(id).first();
    if (!row) return json({ error: "Article not found" }, 404);
    const aiDraft = row.created_by === "ai-desk" && row.status === "draft";
    if (session.role !== "admin" && row.created_by !== session.id && !aiDraft) {
      return json({ error: "ลบได้เฉพาะข่าวที่คุณเขียนเอง" }, 403);
    }

    await env.DB.prepare("DELETE FROM rmln_comments WHERE news_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM rmln_reactions WHERE news_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM rmln_news WHERE id = ?").bind(id).run();
    // Remember the decision so the AI desk doesn't rewrite the same story again
    if (row.source_url) {
      await env.DB.prepare("UPDATE rmln_ai_jobs SET status = 'skipped', news_id = NULL, error = 'deleted by staff' WHERE source_url = ?")
        .bind(row.source_url)
        .run()
        .catch(() => {});
    }
    return json({ success: true });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};
