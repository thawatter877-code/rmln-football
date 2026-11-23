import { ensureRmlnSchema, requireDb } from "../_lib/db";
import { Env, json, getSessionUser, PUBLIC_USER_COLUMNS } from "../_lib/auth";

// Prices and player stats are decided here on the server — the client only chooses the mode.
const MODES = {
  scout_coins: { coins: 20000, gems: 20 },
  scout_gems: { coins: 0, gems: 40 },
  named: { coins: 0, gems: 80 },
} as const;
type Mode = keyof typeof MODES;

const COUNTRIES = ["อังกฤษ", "บราซิล", "สเปน", "ฝรั่งเศส", "อาร์เจนตินา", "เยอรมนี", "ไทย", "ญี่ปุ่น", "เนเธอร์แลนด์", "โปรตุเกส"];
const POSITIONS: Record<string, string> = { GK: "ผู้รักษาประตู", DEF: "ตัวรับ", MID: "ตัวกลาง", FWD: "ตัวรุก" };
const FIRST = ["Leo", "Kai", "Arthur", "Danilo", "Kenji", "Tawan", "Alex", "Bruno"];
const LAST = ["Silva", "Santos", "Sterling", "Kaiser", "Moreno", "Tanaka", "Weber", "Costa"];
const SKILLS = [
  "การจ่ายบอลทะลุช่อง (Precision Passing)",
  "ความแม่นยำในจังหวะสุดท้าย (Clinical Finishing)",
  "การเลี้ยงบอลในพื้นที่แคบ (Close Control)",
  "การอ่านเกมรับ (Defensive Awareness)",
  "การออกบอลจากแนวหลัง (Ball Playing)",
];

function rand(min: number, max: number): number {
  const buf = crypto.getRandomValues(new Uint32Array(1));
  return min + (buf[0] % (max - min + 1));
}
const pick = <T,>(arr: readonly T[]): T => arr[rand(0, arr.length - 1)];

// GET /api/scout -> the logged-in user's roster
export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;
  try {
    await ensureRmlnSchema(env.DB);
    const session = await getSessionUser(request, env);
    if (!session) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);

    const { results } = await env.DB.prepare(
      "SELECT * FROM rmln_scouted_players WHERE user_id = ? ORDER BY created_at DESC"
    )
      .bind(session.id)
      .all();
    return json({ players: results || [] });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

// POST /api/scout { mode, nationality?, position, firstName?, lastName? }
export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  const missing = requireDb(env);
  if (missing) return missing;

  try {
    await ensureRmlnSchema(env.DB);
    const session = await getSessionUser(request, env);
    if (!session) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);

    const body: any = await request.json().catch(() => ({}));
    const mode = body.mode as Mode;
    if (!(mode in MODES)) return json({ error: "Invalid mode" }, 400);
    const cost = MODES[mode];

    const nationality = COUNTRIES.includes(body.nationality) ? body.nationality : pick(COUNTRIES);
    const position = POSITIONS[body.position] || POSITIONS.MID;

    let name: string;
    let age: number, overall: number, potential: number, skill: string;
    if (mode === "named") {
      const first = String(body.firstName || "").trim().slice(0, 30);
      const last = String(body.lastName || "").trim().slice(0, 30);
      if (!first || !last) return json({ error: "กรุณากรอกชื่อและนามสกุล" }, 400);
      name = `${first} ${last}`;
      age = 16;
      overall = rand(76, 84);
      potential = rand(90, 96);
      skill = pick(SKILLS);
    } else {
      name = `${pick(FIRST)} ${pick(LAST)}`;
      age = rand(16, 18);
      overall = rand(65, 82);
      potential = rand(Math.max(overall + 5, 80), 95);
      skill = pick(SKILLS);
    }

    // Atomic deduction: only succeeds when the balance and squad space are sufficient
    const deduct = await env.DB.prepare(
      `UPDATE rmln_users
       SET coins = coins - ?, gems = gems - ?, squad_count = COALESCE(squad_count, 0) + 1
       WHERE id = ? AND coins >= ? AND gems >= ? AND COALESCE(squad_count, 0) < COALESCE(max_squad, 50)`
    )
      .bind(cost.coins, cost.gems, session.id, cost.coins, cost.gems)
      .run();

    if (!deduct.meta?.changes) {
      return json({ error: "เหรียญ/เพชรไม่เพียงพอ หรืออคาเดมี่เต็มแล้ว" }, 400);
    }

    const playerId = `pl-${crypto.randomUUID()}`;
    const values = [playerId, session.id, name, nationality, position, age, overall, potential, skill];
    try {
      await env.DB.prepare(
        `INSERT INTO rmln_scouted_players (id, user_id, name, nationality, position, age, overall, potential, special_skill)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(...values)
        .run();
    } catch (err: any) {
      // Tables created from the old schema.sql have a NOT NULL "rating" column
      if (!String(err.message).includes("rating")) throw err;
      await env.DB.prepare(
        `INSERT INTO rmln_scouted_players (id, user_id, name, nationality, position, age, overall, potential, special_skill, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(...values, overall)
        .run();
    }

    const player = await env.DB.prepare("SELECT * FROM rmln_scouted_players WHERE id = ?").bind(playerId).first();
    const user = await env.DB.prepare(`SELECT ${PUBLIC_USER_COLUMNS} FROM rmln_users WHERE id = ?`).bind(session.id).first();
    return json({ success: true, player, user }, 201);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};
