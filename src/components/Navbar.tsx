"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Flame, 
  ArrowLeftRight, 
  LogOut,
  Shield,
  Activity,
  BookOpen,
  Menu,
  X,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_FIXTURES } from "@/data/mockNews";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "หน้าแรก" },
    { href: "/news?category=breaking", label: "ข่าวด่วน", icon: Flame },
    { href: "/news?league=Premier+League", label: "พรีเมียร์ลีก" },
    { href: "/news?league=UEFA+Champions+League", label: "แชมเปียนส์ลีก" },
    { href: "/news?league=La+Liga", label: "ลาลีกา" },
    { href: "/news?category=transfer", label: "ตลาดซื้อขาย", icon: ArrowLeftRight },
    { href: "/news?category=analysis", label: "บทวิเคราะห์", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e9e9e7]">
      {/* 1. TOP TICKER BAR (Notion Style: Ultra-clean subtle bar) */}
      <div className="bg-[#f7f6f3] border-b border-[#e9e9e7] py-1.5 px-4 text-xs text-[#787774]">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4 overflow-hidden">
          {/* Breaking Headline */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#e9e9e7] text-[#2f3437] font-semibold text-[10px] tracking-wide uppercase">
              <Activity className="w-3 h-3 text-[#2f3437]" />
              รายงานล่าสุด
            </span>
            <span className="text-[#37352f] font-medium truncate max-w-[280px] sm:max-w-[480px]">
              สรุปผลประกบคู่ ยูฟ่า แชมเปียนส์ลีก รอบ 8 ทีมสุดท้าย และอัปเดตตลาดซื้อขายซัมเมอร์
            </span>
          </div>

          {/* Quick Match Ticker */}
          <div className="hidden md:flex items-center gap-5 overflow-x-auto text-[11px] text-[#787774] shrink-0">
            {MOCK_FIXTURES.slice(0, 3).map((f) => (
              <div key={f.id} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[#9b9a97]">{f.league.split(" ")[0]}</span>
                <span className="text-[#37352f] font-medium">{f.homeTeam}</span>
                <span className="px-1.5 py-0.2 bg-white border border-[#e9e9e7] rounded text-[#2f3437] font-mono font-semibold">
                  {f.homeScore !== null ? `${f.homeScore}-${f.awayScore}` : f.date}
                </span>
                <span className="text-[#37352f] font-medium">{f.awayTeam}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-[#2f3437] flex items-center justify-center p-1.5 tracking-tight shadow-xs">
            <img src="/logo.svg" alt="RMLN" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-[#2f3437] group-hover:text-black transition-colors">
              ร่ายมนต์ลูกหนัง
            </span>
            <span className="text-[10px] tracking-wider text-[#9b9a97] font-mono">
              THE 90-MINUTE FOOTBALL MAGIC
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#f1f1ef] text-[#2f3437] font-semibold"
                    : "text-[#787774] hover:text-[#2f3437] hover:bg-[#f7f6f3]"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* USER BAR */}
        <div className="hidden sm:flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-[#e9e9e7] bg-[#fbfbfa]">
                <div className="w-6 h-6 rounded-full bg-[#f1f1ef] border border-[#e9e9e7] flex items-center justify-center font-bold text-xs text-[#2f3437]">
                  {user.favoriteClub.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#2f3437] leading-tight max-w-[100px] truncate">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-[#9b9a97] leading-tight">
                    {user.favoriteClub}
                  </span>
                </div>
              </div>

              <a
                href="https://undes-studio.pages.dev/admin-undes-vault/articles"
                target="_blank"
                rel="noopener noreferrer"
                title="ระบบจัดการข่าวสารหลังบ้าน (undes-studio)"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#e9e9e7] bg-[#fbfbfa] text-xs text-[#787774] hover:text-[#2f3437] hover:bg-[#f7f6f3] transition-colors"
              >
                <span>จัดการข่าว</span>
                <ExternalLink className="w-3 h-3 text-[#9b9a97]" />
              </a>

              <button
                onClick={logout}
                title="ออกจากระบบ"
                className="p-1.5 rounded-md text-[#9b9a97] hover:text-[#2f3437] hover:bg-[#f7f6f3] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-[#787774] hover:text-[#2f3437] hover:bg-[#f7f6f3] transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/auth/register"
                className="notion-btn-primary px-3 py-1.5 text-xs"
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 rounded-md border border-[#e9e9e7] text-[#787774]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e9e9e7] bg-white p-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-[#2f3437] hover:bg-[#f7f6f3] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-[#787774]" />}
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-[#e9e9e7]">
            <a
              href="https://undes-studio.pages.dev/admin-undes-vault/articles"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-md text-xs font-medium text-[#787774] hover:text-[#2f3437] hover:bg-[#f7f6f3] flex items-center justify-between"
            >
              <span>ระบบจัดการหลังบ้าน (undes-studio)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#9b9a97]" />
            </a>
          </div>

          {user ? (
            <div className="pt-3 border-t border-[#e9e9e7] flex items-center justify-between">
              <div className="text-xs">
                <div className="font-semibold text-[#2f3437]">{user.displayName}</div>
                <div className="text-[#787774]">แฟนบอล: {user.favoriteClub}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-600 font-medium"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#e9e9e7] grid grid-cols-2 gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-md border border-[#e9e9e7] text-xs font-medium text-[#2f3437]"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-md notion-btn-primary text-xs"
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
