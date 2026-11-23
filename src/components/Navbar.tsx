"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Flame, 
  Sparkles, 
  Trophy, 
  ArrowRightLeft, 
  User, 
  Menu, 
  X, 
  LogOut,
  Gem,
  Coins,
  Shield
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_FIXTURES } from "@/data/mockNews";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "หน้าแรก" },
    { href: "/news?category=breaking", label: "ข่าวด่วน", badge: "LIVE" },
    { href: "/news?league=Premier+League", label: "พรีเมียร์ลีก" },
    { href: "/news?league=UEFA+Champions+League", label: "แชมเปียนส์ลีก" },
    { href: "/news?category=transfer", label: "ตลาดซื้อขาย" },
    { href: "/academy", label: "อคาเดมี่เยาวชน", highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070b12]/95 backdrop-blur-md border-b border-[var(--border-gold)]">
      {/* 1. TOP BREAKING & MATCH TICKER BAR */}
      <div className="bg-[#05080f] border-b border-[var(--border-subtle)] py-1.5 px-4 text-xs">
        <div className="max-w-[1300px] mx-auto flex items-center justify-between gap-4 overflow-hidden">
          {/* Breaking Tag */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-600/90 text-white font-extrabold text-[10px] tracking-wider uppercase animate-pulse">
              <Flame className="w-3 h-3" />
              90' BREAKING
            </span>
            <span className="text-slate-300 font-medium truncate max-w-[280px] sm:max-w-[450px]">
              ผลจับสลาก UCL รอบ 8 ทีมสุดท้ายเดือด! ยักษ์ชนยักษ์
            </span>
          </div>

          {/* Quick Score Ticker */}
          <div className="hidden md:flex items-center gap-6 overflow-x-auto text-[11px] text-slate-400 shrink-0">
            {MOCK_FIXTURES.slice(0, 3).map((f) => (
              <div key={f.id} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-slate-500 font-semibold">{f.league.split(" ")[0]}:</span>
                <span className="text-slate-200 font-bold">{f.homeTeam}</span>
                <span className="px-1.5 py-0.2 bg-slate-800 rounded text-amber-400 font-mono font-bold">
                  {f.homeScore !== null ? `${f.homeScore} - ${f.awayScore}` : f.date}
                </span>
                <span className="text-slate-200 font-bold">{f.awayTeam}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 p-[1px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0c1220] rounded-[7px] flex items-center justify-center font-black text-amber-400 text-sm tracking-tighter">
              RMLN
            </div>
            <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-spin duration-1000" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-wider text-white">
                ร่ายมนต์ลูกหนัง
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                MEDIA
              </span>
            </div>
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold font-mono">
              THE 90-MINUTE FOOTBALL MAGIC
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  link.highlight
                    ? "bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/40 text-amber-300 hover:border-amber-400"
                    : isActive
                    ? "bg-slate-800/80 text-white border border-slate-700"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[9px] font-extrabold">
                    {link.badge}
                  </span>
                )}
                {link.highlight && (
                  <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* USER ECONOMY / AUTH BAR (From Image: Coins & Gems) */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Coins & Gems Pills */}
              <Link href="/academy" className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full coin-pill text-xs font-mono font-bold hover:brightness-110 transition-all">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{(user.coins / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full gem-pill text-xs font-mono font-bold hover:brightness-110 transition-all">
                  <Gem className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{user.gems}</span>
                </div>
              </Link>

              {/* User Club Badge & Name */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/40 flex items-center justify-center font-bold text-xs text-amber-400">
                  {user.favoriteClub.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight max-w-[100px] truncate">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {user.favoriteClub}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="ออกจากระบบ"
                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/auth/register"
                className="px-3.5 py-1.5 rounded-lg btn-gold text-xs font-bold"
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg border border-slate-800 text-slate-300"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#080d17] p-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded text-sm font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>{link.label}</span>
                {link.highlight && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              </Link>
            ))}
          </nav>
          {user ? (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs">
                <div className="font-bold text-white">{user.displayName} ({user.favoriteClub})</div>
                <div className="text-amber-400 font-mono">{user.coins.toLocaleString()} Coins | {user.gems} Gems</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-400 font-bold"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded bg-slate-800 text-xs font-bold text-white"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded btn-gold text-xs font-bold"
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
