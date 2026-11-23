"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Flame, 
  Sparkles, 
  Clock, 
  Eye, 
  MessageSquare, 
  ArrowRight, 
  Share2, 
  Trophy, 
  TrendingUp,
  Dices,
  ChevronRight
} from "lucide-react";
import { MOCK_NEWS, MOCK_FIXTURES, NewsArticle } from "@/data/mockNews";

export default function HomePage() {
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const featuredNews = MOCK_NEWS[0];
  const secondaryNews = MOCK_NEWS.slice(1, 4);

  const filteredNews = selectedLeague === "all" 
    ? MOCK_NEWS 
    : MOCK_NEWS.filter(n => n.league.toLowerCase().includes(selectedLeague.toLowerCase()) || n.category === selectedLeague);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100">
      
      {/* 1. HERO FEATURED STORY (90-Minute Magic Headline) */}
      <section className="relative w-full border-b border-slate-800/80 bg-gradient-to-b from-[#0b1220] to-[#070b12]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Big Headline & Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-red-600/30">
                  <Flame className="w-3.5 h-3.5" />
                  90' BREAKING STORY
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono">
                  {featuredNews.league}
                </span>
              </div>

              <Link href={`/news/${featuredNews.slug}`} className="group block">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white group-hover:text-amber-400 transition-colors leading-[1.25] tracking-tight">
                  {featuredNews.title}
                </h1>
              </Link>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {featuredNews.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="text-amber-400 font-bold">{featuredNews.author}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredNews.publishedAt}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {featuredNews.views.toLocaleString()} อ่าน</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {featuredNews.comments.length} คอมเมนต์</span>
              </div>

              <div className="pt-2">
                <Link
                  href={`/news/${featuredNews.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg btn-gold text-xs font-bold shadow-lg"
                >
                  <span>อ่านข่าวฉบับเต็ม</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Big Image Showcase with Gold Frame Glow */}
            <div className="lg:col-span-5">
              <Link href={`/news/${featuredNews.slug}`} className="group block relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl shadow-amber-500/10">
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src={featuredNews.imageUrl}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span>⚽ ค่ำคืนแห่งมนต์สะกด</span>
                  <span className="px-2 py-0.5 rounded bg-black/60 border border-amber-500/40">
                    อ่าน {featuredNews.readTime}
                  </span>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT + SIDEBAR LAYOUT */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 8 COLS: NEWS FEED & TABS */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Category Tabs */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                {[
                  { id: "all", label: "ทั้งหมด" },
                  { id: "premier league", label: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 พรีเมียร์ลีก" },
                  { id: "ucl", label: "🏆 แชมเปียนส์ลีก" },
                  { id: "transfer", label: "🔄 ตลาดนักเตะ" },
                  { id: "analysis", label: "🔮 ผ่าแท็กติก" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedLeague(tab.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedLeague === tab.id
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                {filteredNews.length} รายงานข่าว
              </span>
            </div>

            {/* News List */}
            <div className="space-y-4">
              {filteredNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/news/${news.slug}`}
                  className="group block p-4 rounded-xl bg-[#0c1220] border border-slate-800/80 hover:border-amber-500/40 transition-all hover:-translate-y-0.5 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    <div className="sm:w-48 aspect-video sm:aspect-[4/3] rounded-lg overflow-hidden shrink-0 bg-slate-800 relative">
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                        {news.categoryLabel}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="text-amber-400 font-bold">{news.league}</span>
                          <span>•</span>
                          <span>{news.publishedAt}</span>
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                          {news.title}
                        </h2>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {news.excerpt}
                        </p>
                      </div>

                      {/* Footer Info & Reactions */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                        <span className="font-medium text-slate-400">{news.author}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Eye className="w-3 h-3" /> {news.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <MessageSquare className="w-3 h-3" /> {news.comments.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* CALL TO ACTION BANNER: YOUTH ACADEMY (From Screenshot!) */}
            <div className="magic-frame p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-amber-500/40">
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 text-xs font-bold">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>มินิเกมแฟนบอล: อคาเดมี่เยาวชน</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  สวมบทกุนซือ! สุ่มสัญชาติ ปั้นดาวรุ่งสู่วงการลูกหนัง
                </h3>
                <p className="text-xs text-slate-400 max-w-md">
                  สะสมเหรียญและเพชรจากการอ่านข่าวและคอมเมนต์เพื่อนำมาปั้นนักเตะเยาวชนในสังกัดของคุณ
                </p>
              </div>

              <Link
                href="/academy"
                className="shrink-0 px-6 py-3 rounded-xl btn-gold text-xs font-bold shadow-lg flex items-center gap-2"
              >
                <span>เข้าสู่อคาเดมี่</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

          {/* RIGHT 4 COLS: MATCH CENTER & SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. MATCH CENTER WIDGET */}
            <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800/90 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">ผลบอล & โปรแกรมถ่ายทอด</h3>
                </div>
                <span className="text-[10px] text-amber-400 font-mono font-bold">LIVE SCORE</span>
              </div>

              <div className="space-y-2.5">
                {MOCK_FIXTURES.map((fix) => (
                  <div key={fix.id} className="p-3 rounded-lg bg-[#070b13] border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-amber-400">{fix.league}</span>
                      <span className={`px-1.5 py-0.2 rounded font-mono font-bold ${
                        fix.status === "LIVE" ? "bg-red-600/20 text-red-400 border border-red-500/40 animate-pulse" : "bg-slate-800 text-slate-300"
                      }`}>
                        {fix.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-white pt-1">
                      <span className="truncate max-w-[100px]">{fix.homeTeam}</span>
                      <div className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-xs">
                        {fix.homeScore !== null ? `${fix.homeScore} - ${fix.awayScore}` : fix.date}
                      </div>
                      <span className="truncate max-w-[100px] text-right">{fix.awayTeam}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. LEAGUE STANDINGS PREVIEW (Premier League) */}
            <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800/90 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">ตารางคะแนนพรีเมียร์ลีก</h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">2026/27</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="grid grid-cols-12 text-[10px] text-slate-500 px-2 py-1 font-sans">
                  <span className="col-span-1">#</span>
                  <span className="col-span-7">สโมสร</span>
                  <span className="col-span-2 text-center">แข่ง</span>
                  <span className="col-span-2 text-right">แต้ม</span>
                </div>
                {[
                  { pos: 1, club: "Arsenal", p: 12, pts: 28, form: "W W D W W" },
                  { pos: 2, club: "Man City", p: 12, pts: 26, form: "W W W L W" },
                  { pos: 3, club: "Liverpool", p: 12, pts: 25, form: "W D W W L" },
                  { pos: 4, club: "Chelsea", p: 12, pts: 22, form: "D W W D W" },
                  { pos: 5, club: "Tottenham", p: 12, pts: 20, form: "L W D W L" },
                ].map((row) => (
                  <div
                    key={row.pos}
                    className={`grid grid-cols-12 px-2.5 py-1.5 rounded-lg items-center ${
                      row.pos <= 4 ? "bg-[#070b13] border-l-2 border-emerald-500" : "bg-transparent"
                    }`}
                  >
                    <span className="col-span-1 text-slate-400 font-bold">{row.pos}</span>
                    <span className="col-span-7 font-sans font-bold text-white truncate">{row.club}</span>
                    <span className="col-span-2 text-center text-slate-400">{row.p}</span>
                    <span className="col-span-2 text-right text-amber-400 font-bold">{row.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. SIGN UP FAN COMMUNITY BOX */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#0c1220] to-[#070b12] border border-amber-500/30 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-lg">
                ⚽
              </div>
              <h4 className="text-sm font-bold text-white">
                ร่วมเป็นส่วนหนึ่งของร่ายมนต์ลูกหนัง
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                สมัครสมาชิกเพื่อร่วมคอมเมนต์ วิเคราะห์เกม และรับสิทธิ์สะสมเหรียญปั้นนักเตะ
              </p>
              <Link
                href="/auth/register"
                className="block w-full py-2 rounded-lg btn-gold text-xs font-bold"
              >
                สมัครสมาชิกแฟนบอลฟรี
              </Link>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
