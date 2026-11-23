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
          const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
          const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/);
          const linkMatch = item.match(/<link>(.*?)<\/link>/);
          const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
          const imgMatch = item.match(/<media:thumbnail[^>]+url="([^"]+)"/) || item.match(/url="([^"]+)"/);

          const title = titleMatch ? titleMatch[1].trim() : "";
          const desc = descMatch ? descMatch[1].replace(/<[^>]*>/g, "").trim() : "";
          const link = linkMatch ? linkMatch[1].trim() : "";
          const dateStr = dateMatch ? dateMatch[1].trim() : "";
          const img = imgMatch ? imgMatch[1].trim() : "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80";

          if (title && link) {
            const timeAgo = formatTimeAgo(dateStr);
            const slug = slugify(title);

            results.push({
              id: `live-${slug.slice(0, 30)}`,
              slug,
              title,
              excerpt: desc,
              content: `${desc}\n\nรายงานสดส่งตรงจาก ${feed.name} ติดตามความคืบหน้าอย่างเป็นทางการได้ที่ลิงก์ต้นทาง: ${link}`,
              category: title.toLowerCase().includes("transfer") ? "transfer" : "breaking",
              categoryLabel: feed.name.includes("Premier") ? "พรีเมียร์ลีก สด" : "ฟุตบอลโลก สด",
              league: feed.name.includes("Premier") ? "Premier League" : "World Football",
              imageUrl: img,
              views: Math.floor(Math.random() * 5000) + 1200,
              author: feed.name,
              sourceUrl: link,
              sourceName: feed.name,
              publishedAt: timeAgo,
              readTime: "2 นาที",
            });
          }
        }
      } catch {
        // Continue to next feed if one fails
      }
    }

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

function formatTimeAgo(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "วันนี้";
    const diffMin = Math.floor((Date.now() - d.getTime()) / (1000 * 60));
    if (diffMin < 60) return `${Math.max(1, diffMin)} นาทีที่แล้ว`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffHours / 24)} วันที่แล้ว`;
  } catch {
    return "วันนี้";
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}
