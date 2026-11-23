"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Flame, 
  Sparkles, 
  Clock, 
  Eye, 
  Share2, 
  MessageSquare, 
  ThumbsUp, 
  ArrowLeft,
  Send
} from "lucide-react";
import { MOCK_NEWS, NewsArticle, NewsComment } from "@/data/mockNews";
import { useAuth } from "@/context/AuthContext";

export default function NewsDetailClient() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();

  const [article, setArticle] = useState<NewsArticle>(
    MOCK_NEWS.find((n) => n.slug === slug) || MOCK_NEWS[0]
  );
  const [reactions, setReactions] = useState(article.reactions);
  const [reacted, setReacted] = useState<string | null>(null);
  const [comments, setComments] = useState<NewsComment[]>(article.comments);
  const [commentInput, setCommentInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch real comments and real article stats from Cloudflare D1
  useEffect(() => {
    // 1. Fetch real article from D1
    fetch(`/api/news?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.article) {
          setArticle((prev) => ({
            ...prev,
            views: data.article.views || prev.views,
          }));
        }
      })
      .catch(() => {});

    // 2. Fetch real comments from D1
    fetch(`/api/comments?newsId=${encodeURIComponent(article.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.comments && Array.isArray(data.comments) && data.comments.length > 0) {
          const mapped: NewsComment[] = data.comments.map((c: any) => ({
            id: c.id,
            userId: c.user_id,
            userName: c.user_name,
            userClub: c.user_club || "Arsenal",
            content: c.content,
            likesCount: c.likes_count || 0,
            createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString("th-TH") : "เมื่อสักครู่",
          }));
          setComments(mapped);
        }
      })
      .catch(() => {});
  }, [slug, article.id]);

  const handleReaction = (type: "fire" | "magic" | "clap") => {
    if (reacted === type) return;
    setReactions((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    setReacted(type);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !user || submittingComment) return;

    setSubmittingComment(true);
    const content = commentInput.trim();

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsId: article.id,
          userId: user.id,
          userName: user.displayName,
          userClub: user.favoriteClub,
          content,
        }),
      });

      const data = await res.json();
      const newComment: NewsComment = {
        id: data?.comment?.id || `c-${Date.now()}`,
        userId: user.id,
        userName: user.displayName,
        userClub: user.favoriteClub,
        content,
        likesCount: 0,
        createdAt: "เมื่อสักครู่",
      };

      setComments([newComment, ...comments]);
      setCommentInput("");
    } catch {
      // Local fallback
      const newComment: NewsComment = {
        id: `c-${Date.now()}`,
        userId: user.id,
        userName: user.displayName,
        userClub: user.favoriteClub,
        content,
        likesCount: 0,
        createdAt: "เมื่อสักครู่",
      };
      setComments([newComment, ...comments]);
      setCommentInput("");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#2f3437] py-8 px-4 sm:px-6">
      <article className="max-w-[780px] mx-auto space-y-6">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#2f3437] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับหน้าแรก</span>
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="notion-tag font-mono">
              {article.league}
            </span>
            <span className="notion-tag">
              {article.categoryLabel}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2f3437] leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#9b9a97] pt-2 border-y border-[#e9e9e7] py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-[#37352f] font-medium">{article.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.publishedAt}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {article.views.toLocaleString()} ครั้ง</span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#e9e9e7] bg-[#fbfbfa] hover:bg-[#f7f6f3] text-[#787774] hover:text-[#2f3437] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? "คัดลอกลิงก์แล้ว" : "แชร์"}</span>
            </button>
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-lg overflow-hidden border border-[#e9e9e7] aspect-[16/10] w-full bg-[#f1f1ef]">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Notion Callout Excerpt */}
        <div className="notion-callout p-4 text-[#37352f] text-sm leading-relaxed font-medium">
          {article.excerpt}
        </div>

        {/* Content Body */}
        <div className="text-[#37352f] text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-normal">
          {article.content}
        </div>

        {/* REACTIONS */}
        <div className="notion-card p-4 text-center space-y-2.5">
          <h3 className="text-xs font-semibold text-[#787774]">
            ปฏิกิริยาต่อรายงานนี้
          </h3>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleReaction("fire")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                reacted === "fire"
                  ? "bg-[#2f3437] text-white border-[#2f3437]"
                  : "bg-[#fbfbfa] border-[#e9e9e7] text-[#787774] hover:text-[#2f3437] hover:bg-[#f7f6f3]"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>น่าสนใจ ({reactions.fire})</span>
            </button>

            <button
              onClick={() => handleReaction("magic")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                reacted === "magic"
                  ? "bg-[#2f3437] text-white border-[#2f3437]"
                  : "bg-[#fbfbfa] border-[#e9e9e7] text-[#787774] hover:text-[#2f3437] hover:bg-[#f7f6f3]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ยอดเยี่ยม ({reactions.magic})</span>
            </button>

            <button
              onClick={() => handleReaction("clap")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                reacted === "clap"
                  ? "bg-[#2f3437] text-white border-[#2f3437]"
                  : "bg-[#fbfbfa] border-[#e9e9e7] text-[#787774] hover:text-[#2f3437] hover:bg-[#f7f6f3]"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>เห็นด้วย ({reactions.clap})</span>
            </button>
          </div>
        </div>

        {/* COMMENTS SECTION (Connected to real D1 database) */}
        <section className="space-y-4 pt-4 border-t border-[#e9e9e7]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#787774]" />
              <h2 className="text-sm font-semibold text-[#2f3437]">
                ความคิดเห็น ({comments.length})
              </h2>
            </div>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handlePostComment} className="notion-card p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-[#787774]">
                <span className="font-semibold text-[#2f3437]">{user.displayName}</span>
                <span className="notion-tag text-[10px]">
                  {user.favoriteClub}
                </span>
              </div>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="ร่วมแสดงความคิดเห็นหรือวิเคราะห์ประเด็นนี้..."
                rows={3}
                className="w-full p-2.5 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] placeholder:text-[#9b9a97] focus:outline-none focus:border-[#787774]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentInput.trim() || submittingComment}
                  className="notion-btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{submittingComment ? "กำลังบันทึก..." : "ส่งข้อความ"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="notion-callout p-4 text-center space-y-2">
              <p className="text-xs text-[#787774]">
                เข้าสู่ระบบเพื่อร่วมแสดงความคิดเห็นในบทความนี้
              </p>
              <div className="flex justify-center gap-2">
                <Link href="/auth/login" className="notion-btn-secondary px-3 py-1 text-xs">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/auth/register" className="notion-btn-primary px-3 py-1 text-xs">
                  สมัครสมาชิก
                </Link>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="notion-card p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#2f3437]">{comment.userName}</span>
                    <span className="notion-tag text-[10px]">
                      {comment.userClub}
                    </span>
                  </div>
                  <span className="text-[#9b9a97] text-[11px]">{comment.createdAt}</span>
                </div>
                <p className="text-xs text-[#37352f] leading-relaxed">
                  {comment.content}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[#9b9a97] pt-1">
                  <button className="flex items-center gap-1 hover:text-[#2f3437] transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{comment.likesCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </article>
    </div>
  );
}
