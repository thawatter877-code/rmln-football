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
  Sprout, 
  PenTool, 
  Trophy,
  Check,
  Compass,
  User,
  Activity
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
  { id: "GK", label: "ผู้รักษาประตู", icon: Shield },
  { id: "DEF", label: "ตัวรับ", icon: Shield },
  { id: "MID", label: "ตัวกลาง", icon: Crosshair },
  { id: "FWD", label: "ตัวรุก", icon: Zap },
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
      specialSkill: "การจ่ายบอลทะลุช่อง (Precision Passing)"
    }
  ]);
  const [message, setMessage] = useState<string | null>(null);

  const handleRandomNationality = () => {
    const random = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    setSelectedNationality(random);
    setSearchCountry(random);
  };

  const handleScoutPlayer = (useCoins: boolean) => {
    if (!user) return;
    
    if (useCoins) {
      if (user.coins < 20000 || user.gems < 20) {
        setMessage("เหรียญหรือเพชรไม่เพียงพอ");
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

    const nat = selectedNationality === "สุ่มสัญชาติ" 
      ? COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)] 
      : selectedNationality;
    const pos = selectedPosition;
    const overall = Math.floor(Math.random() * 20) + 70;
    const potential = Math.floor(Math.random() * 10) + 88;
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
      specialSkill: "ความแม่นยำในจังหวะสุดท้าย (90-Min Precision)"
    };

    setScoutedRoster([newPlayer, ...scoutedRoster]);
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
      specialSkill: "ทักษะการเล่นระดับสูง (Master Skill)"
    };

    setScoutedRoster([newPlayer, ...scoutedRoster]);
    setMessage(`สำเร็จ! เพิ่มดาวรุ่ง ${newPlayer.name} เข้าสู่อคาเดมี่แล้ว`);
  };

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
                อคาเดมี่ระดับ {user?.academyLevel || "D4"}
              </span>
            </div>
            <p className="text-xs text-[#787774] mt-0.5 font-normal">
              ระบบจำลองการค้นหาและพัฒนาผู้เล่นดาวรุ่งสู่วงการฟุตบอล
            </p>
          </div>

          {/* Economy pills */}
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-[#2f3437]">
              <Coins className="w-3.5 h-3.5 text-[#787774]" />
              <span>{user ? (user.coins / 1000).toFixed(0) : "198"}K</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-[#2f3437]">
              <Gem className="w-3.5 h-3.5 text-[#787774]" />
              <span>{user?.gems ?? 282}</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-[#787774]">
              {user?.squadCount ?? 23}/{user?.maxSquad ?? 50}
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
            <span className="text-[11px] text-[#787774] font-mono flex items-center gap-1">
              เลือกตำแหน่งเอง + 20 <Gem className="w-3 h-3 text-[#787774] inline" />
            </span>
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
              className="notion-btn-primary px-4 py-2 text-xs"
            >
              <Gem className="w-3.5 h-3.5" />
              <span>40 เพชร</span>
            </button>

            <button
              onClick={() => handleScoutPlayer(true)}
              className="notion-btn-secondary px-4 py-2 text-xs"
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
              className="notion-btn-primary px-4 py-2 text-xs"
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
