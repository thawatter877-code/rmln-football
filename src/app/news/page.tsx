"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, ExternalLink, Clock, Flame, ArrowLeftRight, BookOpen, Compass } from "lucide-react";
import { loadNewsFeed, articleHref, timeAgo, matchesFilter, NewsArticle, FALLBACK_IMAGE, handleImgError } from "@/lib/news";

function NewsListContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const leagueParam = searchParams.get("league");

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    loadNewsFeed()
      .then((feed) => {
        setAllNews(feed.articles);
        setErrors(feed.errors);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setActiveFilter(categoryParam);
    } else if (leagueParam) {
      setActiveFilter(leagueParam);
    } else {
      setActiveFilter("all");
    }
  }, [categoryParam, leagueParam]);

  const filteredNews = allNews.filter((n) => matchesFilter(n, activeFilter));

  return (
    <div className="min-h-screen bg-white text-[#2f3437] py-8 px-4 sm:px-6">
      <div className="max-w-[1240px] mx-auto space-y-6">
        
        {/* Title and Filters */}
        <div className="space-y-3 border-b border-[#e9e9e7] pb-6">
          <div className="flex items-center gap-2">
            <span className="notion-tag font-mono">
              RMLN ARCHIVE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#2f3437]">
            รายงานข่าวและบทวิเคราะห์ฟุตบอล
          </h1>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "breaking", label: "ข่าวด่วน", icon: Flame },
              { id: "Premier League", label: "พรีเมียร์ลีก" },
              { id: "UEFA Champions League", label: "แชมเปียนส์ลีก" },
              { id: "La Liga", label: "ลาลีกา" },
              { id: "transfer", label: "ตลาดซื้อขาย", icon: ArrowLeftRight },
              { id: "analysis", label: "บทวิเคราะห์", icon: BookOpen },
            ].map((f) => {
              const Icon = f.icon;
              const isActive = activeFilter.toLowerCase() === f.id.toLowerCase();
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#2f3437] text-white"
                      : "bg-[#fbfbfa] border border-[#e9e9e7] text-[#787774] hover:text-[#2f3437] hover:bg-[#f7f6f3]"
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {errors.map((e) => (
          <p key={e} className="text-xs text-red-600">{e}</p>
        ))}
        {loading && <p className="text-xs text-[#9b9a97]">กำลังโหลดข่าว...</p>}
        {!loading && filteredNews.length === 0 && (
          <p className="text-sm text-[#787774] py-12 text-center">ยังไม่มีข่าวในหมวดนี้</p>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNews.map((news) => (
            <Link
              key={news.id}
              href={articleHref(news)}
              className="notion-card block p-4 group"
            >
              <div className="space-y-3">
                <div className="aspect-[16/10] w-full rounded-md overflow-hidden bg-[#f1f1ef] border border-[#e9e9e7]">
                  <img
                    src={news.imageUrl}
                    loading="lazy"
                    onError={handleImgError}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-[#9b9a97]">
                    <span className="font-medium text-[#787774]">{news.league}</span>
                    <span>•</span>
                    <span>{timeAgo(news.publishedAt)}</span>
                  </div>
                  <h2 className="text-sm font-semibold text-[#2f3437] group-hover:text-black transition-colors line-clamp-2 leading-snug">
                    {news.title}
                  </h2>
                  <p className="text-xs text-[#787774] line-clamp-2 leading-relaxed font-normal">
                    {news.excerpt}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#9b9a97] pt-3 border-t border-[#f1f1ef] mt-4">
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
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white text-[#787774] p-12 text-center text-xs">กำลังโหลดเนื้อหา...</div>}>
      <NewsListContent />
    </Suspense>
  );
}
