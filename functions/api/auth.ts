import { ensureRmlnSchema } from "../_lib/db";

interface Env {
  DB?: any;
}

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(password + "rmln_magic_salt"));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  try {
    const body: any = await request.json();
    const { action, username, email, password, favoriteClub } = body;

    if (env.DB) {
      await ensureRmlnSchema(env.DB);

      if (action === "register") {
        if (!username || !email || !password) {
          return new Response(JSON.stringify({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }), { status: 400 });
        }

        const existing = await env.DB.prepare(
          "SELECT id FROM rmln_users WHERE username = ? OR email = ?"
        ).bind(username, email).first();

        if (existing) {
          return new Response(JSON.stringify({ error: "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว" }), { status: 400 });
        }

        const userId = `u-${Date.now()}`;
        const pwdHash = await hashPassword(password);

        await env.DB.prepare(`
          INSERT INTO rmln_users (id, username, email, password_hash, display_name, favorite_club, coins, gems, academy_level, squad_count, max_squad)
          VALUES (?, ?, ?, ?, ?, ?, 198000, 282, 'D4', 23, 50)
        `).bind(
          userId,
          username.trim(),
          email.trim().toLowerCase(),
          pwdHash,
          username.trim(),
          favoriteClub || "Arsenal"
        ).run();

        const user = await env.DB.prepare(
          "SELECT id, username, email, display_name, favorite_club, coins, gems, academy_level, squad_count, max_squad FROM rmln_users WHERE id = ?"
        ).bind(userId).first();

        return new Response(JSON.stringify({ success: true, user }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (action === "login") {
        if (!username || !password) {
          return new Response(JSON.stringify({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }), { status: 400 });
        }

        const user = await env.DB.prepare(
          "SELECT * FROM rmln_users WHERE username = ? OR email = ?"
        ).bind(username, username.toLowerCase()).first();

        if (!user) {
          return new Response(JSON.stringify({ error: "ไม่พบบัญชีผู้ใช้นี้" }), { status: 401 });
        }

        const pwdHash = await hashPassword(password);
        if (user.password_hash !== pwdHash) {
          return new Response(JSON.stringify({ error: "รหัสผ่านไม่ถูกต้อง" }), { status: 401 });
        }

        const { password_hash, ...safeUser } = user;
        return new Response(JSON.stringify({ success: true, user: safeUser }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: true, user: body }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
