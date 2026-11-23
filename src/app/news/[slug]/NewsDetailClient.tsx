"use client";

import React, { useState } from "react";
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

  const article = MOCK_NEWS.find((n) => n.slug === slug) || MOCK_NEWS[0];

  const [reactions, setReactions] = useState(article.reactions);
  const [reacted, setReacted] = useState<string | null>(null);
  const [comments, setComments] = useState<NewsComment[]>(article.comments);
  const [commentInput, setCommentInput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleReaction = (type: "fire" | "magic" | "clap") => {
    if (reacted === type) return;
    setReactions((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    setReacted(type);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !user) return;

    const newComment: NewsComment = {
      id: `c-${Date.now()}`,
      userId: user.id,
      userName: user.displayName,
      userClub: user.favoriteClub,
      content: commentInput.trim(),
      likesCount: 0,
      createdAt: "เมื่อสักครู่",
    };

    setComments([newComment, ...comments]);
    setCommentInput("");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 py-8 px-4 sm:px-6">
      <article className="max-w-[850px] mx-auto space-y-8">
        
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าแรก</span>
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono">
              {article.league}
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-bold">
              {article.categoryLabel}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-2 border-y border-slate-800/80 py-3">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-bold">{article.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.publishedAt}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {article.views.toLocaleString()} วิว</span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? "คัดลอกลิงก์แล้ว!" : "แชร์ข่าว"}</span>
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="rounded-2xl overflow-hidden border border-amber-500/30 aspect-video w-full shadow-2xl">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Lead Excerpt */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#0c1424] to-[#070b13] border-l-4 border-amber-400 text-slate-200 text-sm sm:text-base font-semibold leading-relaxed">
          {article.excerpt}
        </div>

        {/* Body Content */}
        <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-normal">
          {article.content}
        </div>

        {/* REACTIONS BAR */}
        <div className="p-6 rounded-2xl bg-[#0c1220] border border-slate-800 text-center space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            ความรู้สึกต่อ 90 นาทีนี้
          </h3>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleReaction("fire")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                reacted === "fire"
                  ? "bg-red-950/60 border-red-500 text-red-300"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-red-500/40"
              }`}
            >
              <span>🔥</span>
              <span>ไฟลุก ({reactions.fire})</span>
            </button>

            <button
              onClick={() => handleReaction("magic")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                reacted === "magic"
                  ? "bg-amber-950/60 border-amber-500 text-amber-300"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40"
              }`}
            >
              <span>✨</span>
              <span>ร่ายมนต์ ({reactions.magic})</span>
            </button>

            <button
              onClick={() => handleReaction("clap")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                reacted === "clap"
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-500/40"
              }`}
            >
              <span>👏</span>
              <span>ปรบมือ ({reactions.clap})</span>
            </button>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <section className="space-y-6 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                ความคิดเห็นแฟนบอล ({comments.length})
              </h2>
            </div>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handlePostComment} className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-bold text-white">{user.displayName}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 text-[10px] font-mono">
                  {user.favoriteClub}
                </span>
              </div>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="ร่วมแสดงความคิดเห็น วิเคราะห์รูปเกมอย่างสร้างสรรค์..."
                rows={3}
                className="w-full p-3 rounded-lg bg-[#070b13] border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-4 py-2 rounded-lg btn-gold text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่งความคิดเห็น</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-xl bg-[#0c1220] border border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-300">
                เข้าสู่ระบบเพื่อร่วมแสดงความคิดเห็นใต้ข่าวและสะสมคะแนน
              </p>
              <div className="flex justify-center gap-3 pt-1">
                <Link href="/auth/login" className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-white hover:bg-slate-700">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/auth/register" className="px-4 py-1.5 rounded-lg btn-gold text-xs font-bold">
                  สมัครสมาชิก
                </Link>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 rounded-xl bg-[#0c1220] border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{comment.userName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-amber-400 font-mono">
                      {comment.userClub}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px]">{comment.createdAt}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {comment.content}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                  <button className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{comment.likesCount} ถูกใจ</span>
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
