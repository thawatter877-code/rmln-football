"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  PlusCircle, 
  RefreshCw, 
  ArrowLeft, 
  Check, 
  Radio, 
  Trash2, 
  Eye, 
  FileText,
  Send,
  Flame
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NewsArticle, mapDbArticle, articleHref, timeAgo } from "@/lib/news";

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);

  const loadArticles = async () => {
    const res = await fetch("/api/news").catch(() => null);
    const data = await res?.json().catch(() => null);
    setArticles((data?.news || []).map(mapDbArticle));
  };

  useEffect(() => {
    if (isAdmin) loadArticles();
  }, [isAdmin]);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("breaking");
  const [league, setLeague] = useState("Premier League");
  const [imageUrl, setImageUrl] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [liveNewsCount, setLiveNewsCount] = useState(0);

  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setPublishing(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          category,
          league,
          imageUrl: imageUrl.trim(),
          author: user?.displayName || "กองบรรณาธิการ RMLN",
          isBreaking,
          isFeatured,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      setStatusMessage("เผยแพร่ข่าวเรียบร้อยแล้ว");
      setTitle("");
      setExcerpt("");
      setContent("");
      setImageUrl("");
      setIsBreaking(false);
      setIsFeatured(false);
      loadArticles();
    } catch (err: any) {
      setStatusMessage("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleSyncLiveNews = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/live-news");
      const data = await res.json();
      if (data?.success) {
        setLiveNewsCount(data.count);
        setStatusMessage(`ดึงข่าวสดจาก Sky Sports & BBC Sport สำเร็จแล้ว ${data.count} ข่าว!`);
      }
    } catch (err: any) {
      setStatusMessage("ไม่สามารถดึงข้อมูลได้: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (a: NewsArticle) => {
    if (!confirm(`ลบข่าว "${a.title}" ? การลบไม่สามารถย้อนกลับได้`)) return;
    const res = await fetch(`/api/news?id=${encodeURIComponent(a.id)}`, { method: "DELETE", credentials: "same-origin" }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok) {
      setStatusMessage("ลบข่าวแล้ว");
      setArticles((prev) => prev.filter((x) => x.id !== a.id));
    } else {
      setStatusMessage("ลบข่าวไม่สำเร็จ: " + (data?.error || "unknown error"));
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#9b9a97]">กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-sm font-semibold text-[#2f3437]">เฉพาะผู้ดูแลระบบเท่านั้น</p>
        <p className="text-xs text-[#787774]">
          {user ? "บัญชีของคุณไม่มีสิทธิ์จัดการข่าว" : "กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ"}
        </p>
        {!user && <Link href="/auth/login" className="notion-btn-primary px-3 py-1.5 text-xs">เข้าสู่ระบบ</Link>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#2f3437] py-8 px-4 sm:px-6">
      <div className="max-w-[850px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e9e9e7]">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-[#9b9a97] hover:text-[#2f3437]">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl font-bold text-[#2f3437]">
                ระบบจัดการข่าวสารและกองบรรณาธิการ RMLN
              </h1>
            </div>
            <p className="text-xs text-[#787774] mt-0.5">
              เขียนและเผยแพร่ข่าวสารฟุตบอลสดเข้าสู่ฐานข้อมูลจริง
            </p>
          </div>

          <button
            onClick={handleSyncLiveNews}
            disabled={syncing}
            className="notion-btn-secondary px-3.5 py-1.5 text-xs self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "กำลังเชื่อมต่อดาวเทียมข่าว..." : "ดึงข่าวสด Sky Sports / BBC"}</span>
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div className="p-3.5 rounded-md bg-[#f7f6f3] border border-[#e9e9e7] text-xs font-medium text-[#2f3437] flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-[#9b9a97] hover:text-[#2f3437]">✕</button>
          </div>
        )}

        {/* Live News Status Banner */}
        <div className="notion-callout p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="text-xs font-semibold text-[#2f3437]">ฟีดข่าวสด (RSS)</div>
              <div className="text-[11px] text-[#787774]">
                ดึงหัวข้อข่าวจาก Sky Sports และ BBC Sport ทุกครั้งที่มีผู้เปิดเว็บ (แคช 3-5 นาที)
                {liveNewsCount > 0 && ` • ล่าสุด ${liveNewsCount} ข่าว`}
              </div>
            </div>
          </div>
          <span className="notion-tag font-mono text-[10px]">RSS</span>
        </div>

        {/* Publish Form */}
        <form onSubmit={handlePublishNews} className="notion-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e9e9e7] pb-3">
            <FileText className="w-4 h-4 text-[#787774]" />
            <h2 className="text-sm font-semibold text-[#2f3437]">เขียนข่าว / รายงานผลบอลใหม่</h2>
          </div>

          <div>
            <label className="text-xs font-medium text-[#2f3437] block mb-1">
              พาดหัวข่าว (Headline) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ลิเวอร์พูลเปิดบ้านถล่มแมนยู 4-0 ยึดจ่าฝูงพรีเมียร์ลีกต่อเนื่อง"
              className="w-full px-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] focus:outline-none focus:border-[#787774]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#2f3437] block mb-1">
                หมวดหมู่
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] focus:outline-none focus:border-[#787774]"
              >
                <option value="breaking">ข่าวด่วน (Breaking News)</option>
                <option value="transfer">ตลาดซื้อขายนักเตะ (Transfer Market)</option>
                <option value="match_report">รายงานการแข่งขัน (Match Report)</option>
                <option value="analysis">บทวิเคราะห์แท็กติก (Tactical Analysis)</option>
                <option value="feature">สกู๊ปพิเศษ (Special Feature)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#2f3437] block mb-1">
                ลีก / ทัวร์นาเมนต์
              </label>
              <select
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] focus:outline-none focus:border-[#787774]"
              >
                <option value="Premier League">พรีเมียร์ลีก อังกฤษ (Premier League)</option>
                <option value="UEFA Champions League">ยูฟ่า แชมเปียนส์ลีก (Champions League)</option>
                <option value="La Liga">ลาลีกา สเปน (La Liga)</option>
                <option value="Serie A">กัลโช่ เซเรีย อา (Serie A)</option>
                <option value="Bundesliga">บุนเดสลีกา เยอรมนี (Bundesliga)</option>
                <option value="Thai League & National Teams">ฟุตบอลไทยและทีมชาติ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#2f3437] block mb-1">
              คำโปรยย่อ (Excerpt)
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="สรุปเนื้อหาสั้นๆ 1-2 ประโยคสำหรับหน้าแรก"
              className="w-full px-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] focus:outline-none focus:border-[#787774]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#2f3437] block mb-1">
              URL รูปภาพประกอบ (Unsplash หรือ Web URL)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] focus:outline-none focus:border-[#787774]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#2f3437] block mb-1">
              เนื้อหาข่าวฉบับเต็ม *
            </label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="พิมพ์รายละเอียดของข่าว บทสัมภาษณ์ หรือสถิติที่สำคัญ..."
              className="w-full p-3 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] focus:outline-none focus:border-[#787774]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#787774]">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="rounded border-[#e9e9e7]"
              />
              <span>ข่าวด่วน</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#787774]">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-[#e9e9e7]"
              />
              <span>ข่าวเด่นหน้าแรก</span>
            </label>

            <button
              type="submit"
              disabled={publishing}
              className="notion-btn-primary px-5 py-2 text-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{publishing ? "กำลังเผยแพร่..." : "เผยแพร่ข่าว"}</span>
            </button>
          </div>
        </form>

        {/* Published articles */}
        <div className="notion-card p-6 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#e9e9e7] pb-3">
            <Eye className="w-4 h-4 text-[#787774]" />
            <h2 className="text-sm font-semibold text-[#2f3437]">ข่าวที่เผยแพร่แล้ว ({articles.length})</h2>
          </div>
          {articles.length === 0 && <p className="text-xs text-[#9b9a97]">ยังไม่มีข่าวจากกองบรรณาธิการ</p>}
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 text-xs py-1.5 border-b border-[#f1f1ef] last:border-0">
              <div className="min-w-0">
                <Link href={articleHref(a)} className="font-medium text-[#2f3437] hover:underline line-clamp-1">
                  {a.title}
                </Link>
                <div className="text-[11px] text-[#9b9a97]">
                  {a.categoryLabel} • {timeAgo(a.publishedAt)} • {a.views.toLocaleString()} views
                  {a.isFeatured && " • ข่าวเด่น"}
                </div>
              </div>
              <button
                onClick={() => handleDelete(a)}
                title="ลบข่าว"
                className="p-1.5 rounded-md border border-[#e9e9e7] text-[#9b9a97] hover:text-red-600 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
