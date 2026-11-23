// AI news desk: turns new Sky Sports / BBC Sport stories into original Thai articles with Google Gemini.
//
// Pipeline per story:
//   1. fetch the full source article text
//   2. WRITER  – Gemini rewrites it as a new Thai article using only facts from the source
//   3. CHECKER – a second Gemini call compares the Thai article with the source and lists any
//                unsupported / wrong claims
//   4. publish automatically when the checker passes (and auto-publish is on), otherwise save as a
//      draft for staff to review in /admin
//
// Runs are throttled (one run per RUN_INTERVAL_MIN) and triggered by visitors (waitUntil),
// by staff ("run now"), or by an external cron hitting POST /api/ai-desk with CRON_SECRET.

import { ensureRmlnSchema } from "./db";
import { fetchAllFeeds, LiveNewsItem, decodeEntities } from "./feeds";
import { insertArticle } from "./articles";

export interface AiEnv {
  DB?: any;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  CRON_SECRET?: string;
  JWT_SECRET?: string;
  ADMIN_EMAILS?: string;
}

const DEFAULT_MODEL = "gemini-2.5-flash";
const RUN_INTERVAL_MIN = 10;
const MAX_PER_RUN = 2; // keeps each run well inside Cloudflare's time and sub-request limits
const MAX_ATTEMPTS = 3;
const MAX_AGE_HOURS = 36;
const AI_AUTHOR = "กองบรรณาธิการ RMLN";

// ---------------------------------------------------------------- settings

export async function getSetting(db: any, key: string, fallback: string): Promise<string> {
  const row = await db.prepare("SELECT value FROM rmln_settings WHERE key = ?").bind(key).first().catch(() => null);
  return row?.value ?? fallback;
}

export async function setSetting(db: any, key: string, value: string) {
  await db.prepare("INSERT OR REPLACE INTO rmln_settings (key, value) VALUES (?, ?)").bind(key, value).run();
}

export async function getAiConfig(env: AiEnv) {
  const db = env.DB;
  return {
    hasKey: !!env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL || DEFAULT_MODEL,
    enabled: (await getSetting(db, "ai_enabled", "true")) === "true",
    autoPublish: (await getSetting(db, "ai_auto_publish", "true")) === "true",
    lastRun: await getSetting(db, "ai_last_run", ""),
    lastResult: await getSetting(db, "ai_last_result", ""),
    intervalMin: RUN_INTERVAL_MIN,
  };
}

// ---------------------------------------------------------------- triggers

/** Called on visitor traffic: runs only if enabled, configured, and the interval has passed. */
export async function maybeRunAiDesk(env: AiEnv) {
  if (!env.DB || !env.GEMINI_API_KEY) return;
  await ensureRmlnSchema(env.DB);
  if ((await getSetting(env.DB, "ai_enabled", "true")) !== "true") return;
  // background work after a response only gets ~30s, so do one story per visitor-triggered run
  await runAiDesk(env, { force: false, maxStories: 1 });
}

export interface RunReport {
  ran: boolean;
  reason?: string;
  processed: { title: string; status: string; error?: string }[];
}

