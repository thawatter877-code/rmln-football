// Shared news types + data loading (D1 articles via /api/news and RSS via /api/live-news)

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categoryLabel: string;
  league: string;
  club: string;
  imageUrl: string;
  views: number;
  author: string;
  isBreaking: boolean;
  isFeatured: boolean;
  publishedAt: string; // ISO timestamp
  readTime: string;
  /** Set for articles that come from an external RSS feed */
  sourceUrl?: string;
  sourceName?: string;
  /** Original English headline (for translated articles) */
  originalTitle?: string;
  /** true when the text was machine-translated and not yet edited by staff */
  autoTranslated?: boolean;
  /** user id of the staff member who published it (editorial articles only) */
  createdBy?: string;
  /** "published" | "draft" (drafts are only visible to staff) */
  status?: string;
  /** AI desk metadata: model + fact-check result */
  aiNotes?: { model?: string; factCheck?: { verdict: string; problems: string[] } } | null;
  isLive: boolean;
}

export interface NewsComment {
  id: string;
  userId: string;
  userName: string;
  userClub: string;
  content: string;
  createdAt: string;
}

/** Neutral placeholder (inline SVG, never fails to load) */
export const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">' +
      '<rect width="1200" height="750" fill="#1f6f43"/>' +
      '<g fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="6">' +
      '<rect x="60" y="60" width="1080" height="630"/><line x1="600" y1="60" x2="600" y2="690"/>' +
      '<circle cx="600" cy="375" r="95"/><rect x="60" y="235" width="150" height="280"/><rect x="990" y="235" width="150" height="280"/></g>' +
      '<text x="600" y="390" font-family="sans-serif" font-size="44" font-weight="700" fill="#ffffff" fill-opacity=".85" text-anchor="middle">RMLN</text>' +
      "</svg>"
  );

export function articleHref(a: Pick<NewsArticle, "slug">): string {
  return `/news/view?slug=${encodeURIComponent(a.slug)}`;
}

export function mapDbArticle(row: any): NewsArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    content: row.content || "",
    category: row.category || "breaking",
    categoryLabel: row.category_label || "ข่าว",
    league: row.league || "",
    club: row.club || "",
    imageUrl: row.image_url || FALLBACK_IMAGE,
    views: row.views || 0,
    author: row.author || "กองบรรณาธิการ RMLN",
    isBreaking: !!row.is_breaking,
    isFeatured: !!row.is_featured,
    publishedAt: toIso(row.published_at, row.created_at),
    readTime: row.read_time || "3 นาที",
    sourceUrl: row.source_url || undefined,
    sourceName: row.source_name || undefined,
    originalTitle: row.original_title || undefined,
    createdBy: row.created_by || undefined,
    status: row.status || "published",
    aiNotes: parseJson(row.ai_notes),
    isLive: false,
  };
}

export function mapLiveArticle(item: any): NewsArticle {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt || "",
    content: item.content || item.excerpt || "",
    category: item.category || "breaking",
    categoryLabel: item.categoryLabel || "ข่าวต่างประเทศ",
    league: item.league || "",
    club: "",
    imageUrl: item.imageUrl || FALLBACK_IMAGE,
    views: 0,
    author: item.author || item.sourceName || "",
    isBreaking: false,
    isFeatured: false,
    publishedAt: toIso(item.publishedAt, new Date().toISOString()),
    readTime: item.readTime || "2 นาที",
    sourceUrl: item.sourceUrl,
    sourceName: item.sourceName,
    originalTitle: item.titleOriginal,
    autoTranslated: !!item.translated,
    isLive: true,
  };
}

