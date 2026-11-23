"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, ShieldCheck, AlertTriangle, RefreshCw, EyeOff, Eye, Trash2, Pencil, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { timeAgo } from "@/lib/news";

interface Prospect {
  id: string;
  grp: string;
  name: string;
  name_th: string | null;
  birth_date: string | null;
  nationality: string | null;
  nationality_th: string | null;
  position: string | null;
  position_th: string | null;
  club: string | null;
  league: string | null;
  highlight: string | null;
  score: number;
  verified: number;
  verify_note: string | null;
  sources: string | null;
  edited_by_staff: number;
  hidden: number;
  updated_at: string;
}

const GROUP_TABS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "FWD", label: "กองหน้า" },
  { id: "MID", label: "กองกลาง" },
  { id: "DEF", label: "กองหลัง" },
  { id: "GK", label: "ผู้รักษาประตู" },
];
const REFRESH_ORDER = ["GK", "DEF", "MID", "FWD"];

function ageOf(birth: string | null): number | null {
  if (!birth) return null;
  const b = new Date(birth + "T00:00:00Z");
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - b.getUTCFullYear();
  const m = now.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < b.getUTCDate())) age--;
  return age;
}

function parseSources(s: string | null): { title: string; uri: string }[] {
  try {
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export default function Top100Page() {
  const { isStaff } = useAuth();
  const [players, setPlayers] = useState<Prospect[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = async () => {
    const res = await fetch(`/api/prospects${isStaff ? "?all=1" : ""}`, { credentials: "same-origin" }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setPlayers(data?.players || []);
    setUpdatedAt(data?.updatedAt || null);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaff]);

  // Rank among visible players (overall), then filter for display
  const ranked = useMemo(() => {
    const visible = players.filter((p) => !p.hidden).slice(0, 100);
    const rankById = new Map(visible.map((p, i) => [p.id, i + 1]));
    const pool = isStaff ? players : visible;
    const q = query.trim().toLowerCase();
    return pool
      .filter((p) => group === "all" || p.grp === group)
      .filter(
        (p) =>
          !q ||
          [p.name, p.name_th, p.club, p.nationality, p.nationality_th, p.league].some((v) => (v || "").toLowerCase().includes(q))
      )
      .map((p) => ({ ...p, rank: rankById.get(p.id) || null }));
  }, [players, group, query, isStaff]);

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  };

  const refreshAll = async () => {
    if (!confirm("ให้ AI ค้นหาและตรวจสอบรายชื่อดาวรุ่งใหม่ทั้ง 4 ตำแหน่ง? ใช้เวลาประมาณ 2-5 นาที (ข้อมูลที่ทีมงานแก้ไขเองจะไม่ถูกแทนที่)")) return;
    for (const g of REFRESH_ORDER) {
      setBusy(g);
      setMessage({ text: `AI กำลังค้นหาและตรวจสอบ: ${GROUP_TABS.find((t) => t.id === g)?.label}...` });
      try {
        const r = await post({ action: "refresh", group: g });
        setMessage({ text: `${GROUP_TABS.find((t) => t.id === g)?.label}: ได้ ${r.result.stored} คน (ยืนยันข้อมูลแล้ว ${r.result.verified})` });
        await load();
      } catch (err: any) {
        setMessage({ text: `อัปเดต ${g} ไม่สำเร็จ: ${err.message}`, error: true });
        break;
      }
    }
    setBusy(null);
  };

  const toggleHidden = async (p: Prospect) => {
    try {
      await post({ action: "update", id: p.id, hidden: !p.hidden });
      await load();
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    }
  };

  const remove = async (p: Prospect) => {
    if (!confirm(`ลบ ${p.name} ออกจากรายชื่อ?`)) return;
    try {
      await post({ action: "delete", id: p.id });
      await load();
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    }
  };

  const editClub = async (p: Prospect) => {
    const club = prompt(`สโมสรปัจจุบันของ ${p.name}`, p.club || "");
    if (club === null) return;
    const highlight = prompt("จุดเด่น (ภาษาไทย)", p.highlight || "");
    if (highlight === null) return;
    try {
      await post({ action: "update", id: p.id, club, highlight });
      await load();
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#2f3437] py-8 px-4 sm:px-6">
      <div className="max-w-[960px] mx-auto space-y-5">
        {/* Header */}
        <div className="space-y-2 pb-4 border-b border-[#e9e9e7]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2f3437]" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ดาวรุ่ง TOP 100 ของโลก</h1>
          </div>
          <p className="text-sm text-[#787774]">
            100 นักเตะอายุไม่เกิน 21 ปีที่น่าจับตามองที่สุดในตอนนี้ จัดอันดับโดยกองบรรณาธิการ RMLN
            ด้วยการค้นข้อมูลล่าสุดและตรวจสอบสโมสร วันเกิด และสัญชาติกับแหล่งข่าว
          </p>
          <p className="text-[11px] text-[#9b9a97]">
            {updatedAt ? `อัปเดตล่าสุด ${timeAgo(updatedAt)}` : ""} • อันดับเป็นความเห็นของกองบรรณาธิการ ไม่ใช่สถิติทางการ
          </p>
        </div>

        {isStaff && (
          <div className="notion-callout p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#787774]">
              ทีมงาน: ให้ AI ค้นหาและตรวจสอบรายชื่อใหม่ หรือซ่อน/แก้ไข/ลบรายชื่อที่ไม่ถูกต้อง (ข้อมูลที่แก้เองจะไม่ถูก AI แทนที่)
            </span>
            <button onClick={refreshAll} disabled={!!busy} className="notion-btn-primary px-3 py-1.5 text-xs disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
              <span>{busy ? "AI กำลังทำงาน..." : "อัปเดตรายชื่อด้วย AI"}</span>
            </button>
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-md border text-xs flex justify-between gap-3 ${
              message.error ? "bg-red-50 border-red-200 text-red-700" : "bg-[#f7f6f3] border-[#e9e9e7]"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-[#9b9a97]">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {GROUP_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setGroup(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                  group === t.id ? "bg-[#2f3437] text-white" : "bg-[#fbfbfa] border border-[#e9e9e7] text-[#787774] hover:text-[#2f3437]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#9b9a97] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อ สโมสร หรือประเทศ"
              className="w-full pl-9 pr-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs focus:outline-none focus:border-[#787774]"
            />
          </div>
        </div>

        {/* List */}
        {loading && <p className="text-xs text-[#9b9a97]">กำลังโหลด...</p>}
        {!loading && players.length === 0 && (
          <div className="notion-card p-8 text-center text-sm text-[#787774]">
            ยังไม่มีรายชื่อ{isStaff ? " กด “อัปเดตรายชื่อด้วย AI” เพื่อสร้างรายชื่อครั้งแรก" : " ทีมงานกำลังจัดทำ"}
          </div>
        )}

        <div className="space-y-2">
          {ranked.map((p) => {
            const age = ageOf(p.birth_date);
            const open = expanded === p.id;
            const sources = parseSources(p.sources);
            return (
              <div key={p.id} className={`notion-card p-3 sm:p-4 ${p.hidden ? "opacity-50" : ""}`}>
                <button className="w-full text-left flex items-start gap-3" onClick={() => setExpanded(open ? null : p.id)}>
                  <div className="w-9 shrink-0 text-center">
                    <div className="text-lg font-bold text-[#2f3437] font-mono leading-none">{p.rank ?? "–"}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-semibold text-[#2f3437]">{p.name_th || p.name}</span>
                      {p.name_th && <span className="text-[11px] text-[#9b9a97]">{p.name}</span>}
                    </div>
                    <div className="text-[11px] text-[#787774] flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                      <span>{p.position_th || p.position}</span>
                      {age !== null && <span>• {age} ปี</span>}
                      {(p.nationality_th || p.nationality) && <span>• {p.nationality_th || p.nationality}</span>}
                      {p.club && <span className="text-[#2f3437] font-medium">• {p.club}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    {p.verified ? (
                      <span title="ตรวจสอบสโมสร วันเกิด และสัญชาติแล้ว">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </span>
                    ) : (
                      <span title="ยังยืนยันข้อมูลไม่ครบ">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </span>
                    )}
                  </div>
                </button>

                {open && (
                  <div className="mt-3 pl-12 space-y-2 text-xs text-[#37352f]">
                    {p.highlight && <p className="leading-relaxed">{p.highlight}</p>}
                    <div className="text-[11px] text-[#787774] space-y-0.5">
                      {p.league && <div>ลีก: {p.league}</div>}
                      {p.birth_date && <div>วันเกิด: {new Date(p.birth_date + "T00:00:00Z").toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</div>}
                      {!p.verified && <div className="text-amber-600">ยังยืนยันข้อมูลบางส่วนไม่ได้{p.verify_note ? `: ${p.verify_note}` : ""}</div>}
                    </div>
                    {sources.length > 0 && (
                      <div className="text-[11px] text-[#9b9a97]">
                        แหล่งข้อมูล:{" "}
                        {sources.slice(0, 4).map((s, i) => (
                          <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="underline mr-2 inline-flex items-center gap-0.5">
                            {s.title || "ลิงก์"} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    )}
                    {isStaff && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <button onClick={() => editClub(p)} className="notion-btn-secondary px-2.5 py-1 text-[11px]">
                          <Pencil className="w-3 h-3" /> <span>แก้ไข</span>
                        </button>
                        <button onClick={() => toggleHidden(p)} className="notion-btn-secondary px-2.5 py-1 text-[11px]">
                          {p.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{p.hidden ? "แสดง" : "ซ่อน"}</span>
                        </button>
                        <button onClick={() => remove(p)} className="px-2.5 py-1 text-[11px] text-red-600 hover:underline inline-flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> ลบ
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