export async function runAiDesk(env: AiEnv, opts: { force: boolean; maxStories?: number }): Promise<RunReport> {
  const db = env.DB;
  if (!db) return { ran: false, reason: "no database", processed: [] };
  if (!env.GEMINI_API_KEY) return { ran: false, reason: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY", processed: [] };
  await ensureRmlnSchema(db);

  // Claim the run slot atomically so concurrent visitors don't start parallel runs
  const now = Date.now();
  const last = await getSetting(db, "ai_last_run", "");
  const lastMs = last ? Date.parse(last) : 0;
  if (!opts.force && now - lastMs < RUN_INTERVAL_MIN * 60_000) {
    return { ran: false, reason: "throttled", processed: [] };
  }
  const nowIso = new Date(now).toISOString();
  const claim = last
    ? await db.prepare("UPDATE rmln_settings SET value = ? WHERE key = 'ai_last_run' AND value = ?").bind(nowIso, last).run()
    : await db.prepare("INSERT OR IGNORE INTO rmln_settings (key, value) VALUES ('ai_last_run', ?)").bind(nowIso).run();
  if (!claim.meta?.changes) return { ran: false, reason: "another run in progress", processed: [] };

  const autoPublish = (await getSetting(db, "ai_auto_publish", "true")) === "true";
  const report: RunReport = { ran: true, processed: [] };

  try {
    const candidates = await pickCandidates(db, await fetchAllFeeds());
    for (const item of candidates.slice(0, opts.maxStories ?? MAX_PER_RUN)) {
      report.processed.push(await processStory(env, item, autoPublish));
    }
    if (candidates.length === 0) report.reason = "ไม่มีข่าวใหม่";
  } catch (err: any) {
    report.reason = err.message;
  }

  await setSetting(
    db,
    "ai_last_result",
    JSON.stringify({ at: nowIso, reason: report.reason || null, processed: report.processed })
  ).catch(() => {});
  return report;
}

async function pickCandidates(db: any, items: LiveNewsItem[]): Promise<LiveNewsItem[]> {
  const cutoff = Date.now() - MAX_AGE_HOURS * 3600_000;
  const out: LiveNewsItem[] = [];
  for (const item of items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))) {
    if (Date.parse(item.publishedAt) < cutoff) continue;
    const inNews = await db.prepare("SELECT 1 FROM rmln_news WHERE source_url = ?").bind(item.sourceUrl).first();
    if (inNews) continue;
    const job = await db
      .prepare("SELECT status, attempts, updated_at FROM rmln_ai_jobs WHERE source_url = ?")
      .bind(item.sourceUrl)
      .first();
    if (job) {
      if (["published", "draft", "skipped"].includes(job.status)) continue;
      if ((job.attempts || 0) >= MAX_ATTEMPTS) continue;
      // a 'processing' row younger than 15 minutes belongs to a run that is still going
      const updated = Date.parse(String(job.updated_at).replace(" ", "T") + "Z");
      if (job.status === "processing" && Date.now() - updated < 15 * 60_000) continue;
    }
    out.push(item);
  }
  return out;
}

// ---------------------------------------------------------------- one story

async function setJob(db: any, item: LiveNewsItem, status: string, extra: { newsId?: string; error?: string; bump?: boolean } = {}) {
  await db
    .prepare(
      `INSERT INTO rmln_ai_jobs (source_url, source_name, original_title, status, attempts, news_id, error, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(source_url) DO UPDATE SET status = excluded.status,
         attempts = rmln_ai_jobs.attempts + ?, news_id = COALESCE(excluded.news_id, rmln_ai_jobs.news_id),
         error = excluded.error, updated_at = CURRENT_TIMESTAMP`
    )
    .bind(item.sourceUrl, item.sourceName, item.titleOriginal, status, extra.bump ? 1 : 0, extra.newsId || null, extra.error || null, extra.bump ? 1 : 0)
    .run();
}

async function processStory(env: AiEnv, item: LiveNewsItem, autoPublish: boolean) {
  const db = env.DB;
  await setJob(db, item, "processing", { bump: true });
  try {
    const source = await fetchSourceArticle(item);
    if (source.text.length < 200) {
      await setJob(db, item, "skipped", { error: "ต้นฉบับมีเนื้อหาน้อยเกินไป (อาจเป็นคลิปวิดีโอ)" });
      return { title: item.titleOriginal, status: "skipped", error: "เนื้อหาต้นฉบับน้อยเกินไป" };
    }

    const draft = await writeArticle(env, item, source.text);
    if (!draft.publishable) {
      await setJob(db, item, "skipped", { error: draft.reason || "AI เห็นว่าไม่ควรนำมาเขียนเป็นข่าว" });
      return { title: item.titleOriginal, status: "skipped", error: draft.reason };
    }

    const check = await factCheck(env, source.text, draft);
    const passed = check.verdict === "pass" && check.problems.length === 0;
    const status: "published" | "draft" = passed && autoPublish ? "published" : "draft";

    const article = await insertArticle(db, {
      title: draft.title,
      excerpt: draft.excerpt,
      content: draft.content,
      category: draft.category,
      league: draft.league || item.league,
      imageUrl: source.image || item.imageUrl || null,
      author: AI_AUTHOR,
      sourceUrl: item.sourceUrl,
      sourceName: item.sourceName,
      originalTitle: item.titleOriginal,
      createdBy: "ai-desk",
      status,
      aiNotes: JSON.stringify({ model: env.GEMINI_MODEL || DEFAULT_MODEL, factCheck: check }),
    });

    await setJob(db, item, status, { newsId: article.id });
    return { title: draft.title, status };
  } catch (err: any) {
    const msg = String(err?.message || err).slice(0, 300);
    await setJob(db, item, "failed", { error: msg }).catch(() => {});
    return { title: item.titleOriginal, status: "failed", error: msg };
  }
}

