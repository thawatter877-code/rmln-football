"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Flame, 
  Clock, 
  Eye, 
  MessageSquare, 
  ArrowRight, 
  Trophy, 
  TrendingUp, 
  ArrowLeftRight, 
  BookOpen, 
  ChevronRight, 
  Activity,
  Globe,
  BellRing
} from "lucide-react";
import { MOCK_NEWS, MOCK_FIXTURES, NewsArticle } from "@/data/mockNews";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newsList, setNewsList] = useState<NewsArticle[]>(MOCK_NEWS);
  const [isLiveActive, setIsLiveActive] = useState(false);

  // Fetch real-time live football feed & D1 published news
  useEffect(() => {
    // 1. Fetch live news feed (Sky Sports / BBC Thai translated)
    fetch("/api/live-news")
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data?.liveNews && data.liveNews.length > 0) {
          const liveMapped: NewsArticle[] = data.liveNews.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            excerpt: item.excerpt,
            content: item.content,
            category: item.category as any,
            categoryLabel: item.categoryLabel,
            league: item.league,
            club: item.sourceName || "Sky Sports / BBC",
            imageUrl: item.imageUrl,
            views: item.views || 2500,
            author: item.author || "Sky Sports / RMLN",
            isBreaking: true,
            isFeatured: false,
            publishedAt: item.publishedAt || "เมื่อสักครู่",
            readTime: item.readTime || "2 นาที",
            reactions: { fire: 120, magic: 240, clap: 80 },
            comments: []
          }));

          setNewsList((prev) => {
            const existingIds = new Set(liveMapped.map((n) => n.id));
            const retained = prev.filter((n) => !existingIds.has(n.id));
            return [...liveMapped.slice(0, 5), ...retained];
          });
          setIsLiveActive(true);
        }
      })
      .catch(() => {});

    // 2. Fetch published articles from central D1 database
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => {
        if (data?.news && Array.isArray(data.news) && data.news.length > 0) {
          const d1Mapped: NewsArticle[] = data.news.map((n: any) => ({
            id: n.id,
            slug: n.slug,
            title: n.title,
            excerpt: n.excerpt,
            content: n.content,
            category: n.category as any,
            categoryLabel: n.category_label || n.category,
            league: n.league || "ฟุตบอลยุโรป",
            club: n.club || "สโมสรชั้นนำ",
            imageUrl: n.image_url || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
            views: n.views || 1000,
            author: n.author || "กองบรรณาธิการ RMLN",
            isBreaking: Boolean(n.is_breaking),
            isFeatured: Boolean(n.is_featured),
            publishedAt: n.published_at || "ไม่นานมานี้",
            readTime: n.read_time || "3 นาที",
            reactions: { fire: 80, magic: 150, clap: 45 },
            comments: []
          }));

          setNewsList((prev) => {
            const existingIds = new Set(d1Mapped.map((d) => d.id));
            const rest = prev.filter((p) => !existingIds.has(p.id));
            return [...d1Mapped, ...rest];
          });
        }
      })
      .catch(() => {});
  }, []);

  const featuredNews = newsList[0] || MOCK_NEWS[0];

  const filteredNews = selectedCategory === "all" 
    ? newsList 
    : newsList.filter(n => n.category === selectedCategory || n.league.toLowerCase().includes(selectedCategory.toLowerCase()));

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
                  {isLiveActive ? "LIVE FEED ข่าวสดเรียลไทม์" : "รายงานพิเศษ"}
                </span>
                <span className="notion-tag font-mono text-[#787774]">
                  {featuredNews.league}
                </span>
                {isLiveActive && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    อัปเดตสด 24 ชม.
                  </span>
                )}
              </div>

              <Link href={`/news/${featuredNews.slug}`} className="group block">
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
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredNews.publishedAt}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {featuredNews.views.toLocaleString()} ครั้ง</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {featuredNews.comments?.length || 0} ความคิดเห็น</span>
              </div>

              <div className="pt-2">
                <Link
                  href={`/news/${featuredNews.slug}`}
                  className="notion-btn-primary px-4 py-2"
                >
                  <span>อ่านรายงานฉบับเต็ม</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Clean Image Container */}
            <div className="lg:col-span-5">
              <Link href={`/news/${featuredNews.slug}`} className="group block relative rounded-lg overflow-hidden border border-[#e9e9e7] shadow-xs">
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#f1f1ef]">
                  <img
                    src={featuredNews.imageUrl}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 bg-white border-t border-[#e9e9e7] flex items-center justify-between text-xs text-[#787774]">
                  <span>ภาพประกอบการแข่งขัน</span>
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
                  href={`/news/${news.slug}`}
                  className="notion-card block p-4 group"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    <div className="sm:w-44 aspect-[16/10] rounded-md overflow-hidden shrink-0 bg-[#f1f1ef] border border-[#e9e9e7]">
                      <img
                        src={news.imageUrl}
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
                          <span>{news.publishedAt}</span>
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
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {news.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {news.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Professional Football Editorial Callout (Replaced Youth Academy) */}
            <div className="notion-callout p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-[#2f3437]">
                  <Globe className="w-4 h-4 text-[#787774]" />
                  <span>กองบรรณาธิการ ร่ายมนต์ลูกหนัง (RMLN Media)</span>
                </div>
                <h3 className="text-base font-bold text-[#2f3437]">
                  เกาะติดรายงานเชิงลึก ข่าวตลาดซื้อขาย และบทวิเคราะห์แท็กติกยุโรป
                </h3>
                <p className="text-xs text-[#787774]">
                  ข้อมูลข่าวกรองฟุตบอลแปลตรงจากสื่อชั้นนำ Sky Sports, BBC Sport และทีมข่าวภาคพื้นยุโรป
                </p>
              </div>

              <Link
                href="/news?category=breaking"
                className="notion-btn-primary px-4 py-2 shrink-0"
              >
                <span>ดูข่าวด่วนทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* RIGHT 4 COLS: SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. MATCH CENTER */}
            <div className="notion-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#e9e9e7] pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#787774]" />
                  <h3 className="text-xs font-semibold text-[#2f3437]">ผลและโปรแกรมการแข่งขัน</h3>
                </div>
                <span className="text-[10px] text-[#9b9a97] font-mono">MATCH CENTER</span>
              </div>

              <div className="space-y-2">
                {MOCK_FIXTURES.map((fix) => (
                  <div key={fix.id} className="p-2.5 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#9b9a97]">
                      <span className="font-medium text-[#787774]">{fix.league}</span>
                      <span className="font-mono text-[#2f3437] font-medium">
                        {fix.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium text-[#2f3437] pt-0.5">
                      <span className="truncate max-w-[90px]">{fix.homeTeam}</span>
                      <span className="px-2 py-0.2 bg-white border border-[#e9e9e7] rounded text-[11px] font-mono font-semibold">
                        {fix.homeScore !== null ? `${fix.homeScore} - ${fix.awayScore}` : fix.date}
                      </span>
                      <span className="truncate max-w-[90px] text-right">{fix.awayTeam}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. LEAGUE STANDINGS */}
            <div className="notion-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#e9e9e7] pb-2.5">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#787774]" />
                  <h3 className="text-xs font-semibold text-[#2f3437]">ตารางคะแนนพรีเมียร์ลีก</h3>
                </div>
                <span className="text-[10px] text-[#9b9a97] font-mono">2026/27</span>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <div className="grid grid-cols-12 text-[10px] text-[#9b9a97] px-2 py-1 font-sans border-b border-[#f1f1ef]">
                  <span className="col-span-1">#</span>
                  <span className="col-span-7">สโมสร</span>
                  <span className="col-span-2 text-center">แข่ง</span>
                  <span className="col-span-2 text-right">แต้ม</span>
                </div>
                {[
                  { pos: 1, club: "Liverpool", p: 11, pts: 28 },
                  { pos: 2, club: "Man City", p: 11, pts: 23 },
                  { pos: 3, club: "Chelsea", p: 11, pts: 19 },
                  { pos: 4, club: "Arsenal", p: 11, pts: 19 },
                  { pos: 5, club: "Nott'm Forest", p: 11, pts: 19 },
                ].map((row) => (
                  <div
                    key={row.pos}
                    className={`grid grid-cols-12 px-2 py-1.5 rounded items-center ${
                      row.pos <= 4 ? "bg-[#fbfbfa]" : "bg-transparent"
                    }`}
                  >
                    <span className="col-span-1 text-[#9b9a97] font-medium">{row.pos}</span>
                    <span className="col-span-7 font-sans font-medium text-[#2f3437] truncate">{row.club}</span>
                    <span className="col-span-2 text-center text-[#787774]">{row.p}</span>
                    <span className="col-span-2 text-right text-[#2f3437] font-bold">{row.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. SIGN UP CALLOUT */}
            <div className="notion-callout p-4 text-center space-y-2.5">
              <h4 className="text-xs font-bold text-[#2f3437]">
                ร่วมเป็นสมาชิก RMLN
              </h4>
              <p className="text-xs text-[#787774] leading-relaxed">
                เข้าถึงระบบแสดงความคิดเห็นใต้บทความ และติดตามข่าวสารสโมสรโปรดของคุณแบบเรียลไทม์
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
