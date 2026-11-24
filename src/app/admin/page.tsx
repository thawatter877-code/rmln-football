"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck, Database, Layers } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-[80vh] bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full notion-card p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-[#2f3437] text-white flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-bold text-[#2f3437]">
            ระบบจัดการข่าวสารหลังบ้าน (Central CMS)
          </h1>
          <p className="text-xs text-[#787774] leading-relaxed">
            ระบบบริหารจัดการข่าวสารและบทความทั้งหมดของ RMLN เชื่อมต่อกับระบบหลังบ้านหลักที่
          </p>
          <div className="font-mono text-xs text-[#2f3437] font-semibold bg-[#f1f1ef] py-1 px-2 rounded inline-block">
            undes-studio.pages.dev
          </div>
        </div>

        <div className="p-3 rounded-md bg-[#fbfbfa] border border-[#e9e9e7] text-left text-xs space-y-2 text-[#787774]">
          <div className="flex items-center gap-1.5 font-medium text-[#2f3437]">
            <Database className="w-3.5 h-3.5 text-[#787774]" />
            <span>ฐานข้อมูลกลางร่วม: undes_studio_db</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            บทความที่เขียนและเผยแพร่ผ่าน Undes Studio Vault จะถูกส่งมาแสดงผลบนเว็บข่าว RMLN โดยอัตโนมัติแบบเรียลไทม์
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <a
            href="https://undes-studio.pages.dev/admin-undes-vault/articles"
            target="_blank"
            rel="noopener noreferrer"
            className="notion-btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
          >
            <span>เข้าสู่ระบบหลังบ้านที่ undes-studio.pages.dev</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <Link
            href="/"
            className="notion-btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าแรก RMLN</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