// ---------------------------------------------------------------- source article

async function fetchSourceArticle(item: LiveNewsItem): Promise<{ text: string; image: string }> {
  let html = "";
  try {
    const res = await fetch(item.sourceUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RMLN-Football/1.0)", Accept: "text/html" },
      cf: { cacheTtl: 600, cacheEverything: true },
    } as RequestInit);
    if (res.ok) html = await res.text();
  } catch {
    // fall back to the RSS summary below
  }

  const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1] || "";

  // Article text = paragraphs inside <article> when present, otherwise all <p>
  const scope = html.match(/<article[\s\S]*?<\/article>/i)?.[0] || html;
  const paragraphs = Array.from(scope.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
    .map((m) => decodeEntities(m[1].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 40 && !/cookie|subscribe|sign up|newsletter|javascript|©/i.test(p));
  const unique = Array.from(new Set(paragraphs));

  const text = [`HEADLINE: ${item.titleOriginal}`, item.excerptOriginal && `SUMMARY: ${item.excerptOriginal}`, ...unique]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 14000);

  return { text: unique.length ? text : `${item.titleOriginal}\n\n${item.excerptOriginal}`, image: decodeEntities(ogImage) };
}

// ---------------------------------------------------------------- Gemini

async function gemini(env: AiEnv, system: string, user: string, schema: object): Promise<any> {
  const model = env.GEMINI_MODEL || DEFAULT_MODEL;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY as string },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${data?.error?.message || "request failed"}`);
  const cand = data?.candidates?.[0];
  if (!cand || cand.finishReason === "SAFETY") throw new Error("Gemini ไม่ส่งผลลัพธ์ (ถูกบล็อกหรือว่าง)");
  const text = (cand.content?.parts || []).map((p: any) => p.text || "").join("");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Gemini ตอบกลับไม่ใช่ JSON ที่ถูกต้อง");
  }
}

const WRITER_SYSTEM = `คุณคือนักข่าวฟุตบอลอาวุโสของสำนักข่าว RMLN (ร่ายมนต์ลูกหนัง) ประเทศไทย
หน้าที่: อ่านข่าวต้นฉบับภาษาอังกฤษ แล้วเขียนเป็น "ข่าวภาษาไทยชิ้นใหม่" ที่อ่านลื่นไหลแบบสำนักข่าวกีฬาไทย

กฎความถูกต้อง (สำคัญที่สุด):
- ใช้เฉพาะข้อเท็จจริงที่อยู่ในต้นฉบับเท่านั้น ห้ามเพิ่มสกอร์ วันที่ สถิติ ค่าตัว อาการบาดเจ็บ ชื่อคน หรือคำพูดที่ต้นฉบับไม่มี
- คำพูด (quote) แปลได้ แต่ต้องคงความหมายเดิมและระบุผู้พูดให้ถูกคน
- ถ้าต้นฉบับไม่ชัดเจน ให้เขียนแบบระมัดระวัง (เช่น "มีรายงานว่า") ห้ามเดา
- ถ้าต้นฉบับเป็นแค่คลิปไฮไลต์/วิดีโอ หรือมีเนื้อหาน้อยจนเขียนข่าวไม่ได้ ให้ตอบ publishable = false

