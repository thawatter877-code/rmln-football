"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    await login(username, password);
    setLoading(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex items-center justify-center p-4">
      <div className="magic-frame w-full max-w-md p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-700 flex items-center justify-center font-black text-black text-sm mx-auto shadow-lg shadow-amber-500/20">
            RMLN
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            เข้าสู่ระบบ RMLN แฟนบอล
          </h1>
          <p className="text-xs text-slate-400">
            บัญชีอิสระสำหรับคอมเมนต์ข่าวและเล่นอคาเดมี่เยาวชน
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              ชื่อผู้ใช้ หรือ อีเมล
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น Gunner99 หรือ fan@rmln.football"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#070b13] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
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
            <span>{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          ยังไม่มีบัญชี RMLN?{" "}
          <Link href="/auth/register" className="text-amber-400 font-bold hover:underline">
            สมัครสมาชิกแฟนบอลใหม่
          </Link>
        </div>

      </div>
    </div>
  );
}
