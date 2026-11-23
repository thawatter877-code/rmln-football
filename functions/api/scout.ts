import { ensureRmlnSchema } from "../_lib/db";

interface Env {
  DB?: any;
}

export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  try {
    if (env.DB && userId) {
      await ensureRmlnSchema(env.DB);
      const { results } = await env.DB.prepare(
        "SELECT * FROM rmln_scouted_players WHERE user_id = ? ORDER BY created_at DESC"
      ).bind(userId).all();

      return new Response(JSON.stringify({ players: results || [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ players: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  try {
    const body: any = await request.json();
    const { userId, name, nationality, position, age, overall, potential, specialSkill, costCoins, costGems } = body;

    if (env.DB && userId) {
      await ensureRmlnSchema(env.DB);

      // Check user balance
      const user = await env.DB.prepare("SELECT coins, gems, squad_count, max_squad FROM rmln_users WHERE id = ?").bind(userId).first();
      if (user) {
        if (user.coins < (costCoins || 0) || user.gems < (costGems || 0)) {
          return new Response(JSON.stringify({ error: "เหรียญหรือเพชรไม่เพียงพอ" }), { status: 400 });
        }

        // Deduct
        await env.DB.prepare(
          "UPDATE rmln_users SET coins = coins - ?, gems = gems - ?, squad_count = squad_count + 1 WHERE id = ?"
        ).bind(costCoins || 0, costGems || 0, userId).run();
      }

      const playerId = `pl-${Date.now()}`;
      await env.DB.prepare(`
        INSERT INTO rmln_scouted_players (id, user_id, name, nationality, position, age, overall, potential, special_skill)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        playerId,
        userId,
        name,
        nationality,
        position,
        age,
        overall,
        potential,
        specialSkill || "ทักษะมาตรฐาน"
      ).run();

      const created = await env.DB.prepare("SELECT * FROM rmln_scouted_players WHERE id = ?").bind(playerId).first();

      return new Response(JSON.stringify({ success: true, player: created }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, player: body }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
