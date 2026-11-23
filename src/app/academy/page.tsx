"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Coins, 
  Gem, 
  Dices, 
  Search, 
  Shield, 
  Zap, 
  Crosshair, 
  Sprout, 
  PenTool, 
  Trophy
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface ScoutedPlayer {
  id: string;
  name: string;
  nationality: string;
  position: string;
  age: number;
  overall: number;
  potential: number;
  specialSkill: string;
}

const COUNTRIES = ["อังกฤษ", "บราซิล", "สเปน", "ฝรั่งเศส", "อาร์เจนตินา", "เยอรมนี", "ไทย", "ญี่ปุ่น", "เนเธอร์แลนด์", "โปรตุเกส"];
const POSITIONS = [
  { id: "GK", label: "ผู้รักษาประตู", icon: Shield },
  { id: "DEF", label: "ตัวรับ", icon: Shield },
  { id: "MID", label: "ตัวกลาง", icon: Crosshair },
  { id: "FWD", label: "ตัวรุก", icon: Zap },
];

export default function YouthAcademyPage() {
  const { user, loading, setUserFromServer } = useAuth();

  const [selectedNationality, setSelectedNationality] = useState<string>("สุ่มสัญชาติ");
  const [searchCountry, setSearchCountry] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("MID");
  const [customFirstName, setCustomFirstName] = useState<string>("");
  const [customLastName, setCustomLastName] = useState<string>("");
  const [scoutedRoster, setScoutedRoster] = useState<ScoutedPlayer[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const mapPlayer = (p: any): ScoutedPlayer => ({
    id: p.id,
    name: p.name,
    nationality: p.nationality,
    position: p.position,
    age: p.age,
    overall: p.overall ?? p.rating,
    potential: p.potential,
    specialSkill: p.special_skill || "ทักษะมาตรฐาน",
  });

  // Load this user's roster from D1 (session cookie identifies the user)
  useEffect(() => {
    if (!user) return;
    fetch("/api/scout", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => setScoutedRoster((data?.players || []).map(mapPlayer)))
      .catch(() => {});
  }, [user?.id]);

  const handleRandomNationality = () => {
    const random = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    setSelectedNationality(random);
    setSearchCountry(random);
  };

  const scout = async (mode: "scout_coins" | "scout_gems" | "named") => {
    if (!user || loadingAction) return;
    setLoadingAction(true);
    setMessage(null);
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          mode,
          nationality: COUNTRIES.includes(selectedNationality) ? selectedNationality : undefined,
          position: selectedPosition,
          firstName: customFirstName.trim(),
          lastName: customLastName.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.player) throw new Error(data?.error || "ทำรายการไม่สำเร็จ");

      const player = mapPlayer(data.player);
      setScoutedRoster((prev) => [player, ...prev]);
      setUserFromServer(data.user);
      setMessage(`สำเร็จ! ได้ดาวรุ่งใหม่: ${player.name} (เรตติ้ง ${player.overall}, ศักยภาพ ${player.potential})`);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleScoutPlayer = (useCoins: boolean) => scout(useCoins ? "scout_coins" : "scout_gems");

  const handleCreateNamedPlayer = () => {
    if (!customFirstName.trim() || !customLastName.trim()) {
      setMessage("กรุณากรอกชื่อและนามสกุล");
      return;
    }
    scout("named");
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-[#9b9a97]">กำลังโหลด...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-sm font-semibold text-[#2f3437]">อคาเดมี่เยาวชน</p>
        <p className="text-xs text-[#787774]">เข้าสู่ระบบเพื่อสุ่มและสะสมนักเตะดาวรุ่งของคุณ</p>
        <div className="flex gap-2">
          <Link href="/auth/login" className="notion-btn-secondary px-3 py-1.5 text-xs">เข้าสู่ระบบ</Link>
          <Link href="/auth/register" className="notion-btn-primary px-3 py-1.5 text-xs">สมัครสมาชิก</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#2f3437] py-8 px-4 sm:px-6">
      <div className="max-w-[850px] mx-auto space-y-6">
        
        {/* HEADER BAR (Notion Style) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e9e9e7]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#2f3437] tracking-tight">
                เยาวชน
              </h1>
              <span className="notion-tag font-mono">
                อคาเดมี่ระดับ {user.academyLevel}
              </span>
            </div>
            <p className="text-xs text-[#787774] mt-0.5 font-normal">
              ระบบค้นหาและพัฒนาผู้เล่นดาวรุ่งสู่วงการฟุตบอล
            </p>
          </div>

          {/* Economy pills */}
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-[#2f3437]">
              <Coins className="w-3.5 h-3.5 text-[#787774]" />
              <span>{(user.coins / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-[#2f3437]">
              <Gem className="w-3.5 h-3.5 text-[#787774]" />
              <span>{user.gems}</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-[#787774]">
              {user.squadCount}/{user.maxSquad}
            </div>
          </div>
        </div>

        {/* FEEDBACK ALERT */}
        {message && (
          <div className="p-3 rounded-md bg-[#f7f6f3] border border-[#e9e9e7] text-xs font-medium text-[#2f3437] flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-[#9b9a97] hover:text-[#2f3437]">✕</button>
          </div>
        )}

        {/* SECTION 1: สัญชาตินักเตะ */}
        <div className="notion-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2f3437]">สัญชาตินักเตะ</span>
            <span className="text-[11px] text-[#787774] font-mono">สุ่มสัญชาติ</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleRandomNationality}
              className="w-full sm:w-auto notion-btn-secondary px-3.5 py-2 text-xs shrink-0"
            >
              <Dices className="w-3.5 h-3.5 text-[#787774]" />
              <span>สุ่มสัญชาติ</span>
            </button>
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#9b9a97] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาประเทศ"
                value={searchCountry}
                onChange={(e) => {
                  setSearchCountry(e.target.value);
                  setSelectedNationality(e.target.value || "สุ่มสัญชาติ");
                }}
                className="w-full pl-9 pr-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] placeholder:text-[#9b9a97] focus:outline-none focus:border-[#787774]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ตำแหน่ง */}
        <div className="notion-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2f3437]">ตำแหน่ง</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const randomPos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)].id;
                setSelectedPosition(randomPos);
              }}
              className="px-3 py-1.5 rounded-md border border-[#e9e9e7] bg-[#fbfbfa] text-xs font-medium text-[#787774] hover:bg-[#f1f1ef]"
            >
              สุ่มตำแหน่ง
            </button>
            {POSITIONS.map((pos) => {
              const isActive = selectedPosition === pos.id;
              const Icon = pos.icon;
              return (
                <button
                  key={pos.id}
                  onClick={() => setSelectedPosition(pos.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-[#2f3437] text-white border-[#2f3437]"
                      : "bg-[#fbfbfa] border-[#e9e9e7] text-[#787774] hover:text-[#2f3437] hover:bg-[#f1f1ef]"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{pos.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: สร้างเยาวชน */}
        <div className="notion-card p-5 space-y-4">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#f7f6f3] border border-[#e9e9e7] flex items-center justify-center">
              <Sprout className="w-4 h-4 text-[#787774]" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#2f3437]">สร้างเยาวชน</h3>
              <p className="text-[11px] text-[#787774]">อายุ 16-17 ปี</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleScoutPlayer(false)}
              disabled={loadingAction}
              className="notion-btn-primary px-4 py-2 text-xs disabled:opacity-50"
            >
              <Gem className="w-3.5 h-3.5" />
              <span>40 เพชร</span>
            </button>

            <button
              onClick={() => handleScoutPlayer(true)}
              disabled={loadingAction}
              className="notion-btn-secondary px-4 py-2 text-xs disabled:opacity-50"
            >
              <Coins className="w-3.5 h-3.5 text-[#787774]" />
              <span>20,000 + 20 เพชร</span>
            </button>
          </div>

          <div className="text-[11px] text-[#9b9a97] font-mono">
            สามารถใช้เหรียญกดได้อีก 4/5 ครั้งในซีซั่นนี้
          </div>
        </div>

        {/* SECTION 4: สร้างเยาวชนตั้งชื่อเอง */}
        <div className="notion-card p-5 space-y-4">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#f7f6f3] border border-[#e9e9e7] flex items-center justify-center">
              <PenTool className="w-4 h-4 text-[#787774]" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#2f3437]">สร้างเยาวชนตั้งชื่อเอง</h3>
              <p className="text-[11px] text-[#787774]">กำหนดชื่อนักเตะเพื่อเข้าสู่อคาเดมี่ของคุณโดยเฉพาะ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#787774] block mb-1">ชื่อ</label>
              <input
                type="text"
                value={customFirstName}
                onChange={(e) => setCustomFirstName(e.target.value)}
                placeholder="Somchai"
                className="w-full px-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] focus:outline-none focus:border-[#787774]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#787774] block mb-1">นามสกุล</label>
              <input
                type="text"
                value={customLastName}
                onChange={(e) => setCustomLastName(e.target.value)}
                placeholder="Prasert"
                className="w-full px-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] focus:outline-none focus:border-[#787774]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#9b9a97]">ใช้ตัวอักษร A-Z เท่านั้น</span>
            <button
              onClick={handleCreateNamedPlayer}
              disabled={loadingAction}
              className="notion-btn-primary px-4 py-2 text-xs disabled:opacity-50"
            >
              <Gem className="w-3.5 h-3.5" />
              <span>80 เพชร</span>
            </button>
          </div>
        </div>

        {/* SECTION 5: ROSTER */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#787774]" />
              <h2 className="text-xs font-semibold text-[#2f3437]">
                รายชื่อนักเตะในอคาเดมี่ ({scoutedRoster.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {scoutedRoster.map((player) => (
              <div key={player.id} className="notion-card p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#2f3437]">{player.name}</span>
                    <span className="notion-tag text-[10px]">
                      {player.nationality}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#787774] flex items-center gap-1.5">
                    <span>{player.position}</span>
                    <span>•</span>
                    <span>อายุ {player.age} ปี</span>
                  </div>
                  <div className="text-[10px] text-[#9b9a97]">
                    {player.specialSkill}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-base font-bold text-[#2f3437] font-mono">
                    {player.overall}
                  </div>
                  <div className="text-[9px] text-[#9b9a97] font-mono">
                    POT {player.potential}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