กฎการเขียน:
- เรียบเรียงใหม่ทั้งหมด ไม่แปลทีละประโยค: พาดหัวกระชับดึงดูด, ย่อหน้าแรกสรุปใจความ, ตามด้วยรายละเอียด
- ใช้ชื่อสโมสรและนักเตะตามที่สื่อไทยนิยม เช่น Manchester United = แมนเชสเตอร์ ยูไนเต็ด, Arsenal = อาร์เซน่อล
- เนื้อหา 3-6 ย่อหน้า คั่นย่อหน้าด้วยบรรทัดว่าง ไม่ใช้ markdown ไม่ใส่หัวข้อย่อย
- ไม่ต้องใส่เครดิตแหล่งข่าวในเนื้อหา (ระบบใส่ให้เอง)`;

const WRITER_SCHEMA = {
  type: "OBJECT",
  properties: {
    publishable: { type: "BOOLEAN" },
    reason: { type: "STRING", description: "ถ้า publishable = false ให้บอกเหตุผลสั้นๆ" },
    title: { type: "STRING" },
    excerpt: { type: "STRING", description: "คำโปรย 1-2 ประโยค" },
    content: { type: "STRING" },
    category: { type: "STRING", enum: ["breaking", "transfer", "match_report", "analysis", "feature"] },
    league: {
      type: "STRING",
      enum: ["Premier League", "UEFA Champions League", "La Liga", "Serie A", "Bundesliga", "World Football", "Thai League & National Teams"],
    },
  },
  required: ["publishable", "title", "excerpt", "content", "category", "league"],
};

interface Draft {
  publishable: boolean;
  reason?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  league: string;
}

async function writeArticle(env: AiEnv, item: LiveNewsItem, sourceText: string): Promise<Draft> {
  const d = await gemini(env, WRITER_SYSTEM, `แหล่งข่าว: ${item.sourceName}\n\nต้นฉบับ:\n${sourceText}`, WRITER_SCHEMA);
  const draft: Draft = {
    publishable: !!d.publishable,
    reason: d.reason,
    title: String(d.title || "").trim().slice(0, 250),
    excerpt: String(d.excerpt || "").trim(),
    content: String(d.content || "").trim(),
    category: d.category,
    league: d.league,
  };
  if (draft.publishable && (!draft.title || draft.content.length < 150)) {
    return { ...draft, publishable: false, reason: "AI เขียนเนื้อหาออกมาสั้นหรือว่างเกินไป" };
  }
  return draft;
}

const CHECKER_SYSTEM = `คุณคือบรรณาธิการตรวจสอบข้อเท็จจริง (fact-checker)
เปรียบเทียบ "ข่าวภาษาไทย" กับ "ต้นฉบับภาษาอังกฤษ" แล้วระบุทุกจุดที่:
- ข่าวไทยมีข้อเท็จจริงที่ต้นฉบับไม่ได้กล่าวไว้ (ตัวเลข สกอร์ วันที่ ชื่อ คำพูด เหตุการณ์)
- ข่าวไทยขัดแย้งหรือบิดเบือนจากต้นฉบับ (เช่น ทีมชนะ/แพ้สลับกัน ผู้พูดผิดคน)
- ชื่อทีมหรือชื่อบุคคลผิด
การเรียบเรียงภาษา การสรุปความ หรือการใช้คำต่างกันที่ความหมายเท่าเดิม ไม่ถือเป็นปัญหา
ถ้าไม่พบปัญหาเลย verdict = "pass" และ problems เป็นรายการว่าง มิฉะนั้น verdict = "fail"`;

const CHECKER_SCHEMA = {
  type: "OBJECT",
  properties: {
    verdict: { type: "STRING", enum: ["pass", "fail"] },
    problems: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["verdict", "problems"],
};

async function factCheck(env: AiEnv, sourceText: string, draft: Draft): Promise<{ verdict: string; problems: string[] }> {
  const r = await gemini(
    env,
    CHECKER_SYSTEM,
    `ต้นฉบับภาษาอังกฤษ:\n${sourceText}\n\n---\n\nข่าวภาษาไทย:\nพาดหัว: ${draft.title}\nคำโปรย: ${draft.excerpt}\n\n${draft.content}`,
    CHECKER_SCHEMA
  );
  return {
    verdict: r.verdict === "pass" ? "pass" : "fail",
    problems: Array.isArray(r.problems) ? r.problems.map(String).filter(Boolean) : [],
  };
}
