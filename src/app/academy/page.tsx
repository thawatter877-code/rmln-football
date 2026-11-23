"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Coins, 
  Gem, 
  Dices, 
  Search, 
  Info, 
  Shield, 
  Zap, 
  Crosshair, 
  UserCheck, 
  Sprout, 
  PenTool, 
  CheckCircle,
  Trophy
} from "lucide-react";
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
  { id: "GK", label: "ผู้รักษาประตู", icon: "🧤", color: "text-purple-400" },
  { id: "DEF", label: "ตัวรับ", icon: "🛡️", color: "text-blue-400" },
  { id: "MID", label: "ตัวกลาง", icon: "🎯", color: "text-emerald-400" },
  { id: "FWD", label: "ตัวรุก", icon: "⚡", color: "text-amber-400" },
];

export default function YouthAcademyPage() {
  const { user, updateUserEconomy } = useAuth();
  
  const [selectedNationality, setSelectedNationality] = useState<string>("สุ่มสัญชาติ");
  const [searchCountry, setSearchCountry] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("MID");
  const [customFirstName, setCustomFirstName] = useState<string>("Somchai");
  const [customLastName, setCustomLastName] = useState<string>("Prasert");
  const [scoutedRoster, setScoutedRoster] = useState<ScoutedPlayer[]>([
    {
      id: "p1",
      name: "ธีรเดช สายฟ้า",
      nationality: "ไทย",
      position: "ตัวกลาง",
      age: 17,
      overall: 78,
      potential: 92,
      specialSkill: "ร่ายมนต์จ่ายทะลุช่อง (Magic Passing)"
    }
  ]);
  const [lastScouted, setLastScouted] = useState<ScoutedPlayer | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRandomNationality = () => {
    const random = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    setSelectedNationality(random);
    setSearchCountry(random);
  };

  const handleScoutPlayer = (useCoins: boolean) => {
    if (!user) return;
    
    // Check cost
    if (useCoins) {
      if (user.coins < 20000 || user.gems < 20) {
        setMessage("เหรียญหรือเพชรไม่เพียงพอ!");
        return;
      }
      updateUserEconomy(-20000, -20);
    } else {
      if (user.gems < 40) {
        setMessage("เพชรไม่เพียงพอ (ต้องการ 40 เพชร)");
        return;
      }
      updateUserEconomy(0, -40);
    }

    // Generate random youth player
    const nat = selectedNationality === "สุ่มสัญชาติ" 
      ? COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)] 
      : selectedNationality;
    const pos = selectedPosition;
    const overall = Math.floor(Math.random() * 20) + 70; // 70 - 89
    const potential = Math.floor(Math.random() * 10) + 88; // 88 - 97
    const randomFirst = ["Leo", "Kai", "Arthur", "Danilo", "Kenji", "Tawan", "Alex", "Bruno"][Math.floor(Math.random() * 8)];
    const randomLast = ["Silva", "Magic", "Santos", "Wonder", "Sterling", "Kaiser"][Math.floor(Math.random() * 6)];

    const newPlayer: ScoutedPlayer = {
      id: `p-${Date.now()}`,
      name: `${randomFirst} ${randomLast}`,
      nationality: nat,
      position: POSITIONS.find(p => p.id === pos)?.label || "ตัวกลาง",
      age: Math.floor(Math.random() * 2) + 16,
      overall,
      potential,
      specialSkill: "ความแม่นยำ 90 นาที (90-Min Precision)"
    };

    setScoutedRoster([newPlayer, ...scoutedRoster]);
    setLastScouted(newPlayer);
    setMessage(`สำเร็จ! ปั้นเยาวชนใหม่: ${newPlayer.name} (เรตติ้ง ${newPlayer.overall}, ศักยภาพ ${newPlayer.potential})`);
  };

  const handleCreateNamedPlayer = () => {
    if (!user) return;
    if (user.gems < 80) {
      setMessage("เพชรไม่เพียงพอ (ต้องการ 80 เพชร)");
      return;
    }
    if (!customFirstName.trim() || !customLastName.trim()) {
      setMessage("กรุณากรอกชื่อและนามสกุล");
      return;
    }

    updateUserEconomy(0, -80);

    const newPlayer: ScoutedPlayer = {
      id: `p-${Date.now()}`,
      name: `${customFirstName.trim()} ${customLastName.trim()}`,
      nationality: selectedNationality === "สุ่มสัญชาติ" ? "ไทย" : selectedNationality,
      position: POSITIONS.find(p => p.id === selectedPosition)?.label || "ตัวกลาง",
      age: 16,
      overall: 82,
      potential: 95,
      specialSkill: "ร่ายมนต์ลูกหนังขั้นสูง (Master Magic)"
    };

    setScoutedRoster([newPlayer, ...scoutedRoster]);
    setLastScouted(newPlayer);
    setMessage(`สำเร็จ! สร้างดาวรุ่งชื่อพิเศษ: ${newPlayer.name} เข้าสู่อคาเดมีแล้ว`);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-[900px] mx-auto space-y-6">
        
        {/* HEADER BAR (Matching reference screenshot exactly) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-wide">
                เยาวชน
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                อคาเดมี่ระดับ {user?.academyLevel || "D4"} <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
              </span>
            </div>
          </div>

          {/* Economy pills from screenshot */}
          <div className="flex items-center gap-3 font-mono font-bold text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full coin-pill">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{user ? (user.coins / 1000).toFixed(0) : "198"}K</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gem-pill">
              <Gem className="w-4 h-4 text-cyan-400" />
              <span>{user?.gems ?? 282}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              {user?.squadCount ?? 23}/{user?.maxSquad ?? 50}
            </div>
          </div>
        </div>

        {/* FEEDBACK ALERT */}
        {message && (
          <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-between animate-fade-in">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* SECTION 1: สัญชาตินักเตะ */}
        <div className="magic-frame p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">สัญชาตินักเตะ</span>
            <span className="text-xs text-slate-400 font-mono">สุ่มสัญชาติ</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleRandomNationality}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#1a253d] border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#233152] transition-colors shrink-0"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span>สุ่มสัญชาติ</span>
            </button>
            <div className="relative w-full">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาประเทศ"
                value={searchCountry}
                onChange={(e) => {
                  setSearchCountry(e.target.value);
                  setSelectedNationality(e.target.value || "สุ่มสัญชาติ");
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0a0f1d] border border-slate-700/80 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ตำแหน่ง */}
        <div className="magic-frame p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">ตำแหน่ง</span>
            <span className="text-xs text-cyan-400 font-mono flex items-center gap-1">
              เลือกตำแหน่งเอง + 20 <Gem className="w-3 h-3 inline" />
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const randomPos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)].id;
                setSelectedPosition(randomPos);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#141d30] border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              🎲 สุ่มตำแหน่ง
            </button>
            {POSITIONS.map((pos) => {
              const isActive = selectedPosition === pos.id;
              return (
                <button
                  key={pos.id}
                  onClick={() => setSelectedPosition(pos.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/30"
                      : "bg-[#0b101e] border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{pos.icon}</span>
                  <span>{pos.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: สร้างเยาวชน */}
        <div className="magic-frame p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-xl">
              🌱
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">สร้างเยาวชน</h3>
              <p className="text-xs text-slate-400 mt-0.5">อายุ 16-17</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleScoutPlayer(false)}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-700/30 transition-transform active:scale-95"
            >
              <Gem className="w-4 h-4 text-cyan-200" />
              <span>40</span>
            </button>

            <button
              onClick={() => handleScoutPlayer(true)}
              className="px-5 py-2.5 rounded-lg bg-[#18233a] border border-amber-500/40 hover:bg-[#202f4e] text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>20,000 +</span>
              <Gem className="w-3.5 h-3.5 text-cyan-400" />
              <span>20</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            ใช้เงินกดได้อีก 4/5 ตัวในซีซั่นนี้
          </div>
        </div>

        {/* SECTION 4: สร้างเยาวชนตั้งชื่อเอง */}
        <div className="magic-frame p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-xl">
              ✍️
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">สร้างเยาวชนตั้งชื่อเอง</h3>
              <p className="text-xs text-slate-400 mt-0.5">กำหนดชื่อดาวรุ่งเข้าสู่อคาเดมี่ของคุณโดยเฉพาะ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">ชื่อ</label>
              <input
                type="text"
                value={customFirstName}
                onChange={(e) => setCustomFirstName(e.target.value)}
                placeholder="Somchai"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0f1d] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">นามสกุล</label>
              <input
                type="text"
                value={customLastName}
                onChange={(e) => setCustomLastName(e.target.value)}
                placeholder="Prasert"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0f1d] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">ใช้ A-Z เท่านั้น</span>
            <button
              onClick={handleCreateNamedPlayer}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <Gem className="w-4 h-4 text-cyan-200" />
              <span>80</span>
            </button>
          </div>
        </div>

        {/* SECTION 5: ROSTER นักเตะเยาวชนในสังกัด */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white">ดาวรุ่งในอคาเดมี่ของคุณ ({scoutedRoster.length})</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scoutedRoster.map((player) => (
              <div key={player.id} className="p-4 rounded-xl bg-[#0c1322] border border-amber-500/20 flex items-center justify-between gap-3 shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{player.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-amber-300 font-mono">
                      {player.nationality}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{player.position}</span>
                    <span>•</span>
                    <span>อายุ {player.age} ปี</span>
                  </div>
                  <div className="text-[10px] text-amber-400/90 italic">
                    ✨ {player.specialSkill}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {player.overall}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
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
