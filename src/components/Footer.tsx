import React from "react";
import Link from "next/link";
import { Globe, ExternalLink, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#fbfbfa] border-t border-[#e9e9e7] text-[#787774] py-12 px-4 sm:px-6">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#2f3437] flex items-center justify-center p-1.5 tracking-tight shadow-xs">
              <img src="/logo.svg" alt="RMLN" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-bold text-[#2f3437] text-sm tracking-tight">
                ร่ายมนต์ลูกหนัง
              </div>
              <div className="text-[10px] text-[#9b9a97] font-mono tracking-wider">
                THE 90-MINUTE FOOTBALL MAGIC
              </div>
            </div>
          </div>
          <p className="text-xs text-[#787774] max-w-sm leading-relaxed">
            สำนักข่าวและวารสารฟุตบอลระดับสากล นำเสนอข้อมูลการแข่งขัน บทวิเคราะห์แท็กติกเชิงลึก ข่าวสารตลาดซื้อขายนักเตะ และพื้นที่แลกเปลี่ยนมุมมองสำหรับแฟนบอล 100%
          </p>
          <div className="flex items-center gap-2 pt-2 text-xs text-[#37352f] font-medium">
            <Globe className="w-3.5 h-3.5 text-[#787774]" />
            <span>รายงานข้อเท็จจริง • วิเคราะห์เชิงลึก • ครอบคลุมฟุตบอลทั่วโลก</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2 text-xs">
          <h4 className="font-semibold text-[#2f3437] text-xs">
            หมวดหมู่ข่าวสาร
          </h4>
          <ul className="space-y-1.5">
            <li><Link href="/news?league=Premier+League" className="hover:text-[#2f3437] transition-colors">พรีเมียร์ลีก อังกฤษ</Link></li>
            <li><Link href="/news?league=UEFA+Champions+League" className="hover:text-[#2f3437] transition-colors">ยูฟ่า แชมเปียนส์ลีก</Link></li>
            <li><Link href="/news?league=La+Liga" className="hover:text-[#2f3437] transition-colors">ลาลีกา สเปน</Link></li>
            <li><Link href="/news?category=transfer" className="hover:text-[#2f3437] transition-colors">ตลาดซื้อขายนักเตะ</Link></li>
            <li><Link href="/news?category=analysis" className="hover:text-[#2f3437] transition-colors">บทวิเคราะห์แท็กติก</Link></li>
          </ul>
        </div>

        {/* Community & Back-Office */}
        <div className="space-y-2 text-xs">
          <h4 className="font-semibold text-[#2f3437] text-xs">
            ระบบและชุมชน
          </h4>
          <ul className="space-y-1.5">
            <li><Link href="/news?category=breaking" className="hover:text-[#2f3437] transition-colors">ข่าวด่วนเรียลไทม์ (Live Feed)</Link></li>
            <li><Link href="/auth/register" className="hover:text-[#2f3437] transition-colors">สมัครสมาชิกแฟนบอล</Link></li>
            <li><Link href="/news" className="hover:text-[#2f3437] transition-colors">คลังบทความทั้งหมด</Link></li>
            <li className="pt-2 border-t border-[#e9e9e7]">
              <a 
                href="https://undes-studio.pages.dev/admin-undes-vault/articles"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#2f3437] font-medium hover:underline"
              >
                <span>ระบบจัดการหลังบ้าน (undes-studio)</span>
                <ExternalLink className="w-3 h-3 text-[#787774]" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto mt-10 pt-6 border-t border-[#e9e9e7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9b9a97]">
        <span>© 2026 RMLN Media Network. ข่าวฟุตบอลระดับโลก สงวนลิขสิทธิ์</span>
        <span className="text-[11px] font-mono text-[#9b9a97]">THE 90-MINUTE FOOTBALL MAGIC</span>
      </div>
    </footer>
  );
}
