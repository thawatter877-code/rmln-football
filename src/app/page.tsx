"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Flame, 
  Sparkles, 
  Clock, 
  Eye, 
  MessageSquare, 
  ArrowRight, 
  Trophy, 
  TrendingUp, 
  Compass, 
  ArrowLeftRight, 
  BookOpen, 
  ChevronRight, 
  Activity,
  Radio,
  ExternalLink
} from "lucide-react";
import {
  loadNewsFeed,
  articleHref,
  timeAgo,
  matchesFilter,
  NewsArticle,
  handleImgError,
  loadFootball,
  pickMatches,
  matchCenterText,
  matchStatusLabel,
  FootballData,
} from "@/lib/news";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [football, setFootball] = useState<FootballData | null>(null);

  useEffect(() => {
    loadNewsFeed()
      .then((feed) => {
        setNewsList(feed.articles);
        setLiveCount(feed.liveCount);
        setErrors(feed.errors);
      })
      .finally(() => setLoading(false));
    loadFootball().then(setFootball);
  }, []);

  // Prefer an editor-marked featured story, otherwise the newest article
  const featuredNews = newsList.find((n) => n.isFeatured) || newsList[0];

  const filteredNews = newsList.filter((n) => n !== featuredNews && matchesFilter(n, selectedCategory));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#9b9a97]">กำลังโหลดข่าว...</div>
    );
  }

  if (!featuredNews) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-center px-4">
        <p className="text-sm font-semibold text-[#2f3437]">ยังไม่มีข่าวให้แสดง</p>
        {errors.map((e) => (
          <p key={e} className="text-xs text-red-600">{e}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#2f3437]">
      
      {/* 1. HERO FEATURED STORY (Notion Editorial Style) */}
      <section className="w-full border-b border-[#e9e9e7] bg-[#fbfbfa]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Headline and Details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="notion-tag text-[#2f3437] font-semibold bg-[#f1f1ef]">
                  <Activity className="w-3 h-3 text-[#2f3437]" />
                  {featuredNews.isLive ? "LIVE FEED ข่าวสดเรียลไทม์" : "รายงานพิเศษ RMLN"}
                </span>
                <span className="notion-tag font-mono text-[#787774]">
                  {featuredNews.league}
                </span>
                {featuredNews.isLive && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    อัปเดตสด 24 ชม.
                  </span>
                )}
              </div>

              <Link href={articleHref(featuredNews)} className="group block">
                <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-bold text-[#2f3437] group-hover:text-black transition-colors leading-[1.25] tracking-tight">
                  {featuredNews.title}
                </h1>
              </Link>

              <p className="text-sm sm:text-base text-[#787774] leading-relaxed max-w-2xl font-normal">
                {featuredNews.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#9b9a97] pt-2 border-t border-[#e9e9e7]">
                <span className="text-[#37352f] font-medium">{featuredNews.author}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(featuredNews.publishedAt)}</span>
                {featuredNews.autoTranslated && (
                  <>
                    <span>•</span>
                    <span title={featuredNews.originalTitle}>แปลอัตโนมัติจาก {featuredNews.sourceName}</span>
                  </>
                )}
                {!featuredNews.isLive && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {featuredNews.views.toLocaleString()} ครั้ง</span>
                  </>
                )}
              </div>

              <div className="pt-2">
                <Link
                  href={articleHref(featuredNews)}
                  className="notion-btn-primary px-4 py-2"
                >
                  <span>อ่านรายงานฉบับเต็ม</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Clean Image Container */}
            <div className="lg:col-span-5">
              <Link href={articleHref(featuredNews)} className="group block relative rounded-lg overflow-hidden border border-[#e9e9e7] shadow-xs">
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#f1f1ef]">
                  <img
                    src={featuredNews.imageUrl}
                    onError={handleImgError}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 bg-white border-t border-[#e9e9e7] flex items-center justify-between text-xs text-[#787774]">
                  <span>{featuredNews.isLive ? `ภาพ: ${featuredNews.sourceName}` : "ภาพประกอบ"}</span>
                  <span className="font-mono">เวลาอ่าน {featuredNews.readTime}</span>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 2. MAIN FEED AND SIDEBAR */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 8 COLS: NEWS FEED */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Category Filter Pills */}
            <div className="flex items-center justify-between gap-2 border-b border-[#e9e9e7] pb-3 overflow-x-auto">
              <div className="flex items-center gap-1 shrink-0">
                {[
                  { id: "all", label: "ทั้งหมด" },
                  { id: "breaking", label: "ข่าวด่วน", icon: Flame },
                  { id: "Premier League", label: "พรีเมียร์ลีก" },
                  { id: "UEFA Champions League", label: "แชมเปียนส์ลีก" },
                  { id: "transfer", label: "ตลาดซื้อขาย", icon: ArrowLeftRight },
                  { id: "analysis", label: "บทวิเคราะห์", icon: BookOpen },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = selectedCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? "bg-[#2f3437] text-white"
                          : "text-[#787774] hover:text-[#2f3437] hover:bg-[#f7f6f3]"
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] text-[#9b9a97] font-mono hidden sm:inline">
                {filteredNews.length} รายการ
              </span>
            </div>

            {/* News List */}
            <div className="space-y-3">
              {filteredNews.map((news) => (
                <Link
                  key={news.id}
                  href={articleHref(news)}
                  className="notion-card block p-4 group"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    <div className="sm:w-44 aspect-[16/10] rounded-md overflow-hidden shrink-0 bg-[#f1f1ef] border border-[#e9e9e7]">
                      <img
                        src={news.imageUrl}
                        loading="lazy"
                        onError={handleImgError}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-[#9b9a97]">
                          <span className="font-medium text-[#787774]">{news.league}</span>
                          <span>•</span>
                          <span>{news.categoryLabel}</span>
                          <span>•</span>
                          <span>{timeAgo(news.publishedAt)}</span>
                          {news.autoTranslated && (
                            <>
                              <span>•</span>
                              <span title={news.originalTitle}>แปลอัตโนมัติ</span>
                            </>
                          )}
                        </div>
                        <h2 className="text-base font-semibold text-[#2f3437] group-hover:text-black transition-colors line-clamp-2 leading-snug">
                          {news.title}
                        </h2>
                        <p className="text-xs text-[#787774] line-clamp-2 leading-relaxed font-normal">
                          {news.excerpt}
                        </p>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-[11px] text-[#9b9a97] pt-2 border-t border-[#f1f1ef]">
                        <span className="font-medium text-[#787774]">{news.author}</span>
                        <div className="flex items-center gap-3">
                          {news.isLive ? (
                            <span className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> {news.sourceName}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {news.views.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Top 100 young players callout */}
            <div className="notion-callout p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-[#2f3437]">
                  <Compass className="w-4 h-4 text-[#787774]" />
                  <span>ดาวรุ่ง TOP 100</span>
                </div>
                <h3 className="text-base font-bold text-[#2f3437]">
                  100 นักเตะดาวรุ่งที่น่าจับตามองที่สุดในโลก
                </h3>
                <p className="text-xs text-[#787774]">
                  นักเตะอายุไม่เกิน 21 ปี พร้อมสโมสรปัจจุบันและจุดเด่น อัปเดตและตรวจสอบโดยกองบรรณาธิการ
                </p>
              </div>

              <Link
                href="/academy"
                className="notion-btn-primary px-4 py-2 shrink-0"
              >
                <span>ดูรายชื่อ TOP 100</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* RIGHT 4 COLS: SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. MATCH CENTER (real data from ESPN) */}
            {football && football.matches.length > 0 && (
              <div className="notion-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#e9e9e7] pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[#787774]" />
                    <h3 className="text-xs font-semibold text-[#2f3437]">ผลและโปรแกรมการแข่งขัน</h3>
                  </div>
                  <span className="text-[10px] text-[#9b9a97] font-mono">MATCH CENTER</span>
                </div>

                <div className="space-y-2">
                  {pickMatches(football.matches, 6).map((fix) => (
                    <div key={fix.id} className="p-2.5 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#9b9a97]">
                        <span className="font-medium text-[#787774]">{fix.league}</span>
                        <span className={`font-mono font-medium ${fix.state === "in" ? "text-red-600" : "text-[#2f3437]"}`}>
                          {matchStatusLabel(fix)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#2f3437] pt-0.5">
                        <span className="flex items-center gap-1.5 min-w-0 flex-1">
                          {fix.homeLogo && <img src={fix.homeLogo} alt="" className="w-4 h-4 object-contain" loading="lazy" />}
                          <span className="truncate">{fix.homeTeam}</span>
                        </span>
                        <span className="px-2 bg-white border border-[#e9e9e7] rounded text-[11px] font-mono font-semibold whitespace-nowrap">
                          {matchCenterText(fix)}
                        </span>
                        <span className="flex items-center justify-end gap-1.5 min-w-0 flex-1">
                          <span className="truncate text-right">{fix.awayTeam}</span>
                          {fix.awayLogo && <img src={fix.awayLogo} alt="" className="w-4 h-4 object-contain" loading="lazy" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#9b9a97] text-right">ข้อมูล: ESPN</p>
              </div>
            )}

            {/* 2. LEAGUE STANDINGS (real data from ESPN) */}
            {football && football.standings.length > 0 && (
              <div className="notion-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#e9e9e7] pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#787774]" />
                    <h3 className="text-xs font-semibold text-[#2f3437]">ตารางคะแนนพรีเมียร์ลีก</h3>
                  </div>
                  <span className="text-[10px] text-[#9b9a97] font-mono">TOP 6</span>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="grid grid-cols-12 text-[10px] text-[#9b9a97] px-2 py-1 font-sans border-b border-[#f1f1ef]">
                    <span className="col-span-1">#</span>
                    <span className="col-span-6">สโมสร</span>
                    <span className="col-span-2 text-center">แข่ง</span>
                    <span className="col-span-1 text-center">+/-</span>
                    <span className="col-span-2 text-right">แต้ม</span>
                  </div>
                  {football.standings.slice(0, 6).map((row) => (
                    <div
                      key={row.team}
                      className={`grid grid-cols-12 px-2 py-1.5 rounded items-center ${row.rank <= 4 ? "bg-[#fbfbfa]" : ""}`}
                    >
                      <span className="col-span-1 text-[#9b9a97] font-medium">{row.rank}</span>
                      <span className="col-span-6 font-sans font-medium text-[#2f3437] truncate flex items-center gap-1.5">
                        {row.logo && <img src={row.logo} alt="" className="w-4 h-4 object-contain" loading="lazy" />}
                        {row.team}
                      </span>
                      <span className="col-span-2 text-center text-[#787774]">{row.played}</span>
                      <span className="col-span-1 text-center text-[#787774]">{row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</span>
                      <span className="col-span-2 text-right text-[#2f3437] font-bold">{row.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.length > 0 && (
              <div className="notion-card p-3 space-y-1">
                {errors.map((e) => (
                  <p key={e} className="text-[11px] text-red-600">{e}</p>
                ))}
              </div>
            )}

            {/* 3. SIGN UP CALLOUT */}
            <div className="notion-callout p-4 text-center space-y-2.5">
              <h4 className="text-xs font-bold text-[#2f3437]">
                ร่วมเป็นสมาชิก RMLN
              </h4>
              <p className="text-xs text-[#787774] leading-relaxed">
                เข้าถึงระบบแสดงความคิดเห็นใต้บทความ และบันทึกประวัติการปั้นนักเตะ
              </p>
              <Link
                href="/auth/register"
                className="notion-btn-primary w-full py-2 text-xs"
              >
                สมัครสมาชิกฟรี
              </Link>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
