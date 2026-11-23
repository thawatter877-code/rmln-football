// Live football news from Sky Sports & BBC Sport RSS, auto-translated to Thai (cached in D1).
// Also wakes the AI news desk in the background (see _lib/ai-desk.ts).
import { ensureRmlnSchema } from "../_lib/db";
import { translateGroupToThai } from "../_lib/translate";
import { fetchAllFeeds } from "../_lib/feeds";
import { maybeRunAiDesk, AiEnv } from "../_lib/ai-desk";

export const onRequestGet = async ({
  env,
  request,
  waitUntil,
}: {
  env: AiEnv;
  request: Request;
  waitUntil?: (p: Promise<unknown>) => void;
}) => {
  const translate = new URL(request.url).searchParams.get("translate") !== "0";
  try {
    if (env.DB) await ensureRmlnSchema(env.DB);

    const items = await fetchAllFeeds();

    // Translate title + summary per item (one request each, cached in D1), 4 at a time
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

    // Visitors keep the AI desk running even without an external scheduler (throttled inside)
    if (waitUntil && env.DB) waitUntil(maybeRunAiDesk(env).catch(() => {}));

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
