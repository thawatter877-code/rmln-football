import React from "react";
import Link from "next/link";
import { Sparkles, Trophy, Shield, Flame } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#05080f] border-t border-[var(--border-gold)] text-slate-400 py-12 px-4 sm:px-6">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-700 flex items-center justify-center font-black text-black text-xs">
              RMLN
            </div>
            <div>
              <div className="font-black text-white text-base tracking-wider">
                ร่ายมนต์ลูกหนัง
              </div>
              <div className="text-[10px] text-amber-400 font-mono tracking-widest uppercase">
                THE 90-MINUTE FOOTBALL MAGIC
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            สำนักข่าวและมีเดียลูกหนังระดับโลก เกาะติดทุกมนต์สะกด 90 นาทีในสนาม บทวิเคราะห์แท็กติกเชิงลึก ข่าวซื้อขายนักเตะ และคอมมูนิตี้สำหรับแฟนบอลตัวจริง
          </p>
          <div className="flex items-center gap-2 pt-2 text-xs text-amber-400 font-semibold">
            <Flame className="w-4 h-4 text-red-500" />
            <span>ข่าวด่วนฉับไว • แม่นยำ • เจาะลึกทุกประเด็นลูกหนัง</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2.5 text-xs">
          <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] text-amber-400">
            หมวดหมู่ฟุตบอล
          </h4>
          <ul className="space-y-2">
            <li><Link href="/news?league=Premier+League" className="hover:text-amber-400 transition-colors">พรีเมียร์ลีก อังกฤษ</Link></li>
            <li><Link href="/news?league=UEFA+Champions+League" className="hover:text-amber-400 transition-colors">ยูฟ่า แชมเปียนส์ลีก</Link></li>
            <li><Link href="/news?league=La+Liga" className="hover:text-amber-400 transition-colors">ลาลีกา สเปน</Link></li>
            <li><Link href="/news?category=transfer" className="hover:text-amber-400 transition-colors">ตลาดซื้อขายนักเตะ (Here We Go)</Link></li>
            <li><Link href="/news?category=analysis" className="hover:text-amber-400 transition-colors">ผ่าแท็กติก & บทวิเคราะห์</Link></li>
          </ul>
        </div>

        {/* Community & Mini-game */}
        <div className="space-y-2.5 text-xs">
          <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] text-amber-400">
            คอมมูนิตี้ & กิจกรรม
          </h4>
          <ul className="space-y-2">
            <li><Link href="/academy" className="hover:text-amber-400 transition-colors">🎮 ปั้นนักเตะเยาวชน (Youth Academy)</Link></li>
            <li><Link href="/auth/register" className="hover:text-amber-400 transition-colors">สมัครสมาชิกแฟนบอล</Link></li>
            <li><Link href="/news" className="hover:text-amber-400 transition-colors">เว็บบอร์ดแสดงความคิดเห็น</Link></li>
            <li><Link href="/terms" className="hover:text-amber-400 transition-colors">ข้อกำหนดการใช้งาน</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <span>© 2026 RMLN - ร่ายมนต์ลูกหนัง. All rights reserved.</span>
        <span className="text-[11px] font-mono text-slate-600">THE 90-MINUTE FOOTBALL MAGIC MEDIA</span>
      </div>
    </footer>
  );
}
