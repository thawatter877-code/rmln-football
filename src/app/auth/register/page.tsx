"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Lock, User, Mail, ArrowRight, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CLUBS = [
  "Arsenal", "Liverpool", "Man City", "Man Utd", "Chelsea", "Tottenham", 
  "Real Madrid", "Barcelona", "Bayern Munich", "PSG", "Juventus", "AC Milan", "Inter Milan", "บุรีรัมย์ ยูไนเต็ด"
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [favoriteClub, setFavoriteClub] = useState("Arsenal");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) return;
    setLoading(true);
    await register(username.trim(), email.trim(), password, favoriteClub);
    setLoading(false);
    router.push("/academy");
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex items-center justify-center p-4 py-12">
      <div className="magic-frame w-full max-w-md p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-700 flex items-center justify-center font-black text-black text-sm mx-auto shadow-lg shadow-amber-500/20">
            RMLN
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            สมัครสมาชิก RMLN
          </h1>
          <p className="text-xs text-slate-400">
            สร้างบัญชีแฟนบอลเพื่อร่วมคอมเมนต์และรับโควตาปั้นนักเตะเยาวชน
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>โบนัสต้อนรับ: 198,000 Coins + 282 Gems ฟรี!</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              ชื่อผู้ใช้ (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น MagicStriker"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#070b13] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              อีเมล
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fan@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#070b13] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              สโมสรที่ชอบ (Favorite Club)
            </label>
            <div className="relative">
              <Trophy className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={favoriteClub}
                onChange={(e) => setFavoriteClub(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#070b13] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 appearance-none cursor-pointer"
              >
                {CLUBS.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#070b13] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg btn-gold text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <span>{loading ? "กำลังสร้างบัญชี..." : "ลงทะเบียนรับโบนัสทันที"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/auth/login" className="text-amber-400 font-bold hover:underline">
            เข้าสู่ระบบที่นี่
          </Link>
        </div>

      </div>
    </div>
  );
}
