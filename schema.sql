-- Database schema for RMLN (ร่ายมนต์ลูกหนัง) - The 90-Minute Football Magic
-- Must stay in sync with functions/_lib/db.ts (which also creates/migrates these tables automatically).

CREATE TABLE IF NOT EXISTS rmln_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,          -- pbkdf2$<iterations>$<salt>$<hash>
  display_name TEXT,
  favorite_club TEXT DEFAULT 'Arsenal',
  coins INTEGER DEFAULT 100000,
  gems INTEGER DEFAULT 200,
  academy_level TEXT DEFAULT 'D4',
  squad_count INTEGER DEFAULT 0,
  max_squad INTEGER DEFAULT 50,
  role TEXT DEFAULT 'member',           -- 'member' | 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rmln_news (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,               -- 'breaking' | 'transfer' | 'match_report' | 'analysis' | 'feature'
  category_label TEXT,
  league TEXT,
  club TEXT,
  image_url TEXT,
  views INTEGER DEFAULT 0,
  author TEXT DEFAULT 'กองบรรณาธิการ RMLN',
  is_breaking INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  published_at TEXT,                    -- ISO 8601
  read_time TEXT DEFAULT '3 นาที',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rmln_comments (
  id TEXT PRIMARY KEY,
  news_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_club TEXT,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_rmln_comments_news ON rmln_comments(news_id);

CREATE TABLE IF NOT EXISTS rmln_reactions (
  id TEXT PRIMARY KEY,
  news_id TEXT NOT NULL,
  user_id TEXT,
  reaction_type TEXT NOT NULL,          -- 'fire' | 'magic' | 'clap'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rmln_reactions_user ON rmln_reactions(news_id, user_id);

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
);
