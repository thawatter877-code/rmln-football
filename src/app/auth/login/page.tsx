"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError(null);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.success) router.push("/");
    else setError(result.error || "เข้าสู่ระบบไม่สำเร็จ");
  };

  return (
    <div className="min-h-screen bg-white text-[#2f3437] flex items-center justify-center p-4">
      <div className="notion-card w-full max-w-sm p-6 sm:p-8 space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-9 h-9 rounded-md bg-[#2f3437] text-white flex items-center justify-center font-bold text-xs mx-auto">
            RL
          </div>
          <h1 className="text-lg font-bold text-[#2f3437]">
            เข้าสู่ระบบ RMLN
          </h1>
          <p className="text-xs text-[#787774]">
            ใช้บัญชี RMLN หรืออีเมลและรหัสผ่านเดียวกับ undes-studio ได้เลย
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div role="alert" className="p-2.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-[#2f3437] block mb-1">
              ชื่อผู้ใช้ หรือ อีเมล
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#9b9a97] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ชื่อผู้ใช้ หรือ email@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] focus:outline-none focus:border-[#787774]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#2f3437] block mb-1">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#9b9a97] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-xs text-[#2f3437] focus:outline-none focus:border-[#787774]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="notion-btn-primary w-full py-2 text-xs"
          >
            <span>{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-[#787774] pt-2 border-t border-[#e9e9e7]">
          ยังไม่มีบัญชีสมาชิก?{" "}
          <Link href="/auth/register" className="text-[#2f3437] font-semibold hover:underline">
            สมัครสมาชิกใหม่
          </Link>
        </div>

      </div>
    </div>
  );
}
