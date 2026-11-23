"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  ArrowLeft,
  Trash2,
  FileText,
  Send,
  Inbox,
  Users,
  Newspaper,
  ExternalLink,
  Languages,
  UserPlus,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NewsArticle, mapDbArticle, articleHref, timeAgo, loadNewsFeed, handleImgError } from "@/lib/news";

type Tab = "inbox" | "write" | "published" | "staff";

interface StaffUser {
  id: string;
  username: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
}

const ROLE_LABEL: Record<string, string> = { admin: "ผู้ดูแลระบบ", editor: "บรรณาธิการ/นักแปล", member: "สมาชิก" };

const inputCls =
  "w-full px-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] focus:outline-none focus:border-[#787774]";

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "breaking",
  league: "Premier League",
  imageUrl: "",
  isBreaking: false,
  isFeatured: false,
  sourceUrl: "",
  sourceName: "",
  originalTitle: "",
};

export default function AdminPage() {
  const { user, loading, isAdmin, isStaff } = useAuth();
  const [tab, setTab] = useState<Tab>("inbox");
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // ---------- data ----------
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [incoming, setIncoming] = useState<NewsArticle[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);

  const loadArticles = useCallback(async () => {
    const res = await fetch("/api/news").catch(() => null);
    const data = await res?.json().catch(() => null);
    setArticles((data?.news || []).map(mapDbArticle));
  }, []);

  const loadInbox = useCallback(async () => {
    setLoadingInbox(true);
    try {
      const feed = await loadNewsFeed(true);
      setIncoming(feed.articles.filter((a) => a.isLive));
      if (feed.errors.length) setStatusMessage({ text: feed.errors.join(" / "), error: true });
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  useEffect(() => {
    if (!isStaff) return;
    loadArticles();
    loadInbox();
  }, [isStaff, loadArticles, loadInbox]);

  // ---------- editor form ----------
  const [form, setForm] = useState(emptyForm);
  const [publishing, setPublishing] = useState(false);
  const set = (patch: Partial<typeof emptyForm>) => setForm((f) => ({ ...f, ...patch }));

  const startFromIncoming = (a: NewsArticle) => {
    setForm({
      ...emptyForm,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      category: a.category === "transfer" ? "transfer" : "breaking",
      league: a.league === "Premier League" ? "Premier League" : "World Football",
      imageUrl: a.imageUrl,
      sourceUrl: a.sourceUrl || "",
      sourceName: a.sourceName || "",
      originalTitle: a.originalTitle || "",
    });
    setTab("write");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ...form, author: user?.displayName || "กองบรรณาธิการ RMLN" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setStatusMessage({ text: "เผยแพร่ข่าวเรียบร้อยแล้ว" });
      setForm(emptyForm);
      await loadArticles();
      await loadInbox();
      setTab("published");
    } catch (err: any) {
      setStatusMessage({ text: "เผยแพร่ไม่สำเร็จ: " + err.message, error: true });
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (a: NewsArticle) => {
    if (!confirm(`ลบข่าว "${a.title}" ? การลบไม่สามารถย้อนกลับได้`)) return;
    const res = await fetch(`/api/news?id=${encodeURIComponent(a.id)}`, { method: "DELETE", credentials: "same-origin" }).catch(
      () => null
    );
    const data = await res?.json().catch(() => null);
    if (res?.ok) {
      setStatusMessage({ text: "ลบข่าวแล้ว" });
      setArticles((prev) => prev.filter((x) => x.id !== a.id));
    } else {
      setStatusMessage({ text: "ลบข่าวไม่สำเร็จ: " + (data?.error || "unknown error"), error: true });
    }
  };

  // ---------- staff ----------
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StaffUser[]>([]);

  const loadStaff = useCallback(async () => {
    const res = await fetch("/api/staff", { credentials: "same-origin" }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setStaff(data?.staff || []);
  }, []);

  useEffect(() => {
    if (isAdmin && tab === "staff") loadStaff();
  }, [isAdmin, tab, loadStaff]);

  const searchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await fetch(`/api/staff?q=${encodeURIComponent(query.trim())}`, { credentials: "same-origin" }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSearchResults(data?.results || []);
    if (data?.results?.length === 0) setStatusMessage({ text: "ไม่พบผู้ใช้ ให้พนักงานสมัครสมาชิกที่หน้าสมัครสมาชิกก่อน" });
  };

  const changeRole = async (u: StaffUser, role: string) => {
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ userId: u.id, role }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok) {
      setStatusMessage({ text: `เปลี่ยนสิทธิ์ ${u.display_name || u.username} เป็น${ROLE_LABEL[role]}แล้ว` });
      setSearchResults((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
      loadStaff();
    } else {
      setStatusMessage({ text: "เปลี่ยนสิทธิ์ไม่สำเร็จ: " + (data?.error || "unknown error"), error: true });
    }
  };

  // ---------- guards ----------
  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#9b9a97]">กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (!isStaff) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-sm font-semibold text-[#2f3437]">เฉพาะทีมงานกองบรรณาธิการ</p>
        <p className="text-xs text-[#787774]">
          {user ? "บัญชีของคุณยังไม่ได้รับสิทธิ์ ติดต่อผู้ดูแลระบบให้เพิ่มคุณเป็นพนักงาน" : "กรุณาเข้าสู่ระบบด้วยบัญชีทีมงาน"}
        </p>
        {!user && (
          <Link href="/auth/login" className="notion-btn-primary px-3 py-1.5 text-xs">
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Inbox; count?: number }[] = [
    { id: "inbox", label: "ข่าวเข้า (แปลแล้ว)", icon: Inbox, count: incoming.length },
    { id: "write", label: "เขียน/เรียบเรียง", icon: FileText },
    { id: "published", label: "เผยแพร่แล้ว", icon: Newspaper, count: articles.length },
    ...(isAdmin ? [{ id: "staff" as Tab, label: "พนักงาน", icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-white text-[#2f3437] py-8 px-4 sm:px-6">
      <div className="max-w-[900px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e9e9e7]">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-[#9b9a97] hover:text-[#2f3437]">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl font-bold text-[#2f3437]">ห้องข่าว RMLN</h1>
            </div>
            <p className="text-xs text-[#787774] mt-0.5">
              {user?.displayName} • {ROLE_LABEL[user?.role || "member"]}
            </p>
          </div>
          <button onClick={loadInbox} disabled={loadingInbox} className="notion-btn-secondary px-3.5 py-1.5 text-xs self-start sm:self-auto">
            <RefreshCw className={`w-3.5 h-3.5 ${loadingInbox ? "animate-spin" : ""}`} />
            <span>{loadingInbox ? "กำลังดึงและแปลข่าว..." : "ดึงข่าวใหม่"}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                tab === id ? "bg-[#2f3437] text-white" : "bg-[#fbfbfa] border border-[#e9e9e7] text-[#787774] hover:text-[#2f3437]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              {count !== undefined && <span className="font-mono opacity-70">{count}</span>}
            </button>
          ))}
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-md border text-xs font-medium flex items-center justify-between gap-3 ${
              statusMessage.error ? "bg-red-50 border-red-200 text-red-700" : "bg-[#f7f6f3] border-[#e9e9e7] text-[#2f3437]"
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="text-[#9b9a97] hover:text-[#2f3437]">
              ✕
            </button>
          </div>
        )}

        {/* ---------- INBOX ---------- */}
        {tab === "inbox" && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-[#787774]">
              ข่าวจริงจาก Sky Sports และ BBC Sport แปลเป็นไทยอัตโนมัติแล้ว (แสดงบนหน้าเว็บพร้อมป้าย &quot;แปลอัตโนมัติ&quot;)
              กด &quot;เรียบเรียง&quot; เพื่อตรวจคำแปล เขียนเพิ่ม แล้วเผยแพร่เป็นข่าวของ RMLN
            </p>
            {loadingInbox && incoming.length === 0 && <p className="text-xs text-[#9b9a97]">กำลังโหลด...</p>}
            {!loadingInbox && incoming.length === 0 && <p className="text-xs text-[#9b9a97]">ไม่มีข่าวใหม่ที่ยังไม่ได้เรียบเรียง</p>}
            {incoming.map((a) => (
              <div key={a.id} className="notion-card p-3 flex gap-3">
                <img
                  src={a.imageUrl}
                  alt=""
                  onError={handleImgError}
                  className="w-24 h-16 rounded object-cover bg-[#f1f1ef] shrink-0 hidden sm:block"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-[11px] text-[#9b9a97]">
                    {a.sourceName} • {timeAgo(a.publishedAt)}
                    {!a.autoTranslated && <span className="text-amber-600"> • ยังไม่ได้แปล</span>}
                  </div>
                  <p className="text-sm font-semibold text-[#2f3437] leading-snug">{a.title}</p>
                  {a.originalTitle && a.originalTitle !== a.title && (
                    <p lang="en" className="text-[11px] text-[#9b9a97] line-clamp-1">
                      {a.originalTitle}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => startFromIncoming(a)} className="notion-btn-primary px-3 py-1.5 text-xs">
                    <Languages className="w-3.5 h-3.5" />
                    <span>เรียบเรียง</span>
                  </button>
                  {a.sourceUrl && (
                    <a
                      href={a.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="notion-btn-secondary px-3 py-1 text-[11px] justify-center"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>ต้นฉบับ</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------- WRITE ---------- */}
        {tab === "write" && (
          <form onSubmit={handlePublish} className="notion-card p-6 space-y-4">
            {form.sourceUrl && (
              <div className="notion-callout p-3 text-xs space-y-1">
                <div className="font-semibold text-[#2f3437]">เรียบเรียงจาก {form.sourceName}</div>
                {form.originalTitle && (
                  <div lang="en" className="text-[#787774]">
                    ต้นฉบับ: {form.originalTitle}
                  </div>
                )}
                <a href={form.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline text-[#787774]">
                  เปิดอ่านข่าวต้นฉบับเต็ม
                </a>
                <button type="button" onClick={() => setForm(emptyForm)} className="block text-[#9b9a97] hover:text-red-600 pt-1">
                  ล้างฟอร์ม
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-[#2f3437] block mb-1">พาดหัวข่าว *</label>
              <input type="text" required value={form.title} onChange={(e) => set({ title: e.target.value })} className={inputCls} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#2f3437] block mb-1">หมวดหมู่</label>
                <select value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
                  <option value="breaking">ข่าวด่วน</option>
                  <option value="transfer">ตลาดซื้อขายนักเตะ</option>
                  <option value="match_report">รายงานการแข่งขัน</option>
                  <option value="analysis">บทวิเคราะห์</option>
                  <option value="feature">สกู๊ปพิเศษ</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#2f3437] block mb-1">ลีก / ทัวร์นาเมนต์</label>
                <select value={form.league} onChange={(e) => set({ league: e.target.value })} className={inputCls}>
                  <option value="Premier League">พรีเมียร์ลีก</option>
                  <option value="UEFA Champions League">ยูฟ่า แชมเปียนส์ลีก</option>
                  <option value="La Liga">ลาลีกา</option>
                  <option value="Serie A">กัลโช่ เซเรีย อา</option>
                  <option value="Bundesliga">บุนเดสลีกา</option>
                  <option value="World Football">ฟุตบอลต่างประเทศ</option>
                  <option value="Thai League & National Teams">ฟุตบอลไทยและทีมชาติ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#2f3437] block mb-1">คำโปรย</label>
              <input type="text" value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} className={inputCls} />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2f3437] block mb-1">URL รูปภาพ (https://)</label>
              <input type="url" value={form.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} className={inputCls} />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2f3437] block mb-1">เนื้อหาข่าว *</label>
              <textarea
                required
                rows={10}
                value={form.content}
                onChange={(e) => set({ content: e.target.value })}
                placeholder="ตรวจคำแปล แก้ชื่อนักเตะ/สโมสรให้ถูกต้อง และเขียนรายละเอียดเพิ่มจากข่าวต้นฉบับ..."
                className={inputCls + " p-3"}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#787774]">
                  <input type="checkbox" checked={form.isBreaking} onChange={(e) => set({ isBreaking: e.target.checked })} />
                  <span>ข่าวด่วน</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#787774]">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} />
                  <span>ข่าวเด่นหน้าแรก</span>
                </label>
              </div>
              <button type="submit" disabled={publishing} className="notion-btn-primary px-5 py-2 text-xs disabled:opacity-50">
                <Send className="w-3.5 h-3.5" />
                <span>{publishing ? "กำลังเผยแพร่..." : "เผยแพร่ข่าว"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ---------- PUBLISHED ---------- */}
        {tab === "published" && (
          <div className="notion-card p-5 space-y-1">
            {articles.length === 0 && <p className="text-xs text-[#9b9a97]">ยังไม่มีข่าวจากกองบรรณาธิการ</p>}
            {articles.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 text-xs py-2 border-b border-[#f1f1ef] last:border-0">
                <div className="min-w-0">
                  <Link href={articleHref(a)} className="font-medium text-[#2f3437] hover:underline line-clamp-1">
                    {a.title}
                  </Link>
                  <div className="text-[11px] text-[#9b9a97]">
                    {a.author} • {a.categoryLabel} • {timeAgo(a.publishedAt)} • {a.views.toLocaleString()} views
                    {a.isFeatured && " • ข่าวเด่น"}
                    {a.sourceName && ` • จาก ${a.sourceName}`}
                  </div>
                </div>
                {(isAdmin || a.createdBy === user?.id) && (
                  <button
                    onClick={() => handleDelete(a)}
                    title="ลบข่าว"
                    className="p-1.5 rounded-md border border-[#e9e9e7] text-[#9b9a97] hover:text-red-600 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ---------- STAFF ---------- */}
        {tab === "staff" && isAdmin && (
          <div className="space-y-4">
            <div className="notion-callout p-4 text-xs text-[#787774] space-y-1">
              <p className="font-semibold text-[#2f3437]">วิธีเพิ่มพนักงาน</p>
              <p>1. ให้พนักงานสมัครสมาชิกที่หน้า &quot;สมัครสมาชิก&quot; ของเว็บก่อน</p>
              <p>2. ค้นหาชื่อผู้ใช้หรืออีเมลด้านล่าง แล้วกด &quot;ตั้งเป็นบรรณาธิการ&quot;</p>
              <p>
                บรรณาธิการ: เข้าห้องข่าว เรียบเรียงและเผยแพร่ข่าว ลบได้เฉพาะข่าวของตัวเอง • ผู้ดูแลระบบ: ทำได้ทุกอย่างและจัดการพนักงาน
              </p>
            </div>

            <form onSubmit={searchUsers} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#9b9a97] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหาชื่อผู้ใช้ หรือ อีเมล"
                  className={inputCls + " pl-9"}
                />
              </div>
              <button type="submit" className="notion-btn-primary px-4 py-2 text-xs">
                ค้นหา
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="notion-card p-4 space-y-1">
                {searchResults.map((u) => (
                  <StaffRow key={u.id} u={u} selfId={user?.id} onChange={changeRole} />
                ))}
              </div>
            )}

            <div className="notion-card p-4 space-y-1">
              <h3 className="text-xs font-semibold text-[#2f3437] pb-2 border-b border-[#e9e9e7]">ทีมงานปัจจุบัน ({staff.length})</h3>
              {staff.map((u) => (
                <StaffRow key={u.id} u={u} selfId={user?.id} onChange={changeRole} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StaffRow({ u, selfId, onChange }: { u: StaffUser; selfId?: string; onChange: (u: StaffUser, role: string) => void }) {
  const isSelf = u.id === selfId;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-2 border-b border-[#f1f1ef] last:border-0">
      <div className="min-w-0">
        <div className="font-medium text-[#2f3437]">
          {u.display_name || u.username} <span className="text-[#9b9a97]">@{u.username}</span>
          {isSelf && <span className="text-[#9b9a97]"> (คุณ)</span>}
        </div>
        <div className="text-[11px] text-[#9b9a97]">
          {u.email} • {ROLE_LABEL[u.role] || u.role}
        </div>
      </div>
      {!isSelf && (
        <div className="flex gap-1.5">
          {u.role !== "editor" && (
            <button onClick={() => onChange(u, "editor")} className="notion-btn-secondary px-2.5 py-1 text-[11px]">
              <UserPlus className="w-3 h-3" />
              <span>ตั้งเป็นบรรณาธิการ</span>
            </button>
          )}
          {u.role !== "admin" && (
            <button onClick={() => onChange(u, "admin")} className="notion-btn-secondary px-2.5 py-1 text-[11px]">
              ตั้งเป็นผู้ดูแล
            </button>
          )}
          {u.role !== "member" && (
            <button onClick={() => onChange(u, "member")} className="px-2.5 py-1 text-[11px] text-red-600 hover:underline">
              ถอดสิทธิ์
            </button>
          )}
        </div>
      )}
    </div>
  );
}
