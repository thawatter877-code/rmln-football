// English -> Thai translation with a D1 cache so each text is translated only once.
// Uses Google Translate's public endpoint (no API key). Results are cached in rmln_translations.

async function sha1(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function googleTranslate(text: string): Promise<string | null> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=th&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return null;
  const data: any = await res.json().catch(() => null);
  if (!Array.isArray(data?.[0])) return null;
  const out = data[0].map((seg: any) => (Array.isArray(seg) ? seg[0] || "" : "")).join("");
  return out.trim() || null;
}

/**
 * Translates several short texts that belong together (e.g. title + summary) with ONE request,
 * using a blank-line separator. Cached per combined text. Returns null entries when translation failed.
 */
export async function translateGroupToThai(db: any, parts: string[]): Promise<(string | null)[]> {
  const clean = parts.map((p) => (p || "").replace(/\s+/g, " ").trim());
  const joined = clean.join("\n\n");
  if (!joined.trim()) return clean.map(() => null);

  const key = await sha1(joined);
  if (db) {
    const hit = await db.prepare("SELECT th FROM rmln_translations WHERE hash = ?").bind(key).first().catch(() => null);
    if (hit?.th) return splitParts(hit.th, clean.length);
  }

  let th: string | null = null;
  try {
    th = await googleTranslate(joined.slice(0, 4500));
  } catch {
    th = null;
  }
  if (!th) return clean.map(() => null);

  const result = splitParts(th, clean.length);
  // Only cache when the separator survived, otherwise the split is unreliable
  if (db && result.every((r, i) => r !== null || !clean[i])) {
    await db
      .prepare("INSERT OR REPLACE INTO rmln_translations (hash, source, th) VALUES (?, ?, ?)")
      .bind(key, joined, th)
      .run()
      .catch(() => {});
  }
  return result;
}

function splitParts(th: string, count: number): (string | null)[] {
  const pieces = th.split(/\n\s*\n/).map((s) => s.trim());
  if (pieces.length === count) return pieces;
  if (count === 1) return [th.trim()];
  return Array(count).fill(null);
}

/** Translate a longer body (paragraph by paragraph is unnecessary for summaries; used by the news desk) */
export async function translateTextToThai(db: any, text: string): Promise<string | null> {
  const [th] = await translateGroupToThai(db, [text]);
  return th;
}