function parseJson(v: string | null | undefined) {
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

/** D1 stores CURRENT_TIMESTAMP as "YYYY-MM-DD HH:MM:SS" (UTC, no zone) */
function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? value.replace(" ", "T") + "Z" : value;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

/** First parseable date wins (e.g. published_at, then created_at); never invents "now" for stored rows */
function toIso(...values: (string | undefined | null)[]): string {
  for (const v of values) {
    const d = parseDate(v);
    if (d) return d.toISOString();
  }
  return new Date(0).toISOString();
}

export function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

export interface NewsFeed {
  articles: NewsArticle[]; // newest first: editorial (D1) + live RSS merged
  editorialCount: number;
  liveCount: number;
  errors: string[];
}

let feedPromise: Promise<NewsFeed> | null = null;
let feedFetchedAt = 0;

/** Loads all news once per page view (cached for 2 minutes) so Navbar + pages share one request. */
export function loadNewsFeed(force = false): Promise<NewsFeed> {
  if (!force && feedPromise && Date.now() - feedFetchedAt < 120_000) return feedPromise;
  feedFetchedAt = Date.now();
  feedPromise = (async () => {
    const errors: string[] = [];
    const [dbRes, liveRes] = await Promise.allSettled([
      fetch("/api/news").then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error || `ข่าวจากกองบรรณาธิการโหลดไม่สำเร็จ (${r.status})`);
        return (data.news || []).map(mapDbArticle) as NewsArticle[];
      }),
      fetch("/api/live-news").then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data?.success) throw new Error(data?.error || `ข่าวสดโหลดไม่สำเร็จ (${r.status})`);
        return (data.liveNews || []).map(mapLiveArticle) as NewsArticle[];
      }),
    ]);

    const editorial = dbRes.status === "fulfilled" ? dbRes.value : (errors.push(dbRes.reason?.message), []);
    const live = liveRes.status === "fulfilled" ? liveRes.value : (errors.push(liveRes.reason?.message), []);

    // Hide live items that staff already rewrote and published as an RMLN article
    const published = new Set(editorial.map((a) => a.sourceUrl).filter(Boolean));
    const articles = [...editorial, ...live.filter((a) => !published.has(a.sourceUrl))].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return { articles, editorialCount: editorial.length, liveCount: live.length, errors };
  })();
  return feedPromise;
}

export function matchesFilter(n: NewsArticle, filter: string): boolean {
  if (!filter || filter === "all") return true;
  const f = filter.toLowerCase();
  if (f === "breaking") return n.isBreaking || n.category === "breaking";
  return n.category.toLowerCase() === f || n.league.toLowerCase().includes(f);
}

/** <img onError> handler: swap to the fallback image once (never loops if the fallback also fails) */
export function handleImgError(e: { currentTarget: HTMLImageElement }) {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = FALLBACK_IMAGE;
}

// ---------- Real fixtures & standings (/api/football, ESPN data) ----------

export interface Match {
  id: string;
  league: string;
  date: string;
  state: "pre" | "in" | "post";
  statusText: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface StandingRow {
  rank: number;
  team: string;
  logo: string;
  played: number;
  points: number;
  goalDiff: number;
}

export interface FootballData {
  league: string;
  matches: Match[];
  standings: StandingRow[];
}

let footballPromise: Promise<FootballData> | null = null;

export function loadFootball(): Promise<FootballData> {
  if (!footballPromise) {
    footballPromise = fetch("/api/football")
      .then((r) => r.json())
      .then((d) => ({ league: d?.league || "", matches: d?.matches || [], standings: d?.standings || [] }))
      .catch(() => ({ league: "", matches: [], standings: [] }));
  }
  return footballPromise;
}

/** Live first, then most recent results, then the next fixtures */
export function pickMatches(matches: Match[], n: number): Match[] {
  const live = matches.filter((m) => m.state === "in");
  const done = matches.filter((m) => m.state === "post").sort((a, b) => b.date.localeCompare(a.date));
  const next = matches.filter((m) => m.state === "pre").sort((a, b) => a.date.localeCompare(b.date));
  return [...live, ...done.slice(0, Math.max(2, n - live.length - 2)), ...next].slice(0, n);
}

export function matchCenterText(m: Match): string {
  if (m.state === "pre") {
    return new Date(m.date).toLocaleString("th-TH", { weekday: "short", hour: "2-digit", minute: "2-digit" });
  }
  return `${m.homeScore ?? 0} - ${m.awayScore ?? 0}`;
}

export function matchStatusLabel(m: Match): string {
  if (m.state === "post") return "FT";
  if (m.state === "in") return m.statusText || "LIVE";
  return new Date(m.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}
