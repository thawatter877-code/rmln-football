-- Database schema for RMLN (ร่ายมนต์ลูกหนัง) - The 90-Minute Football Magic

CREATE TABLE IF NOT EXISTS rmln_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  favorite_club TEXT DEFAULT 'Arsenal',
  coins INTEGER DEFAULT 20000,
  gems INTEGER DEFAULT 280,
  avatar_url TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rmln_news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'transfer', 'match_report', 'analysis', 'breaking', 'feature'
  league TEXT, -- 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League', 'Thai League'
  club TEXT,
  image_url TEXT,
  views INTEGER DEFAULT 0,
  author TEXT DEFAULT 'กองบรรณาธิการ RMLN',
  is_breaking INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

CREATE TABLE IF NOT EXISTS rmln_reactions (
  id TEXT PRIMARY KEY,
  news_id TEXT NOT NULL,
  user_id TEXT,
  reaction_type TEXT NOT NULL, -- 'fire', 'magic', 'clap', 'shock'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rmln_scouted_players (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  position TEXT NOT NULL, -- 'GK', 'DEF', 'MID', 'FWD'
  age INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  potential INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
