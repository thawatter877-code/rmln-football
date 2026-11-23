// Real-time Live Football News Feed (Sky Sports & BBC Sport Live Aggregator)

interface LiveNewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
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

export const onRequestGet = async () => {
  try {
    const feeds = [
      { name: "Sky Sports Premier League", url: "https://www.skysports.com/rss/11095" },
      { name: "BBC Sport Football", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
    ];

    const results: LiveNewsItem[] = [];

    for (const feed of feeds) {
      try {
        const res = await fetch(feed.url, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RMLN-Football-Agent/1.0" },
        });

        if (!res.ok) continue;
        const xml = await res.text();
        const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

        for (const item of itemMatches.slice(0, 8)) {
          const titleMatch = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
          const descMatch = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || item.match(/<description>([\s\S]*?)<\/description>/);
          const linkMatch = item.match(/<link>(.*?)<\/link>/);
          const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
          const imgMatch = item.match(/<media:thumbnail[^>]+url="([^"]+)"/) || item.match(/url="([^"]+)"/);

          const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : "";
          const desc = descMatch ? decodeEntities(descMatch[1].replace(/<[^>]*>/g, "").trim()) : "";
          const link = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
          const dateStr = dateMatch ? dateMatch[1].trim() : "";
          const img = imgMatch ? decodeEntities(imgMatch[1].trim()) : "";

          if (title && link) {
            const parsed = new Date(dateStr);
            const publishedIso = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
            const slug = `live-${await shortHash(link)}`;

            results.push({
              id: slug,
              slug,
              title,
              excerpt: desc,
              content: desc,
              category: title.toLowerCase().includes("transfer") ? "transfer" : "breaking",
              categoryLabel: feed.name.includes("Premier") ? "พรีเมียร์ลีก" : "ฟุตบอลต่างประเทศ",
              league: feed.name.includes("Premier") ? "Premier League" : "World Football",
              imageUrl: img,
              views: 0,
              author: feed.name,
              sourceUrl: link,
              sourceName: feed.name,
              publishedAt: publishedIso,
              readTime: "2 นาที",
            });
          }
        }
      } catch {
        // Continue to next feed if one fails
      }
    }

    results.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    return new Response(JSON.stringify({ success: true, count: results.length, liveNews: results }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=180, s-maxage=300",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
};

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
