"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, Eye, Share2, Flame, Sparkles, ThumbsUp, MessageSquare, Send, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  NewsArticle,
  NewsComment,
  mapDbArticle,
  loadNewsFeed,
  timeAgo,
  handleImgError,
} from "@/lib/news";

type ReactionType = "fire" | "magic" | "clap";

function mapComment(c: any): NewsComment {
  return {
    id: c.id,
    userId: c.user_id,
    userName: c.user_name,
    userClub: c.user_club || "",
    content: c.content,
    createdAt: c.created_at ? timeAgo(c.created_at.replace(" ", "T") + (c.created_at.endsWith("Z") ? "" : "Z")) : "เมื่อสักครู่",
  };
}

function ArticleView() {
  const slug = useSearchParams().get("slug") || "";
  const { user } = useAuth();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");
  const [reactions, setReactions] = useState<Record<ReactionType, number>>({ fire: 0, magic: 0, clap: 0 });
  const [reacted, setReacted] = useState<ReactionType | null>(null);
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // 1. Load the article: editorial (D1) first, then the live RSS feed
  useEffect(() => {
    if (!slug) {
      setStatus("notfound");
      return;
    }
    let cancelled = false;
    (async () => {
      setStatus("loading");
      let found: NewsArticle | null = null;
      if (!slug.startsWith("live-")) {
        const res = await fetch(`/api/news?slug=${encodeURIComponent(slug)}`).catch(() => null);
        if (res?.ok) {
          const data = await res.json().catch(() => null);
          if (data?.article) found = mapDbArticle(data.article);
        }
      }
      if (!found) {
        const feed = await loadNewsFeed().catch(() => null);
        found = feed?.articles.find((a) => a.slug === slug) || null;
      }
      if (cancelled) return;
      setArticle(found);
      setStatus(found ? "ready" : "notfound");
      if (found) document.title = `${found.title} | RMLN`;
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // 2. Load comments + reactions once we know the article id
  const articleId = article?.id;
  useEffect(() => {
    if (!articleId) return;
    fetch(`/api/comments?newsId=${encodeURIComponent(articleId)}`)
      .then((r) => r.json())
      .then((data) => setComments((data?.comments || []).map(mapComment)))
      .catch(() => {});
    fetch(`/api/reactions?newsId=${encodeURIComponent(articleId)}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.reactions) setReactions(data.reactions);
        setReacted(data?.mine || null);
      })
      .catch(() => {});
  }, [articleId, user?.id]);

  const handleReaction = async (type: ReactionType) => {
    if (!article || !user || reacted === type) return;
    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ newsId: article.id, type }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.reactions) {
      setReactions(data.reactions);
      setReacted(data.mine);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !commentInput.trim() || !user || submittingComment) return;

    setSubmittingComment(true);
    setCommentError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ newsId: article.id, content: commentInput.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.comment) throw new Error(data?.error || "บันทึกความคิดเห็นไม่สำเร็จ");
      setComments((prev) => [mapComment(data.comment), ...prev]);
      setCommentInput("");
    } catch (err: any) {
      setCommentError(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && article) await navigator.share({ title: article.title, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  if (status === "loading") {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#9b9a97]">กำลังโหลดข่าว...</div>;
  }

  if (status === "notfound" || !article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-sm font-semibold text-[#2f3437]">ไม่พบข่าวนี้</p>
        <p className="text-xs text-[#787774]">ข่าวอาจถูกลบไปแล้ว หรือข่าวสดหมดอายุจากฟีดต้นทาง</p>
        <Link href="/news" className="notion-btn-primary px-3 py-1.5 text-xs">ดูข่าวทั้งหมด</Link>
      </div>
    );
  }

  const reactionButtons: { type: ReactionType; label: string; Icon: typeof Flame }[] = [
    { type: "fire", label: "น่าสนใจ", Icon: Flame },
    { type: "magic", label: "ยอดเยี่ยม", Icon: Sparkles },
    { type: "clap", label: "เห็นด้วย", Icon: ThumbsUp },
  ];

  return (
    <div className="min-h-screen bg-white text-[#2f3437] py-8 px-4 sm:px-6">
      <article className="max-w-[780px] mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#787774] hover:text-[#2f3437] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับหน้าแรก</span>
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {article.league && <span className="notion-tag font-mono">{article.league}</span>}
            <span className="notion-tag">{article.categoryLabel}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2f3437] leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#9b9a97] border-y border-[#e9e9e7] py-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[#37352f] font-medium">{article.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {timeAgo(article.publishedAt)}
              </span>
              {!article.isLive && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {article.views.toLocaleString()} ครั้ง
                  </span>
                </>
              )}
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

        {/* Image */}
        <div className="rounded-lg overflow-hidden border border-[#e9e9e7] aspect-[16/10] w-full bg-[#f1f1ef]">
          <img
            src={article.imageUrl}
            alt={article.title}
            onError={handleImgError}
            className="w-full h-full object-cover"
          />
        </div>

        {article.excerpt && article.excerpt !== article.content && (
          <div className="notion-callout p-4 text-[#37352f] text-sm leading-relaxed font-medium">{article.excerpt}</div>
        )}

        <div className="text-[#37352f] text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
          {article.content}
        </div>

        {article.isLive && article.sourceUrl && (
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="notion-btn-primary px-4 py-2 text-xs inline-flex"
          >
            <span>อ่านข่าวฉบับเต็มที่ {article.sourceName}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Reactions */}
        <div className="notion-card p-4 text-center space-y-2.5">
          <h3 className="text-xs font-semibold text-[#787774]">ปฏิกิริยาต่อรายงานนี้</h3>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {reactionButtons.map(({ type, label, Icon }) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                disabled={!user}
                title={user ? undefined : "เข้าสู่ระบบเพื่อกดปฏิกิริยา"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors disabled:cursor-not-allowed ${
                  reacted === type
                    ? "bg-[#2f3437] text-white border-[#2f3437]"
                    : "bg-[#fbfbfa] border-[#e9e9e7] text-[#787774] hover:text-[#2f3437] hover:bg-[#f7f6f3]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>
                  {label} ({reactions[type]})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <section className="space-y-4 pt-4 border-t border-[#e9e9e7]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#787774]" />
            <h2 className="text-sm font-semibold text-[#2f3437]">ความคิดเห็น ({comments.length})</h2>
          </div>

          {user ? (
            <form onSubmit={handlePostComment} className="notion-card p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-[#787774]">
                <span className="font-semibold text-[#2f3437]">{user.displayName}</span>
                {user.favoriteClub && <span className="notion-tag text-[10px]">{user.favoriteClub}</span>}
              </div>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="ร่วมแสดงความคิดเห็นหรือวิเคราะห์ประเด็นนี้..."
                rows={3}
                maxLength={2000}
                className="w-full p-2.5 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] placeholder:text-[#9b9a97] focus:outline-none focus:border-[#787774]"
              />
              {commentError && <p className="text-xs text-red-600">{commentError}</p>}
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
              <p className="text-xs text-[#787774]">เข้าสู่ระบบเพื่อร่วมแสดงความคิดเห็นในบทความนี้</p>
              <div className="flex justify-center gap-2">
                <Link href="/auth/login" className="notion-btn-secondary px-3 py-1 text-xs">เข้าสู่ระบบ</Link>
                <Link href="/auth/register" className="notion-btn-primary px-3 py-1 text-xs">สมัครสมาชิก</Link>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {comments.length === 0 && <p className="text-xs text-[#9b9a97]">ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็น</p>}
            {comments.map((comment) => (
              <div key={comment.id} className="notion-card p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#2f3437]">{comment.userName}</span>
                    {comment.userClub && <span className="notion-tag text-[10px]">{comment.userClub}</span>}
                  </div>
                  <span className="text-[#9b9a97] text-[11px]">{comment.createdAt}</span>
                </div>
                <p className="text-xs text-[#37352f] leading-relaxed whitespace-pre-line break-words">{comment.content}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}

export default function NewsViewPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-sm text-[#9b9a97]">กำลังโหลดข่าว...</div>}>
      <ArticleView />
    </Suspense>
  );
}
