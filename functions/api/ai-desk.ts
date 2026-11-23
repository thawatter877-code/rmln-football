// AI desk control
// GET  /api/ai-desk                         (staff) -> config + recent jobs
// POST /api/ai-desk { action: "run" }       (staff, or external cron with header "x-cron-secret: <CRON_SECRET>")
// POST /api/ai-desk { action: "settings", enabled?, autoPublish? }   (admin)
import { ensureRmlnSchema, requireDb } from "../_lib/db";
import { json, requireRole, STAFF_ROLES } from "../_lib/auth";
import { AiEnv, getAiConfig, runAiDesk, setSetting } from "../_lib/ai-desk";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export const onRequestGet = async ({ env, request }: { env: AiEnv; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;
  try {
    await ensureRmlnSchema(env.DB);
    const session = await requireRole(request, env, STAFF_ROLES);
    if (session instanceof Response) return session;

    const { results } = await env.DB.prepare(
      "SELECT source_url, source_name, original_title, status, attempts, news_id, error, updated_at FROM rmln_ai_jobs ORDER BY updated_at DESC LIMIT 40"
    ).all();
    return json({ config: await getAiConfig(env), jobs: results || [] }, 200, { "Cache-Control": "no-store" });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

export const onRequestPost = async ({ env, request }: { env: AiEnv; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;
  try {
    await ensureRmlnSchema(env.DB);
    const body: any = await request.json().catch(() => ({}));

    // External scheduler (GitHub Actions / Cloudflare cron worker) authenticates with CRON_SECRET
    const cronHeader = request.headers.get("x-cron-secret") || "";
    const isCron = !!env.CRON_SECRET && env.CRON_SECRET.length >= 16 && safeEqual(cronHeader, env.CRON_SECRET);

    if (body.action === "run") {
      if (!isCron) {
        const session = await requireRole(request, env, STAFF_ROLES);
        if (session instanceof Response) return session;
      }
      // Cron respects the throttle; a staff click forces a run
      const report = await runAiDesk(env, { force: !isCron });
      return json({ success: true, report });
    }

    if (body.action === "settings") {
      const session = await requireRole(request, env, ["admin"]);
      if (session instanceof Response) return session;
      if (typeof body.enabled === "boolean") await setSetting(env.DB, "ai_enabled", String(body.enabled));
      if (typeof body.autoPublish === "boolean") await setSetting(env.DB, "ai_auto_publish", String(body.autoPublish));
      return json({ success: true, config: await getAiConfig(env) });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};
