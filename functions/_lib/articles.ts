// Shared article helpers used by /api/news (staff) and the AI desk

export const CATEGORIES: Record<string, string> = {
  breaking: "ข่าวด่วน",
  transfer: "ตลาดซื้อขาย",
  match_report: "รายงานการแข่งขัน",
  analysis: "บทวิเคราะห์",
  feature: "สกู๊ปพิเศษ",
};

export function slugify(text: string): string {
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

export function estimateReadTime(content: string): string {
  const minutes = Math.max(1, Math.round(content.length / 900));
  return `${minutes} นาที`;
}

export interface NewArticle {
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  league?: string | null;
  club?: string | null;
  imageUrl?: string | null;
  author?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  sourceUrl?: string | null;
  sourceName?: string | null;
  originalTitle?: string | null;
  createdBy: string;
  status?: "published" | "draft";
  aiNotes?: string | null;
}

/** Inserts an article with a unique slug and returns the stored row */
export async function insertArticle(db: any, a: NewArticle): Promise<any> {
  const category = CATEGORIES[a.category || ""] ? (a.category as string) : "breaking";

  const baseSlug = slugify(a.title);
  let slug = baseSlug;
  for (let i = 2; await db.prepare("SELECT 1 FROM rmln_news WHERE slug = ?").bind(slug).first(); i++) {
    slug = `${baseSlug}-${i}`;
  }

  const id = `n-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO rmln_news
       (id, slug, title, excerpt, content, category, category_label, league, club, image_url, views, author, is_breaking, is_featured,
        published_at, read_time, source_url, source_name, original_title, created_by, status, ai_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      slug,
      a.title,
      (a.excerpt || "").trim() || a.title,
      a.content,
      category,
      CATEGORIES[category],
      a.league || null,
      a.club || null,
      a.imageUrl || null,
      (a.author || "").trim() || "กองบรรณาธิการ RMLN",
      a.isBreaking ? 1 : 0,
      a.isFeatured ? 1 : 0,
      new Date().toISOString(),
      estimateReadTime(a.content),
      a.sourceUrl || null,
      a.sourceName || null,
      a.originalTitle || null,
      a.createdBy,
      a.status || "published",
      a.aiNotes || null
    )
    .run();

  return db.prepare("SELECT * FROM rmln_news WHERE id = ?").bind(id).first();
}
