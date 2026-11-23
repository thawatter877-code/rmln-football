// Live football news from Sky Sports & BBC Sport RSS, auto-translated to Thai (cached in D1)
import { ensureRmlnSchema } from "../_lib/db";
import { translateGroupToThai } from "../_lib/translate";

interface Env {
  DB?: any;
}

interface LiveNewsItem {
  id: string;
  slug: string;
  title: string; // Thai if translation succeeded, else original English
  excerpt: string;
  content: string;
  titleOriginal: string;
  excerptOriginal: string;
  translated: boolean;
  category: string;
  categoryLabel: string;
  league: string;
  imageUrl: string;
  views: number;
  author: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  readTime: string;
}

const FEEDS = [
  { name: "Sky Sports", url: "https://www.skysports.com/rss/11095", league: "Premier League", label: "พรีเมียร์ลีก" },
  { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/rss.xml", league: "World Football", label: "ฟุตบอลต่างประเทศ" },
];
const PER_FEED = 8;

export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const translate = new URL(request.url).searchParams.get("translate") !== "0";
  try {
    if (env.DB) await ensureRmlnSchema(env.DB);

    // 1. Fetch + parse all feeds in parallel
    const perFeed = await Promise.all(
      FEEDS.map(async (feed) => {
        try {
          const res = await fetch(feed.url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; RMLN-Football/1.0)" },
            cf: { cacheTtl: 300, cacheEverything: true },
          } as RequestInit);
          if (!res.ok) return [];
          return parseFeed(await res.text(), feed);
        } catch {
          return [];
        }
      })
    );

    // De-duplicate by link
    const seen = new Set<string>();
    const items = perFeed.flat().filter((i) => (seen.has(i.sourceUrl) ? false : (seen.add(i.sourceUrl), true)));

    // 2. Translate title + summary per item (one request each, cached in D1), 4 at a time
    if (translate) {
      for (let i = 0; i < items.length; i += 4) {
        await Promise.all(
          items.slice(i, i + 4).map(async (item) => {
            const [t, d] = await translateGroupToThai(env.DB, [item.titleOriginal, item.excerptOriginal]);
            if (t) {
              item.title = t;
              item.excerpt = d || item.excerptOriginal;
              item.content = item.excerpt;
              item.translated = true;
            }
          })
        );
      }
    }

    items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    return new Response(JSON.stringify({ success: true, count: items.length, liveNews: items }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=120",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
};

async function parseFeed(xml: string, feed: (typeof FEEDS)[number]): Promise<LiveNewsItem[]> {
  const out: LiveNewsItem[] = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

  for (const item of itemMatches.slice(0, PER_FEED)) {
    const title = decodeEntities(tag(item, "title"));
    const desc = decodeEntities(tag(item, "description").replace(/<[^>]*>/g, "")).trim();
    const link = tag(item, "link").trim();
    const dateStr = tag(item, "pubDate").trim();
    const imgMatch =
      item.match(/<media:thumbnail[^>]+url="([^"]+)"/) ||
      item.match(/<media:content[^>]+url="([^"]+)"/) ||
      item.match(/<enclosure[^>]+url="([^"]+)"/);
    const img = imgMatch ? decodeEntities(imgMatch[1].trim()) : "";
    if (!title || !link) continue;

    const parsed = new Date(dateStr);
    const slug = `live-${await shortHash(link)}`;
    out.push({
      id: slug,
      slug,
      title,
      excerpt: desc,
      content: desc,
      titleOriginal: title,
      excerptOriginal: desc,
      translated: false,
      category: /transfer|sign|deal|bid/i.test(title) ? "transfer" : "breaking",
      categoryLabel: feed.label,
      league: feed.league,
      // BBC thumbnails are tiny (240px); ask their image CDN for a larger one
      imageUrl: img.replace(/\/ace\/standard\/\d+\//, "/ace/standard/976/"),
      views: 0,
      author: feed.name,
      sourceUrl: link,
      sourceName: feed.name,
      publishedAt: isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString(),
      readTime: "2 นาที",
    });
  }
  return out;
}

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`));
  if (!m) return "";
  return m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
}

async function shortHash(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
