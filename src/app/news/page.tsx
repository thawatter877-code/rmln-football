"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, MessageSquare, Clock, Filter, Flame } from "lucide-react";
import { MOCK_NEWS, NewsArticle } from "@/data/mockNews";

function NewsListContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const leagueParam = searchParams.get("league");

  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    if (categoryParam) {
      setActiveFilter(categoryParam);
    } else if (leagueParam) {
      setActiveFilter(leagueParam);
    } else {
      setActiveFilter("all");
    }
  }, [categoryParam, leagueParam]);

  const filteredNews = MOCK_NEWS.filter((n) => {
    if (activeFilter === "all") return true;
    if (n.category.toLowerCase() === activeFilter.toLowerCase()) return true;
    if (n.league.toLowerCase().includes(activeFilter.toLowerCase())) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* Title & Filters */}
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">
              RMLN ARCHIVE &amp; COVERAGE
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white">
            รายงานข่าวและบทวิเคราะห์ฟุตบอล
          </h1>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "breaking", label: "🔥 ข่าวด่วน" },
              { id: "Premier League", label: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 พรีเมียร์ลีก" },
              { id: "UEFA Champions League", label: "🏆 แชมเปียนส์ลีก" },
              { id: "La Liga", label: "🇪🇸 ลาลีกา" },
              { id: "transfer", label: "🔄 ตลาดนักเตะ" },
              { id: "analysis", label: "🔮 ผ่าแท็กติก" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFilter.toLowerCase() === f.id.toLowerCase()
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((news) => (
            <Link
              key={news.id}
              href={`/news/${news.slug}`}
              className="group flex flex-col justify-between p-4 rounded-xl bg-[#0c1220] border border-slate-800/80 hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-md"
            >
              <div className="space-y-3">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-800 relative">
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                    {news.categoryLabel}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-amber-400 font-bold">{news.league}</span>
                    <span>•</span>
                    <span>{news.publishedAt}</span>
                  </div>
                  <h2 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                    {news.title}
                  </h2>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {news.excerpt}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-800/60 mt-4">
                <span className="text-slate-400">{news.author}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {news.views.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {news.comments.length}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b12] text-white p-12 text-center">กำลังโหลด...</div>}>
      <NewsListContent />
    </Suspense>
  );
}
