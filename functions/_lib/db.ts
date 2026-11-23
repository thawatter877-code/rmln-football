// Database and auto-healing schema for RMLN Football Platform (Cloudflare D1)

let schemaInitialized = false;

/** Lowest-level guard: every API needs a D1 binding named DB. */
export function requireDb(env: { DB?: any }): Response | null {
  if (env.DB) return null;
  return new Response(
    JSON.stringify({ error: "ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ (D1 binding 'DB' missing)" }),
    { status: 503, headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}

export async function ensureRmlnSchema(db: any) {
  if (schemaInitialized || !db) return;

  try {
    // 1. Users Table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        favorite_club TEXT DEFAULT 'Arsenal',
        coins INTEGER DEFAULT 100000,
        gems INTEGER DEFAULT 200,
        academy_level TEXT DEFAULT 'D4',
        squad_count INTEGER DEFAULT 0,
        max_squad INTEGER DEFAULT 50,
        role TEXT DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // 2. News Table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_news (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        category_label TEXT,
        league TEXT,
        club TEXT,
        image_url TEXT,
        views INTEGER DEFAULT 0,
        author TEXT DEFAULT 'กองบรรณาธิการ RMLN',
        is_breaking INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        published_at TEXT,
        read_time TEXT DEFAULT '3 นาที',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // 3. Comments Table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_comments (
        id TEXT PRIMARY KEY,
        news_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_club TEXT,
        content TEXT NOT NULL,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // 4. Reactions Table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_reactions (
        id TEXT PRIMARY KEY,
        news_id TEXT NOT NULL,
        user_id TEXT,
        reaction_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // 5. Scouted Players Table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_scouted_players (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        nationality TEXT NOT NULL,
        position TEXT NOT NULL,
        age INTEGER NOT NULL,
        overall INTEGER NOT NULL,
        potential INTEGER NOT NULL,
        special_skill TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // 6. Migrations for databases created from older schema.sql versions
    const migrations = [
      "ALTER TABLE rmln_users ADD COLUMN academy_level TEXT DEFAULT 'D4'",
      "ALTER TABLE rmln_users ADD COLUMN squad_count INTEGER DEFAULT 0",
      "ALTER TABLE rmln_users ADD COLUMN max_squad INTEGER DEFAULT 50",
      "ALTER TABLE rmln_news ADD COLUMN category_label TEXT",
      "ALTER TABLE rmln_news ADD COLUMN read_time TEXT DEFAULT '3 นาที'",
      "ALTER TABLE rmln_scouted_players ADD COLUMN overall INTEGER DEFAULT 70",
      "ALTER TABLE rmln_scouted_players ADD COLUMN special_skill TEXT",
      "ALTER TABLE rmln_news ADD COLUMN source_url TEXT",
      "ALTER TABLE rmln_news ADD COLUMN source_name TEXT",
      "ALTER TABLE rmln_news ADD COLUMN original_title TEXT",
      "ALTER TABLE rmln_news ADD COLUMN created_by TEXT",
      "ALTER TABLE rmln_news ADD COLUMN status TEXT DEFAULT 'published'",
      "ALTER TABLE rmln_news ADD COLUMN ai_notes TEXT",
    ];
    for (const sql of migrations) {
      // Fails harmlessly with "duplicate column" when the column already exists
      await db.prepare(sql).run().catch(() => {});
    }
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_translations (
        hash TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        th TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_ai_jobs (
        source_url TEXT PRIMARY KEY,
        source_name TEXT,
        original_title TEXT,
        status TEXT NOT NULL,            -- 'processing' | 'published' | 'draft' | 'skipped' | 'failed'
        attempts INTEGER DEFAULT 0,
        news_id TEXT,
        error TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `).run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_rmln_news_source ON rmln_news(source_url)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_rmln_comments_news ON rmln_comments(news_id)").run().catch(() => {});
    await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_rmln_reactions_user ON rmln_reactions(news_id, user_id)").run().catch(() => {});

    schemaInitialized = true;
  } catch (err: any) {
    console.error("Schema error:", err.message);
  }
}
