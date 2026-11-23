# RMLN (ร่ายมนต์ลูกหนัง) — Handoff สำหรับแชทถัดไป

> อัปเดตล่าสุด: 23 พ.ย. 2026 • `main` ล่าสุด = `8c7ef6c` (merge PR #7)
> Repo: `thawatter877-code/rmln-football` • เว็บจริง: https://rmln-news.pages.dev
> Branch ทำงาน: `claude/wonderful-thompson-e63apt` (merge เข้า `main` ผ่าน PR ทุกครั้ง แล้ว Cloudflare deploy อัตโนมัติ)

## 1. ภาพรวม
เว็บข่าวฟุตบอลภาษาไทย บน **Cloudflare Pages** (Next.js 16.4.6 static export → `out/` + Pages Functions ใน `functions/`) ใช้ฐานข้อมูล **D1 ร่วมกับเว็บ undes-studio** (binding `DB`, database `undes_studio_db` ใน `wrangler.toml`)

- เจ้าของสื่อสารภาษาไทย ชอบให้ "ทำให้เลย" แล้ว merge ขึ้น Production
- **ข้อมูลต้องจริงเสมอ** ห้ามใส่ข่าว/สถิติ/รายชื่อนักเตะที่แต่งขึ้น (เคยมีข่าวปลอมจากเวอร์ชันเก่า ลบไปแล้ว)
- ใช้ **Gemini** (ไม่ใช่ Claude) สำหรับงาน AI ตามที่เจ้าของเลือก

## 2. ฟีเจอร์ที่มีตอนนี้
| ส่วน | ไฟล์หลัก | หมายเหตุ |
|---|---|---|
| หน้าแรก / รายการข่าว | `src/app/page.tsx`, `src/app/news/page.tsx`, `src/lib/news.ts` | รวมข่าว D1 (ทีมงาน + AI) + RSS Sky Sports/BBC แปลไทย |
| หน้าข่าว | `src/app/news/view/page.tsx` (`/news/view?slug=`) | คอมเมนต์ + รีแอคชัน (ต้องล็อกอิน), เครดิตแหล่งข่าว, ป้าย AI/แปลอัตโนมัติ |
| ข่าวสด + แปลไทย | `functions/api/live-news.ts`, `_lib/feeds.ts`, `_lib/translate.ts` | Google Translate (gtx) แคชใน `rmln_translations` |
| AI เขียนข่าว (Gemini) | `_lib/ai-desk.ts`, `api/ai-desk.ts` | อ่านต้นฉบับ → เขียนข่าวไทยใหม่ → fact-check รอบ 2 → ผ่าน=เผยแพร่ / ไม่ผ่าน=draft |
| ผลบอล + ตารางคะแนน | `functions/api/football.ts` | ESPN public API (ไม่ต้องใช้ key), ซ่อนกล่องถ้าไม่มีข้อมูล |
| ดาวรุ่ง TOP 100 | `src/app/academy/page.tsx`, `_lib/prospects.ts`, `api/prospects.ts` | Gemini + Google Search grounding ต่อกลุ่มตำแหน่ง (GK10/DEF30/MID30/FWD30) + verify รอบ 2, เก็บ sources, ทีมงานแก้/ซ่อน/ลบได้ |
| ห้องข่าว `/admin` | `src/app/admin/page.tsx` | แท็บ: AI เขียนข่าว, ข่าวเข้า, เขียน/เรียบเรียง, เผยแพร่แล้ว, พนักงาน (admin) |
| สมาชิก / สิทธิ์ | `_lib/auth.ts`, `api/auth.ts`, `api/staff.ts`, `src/context/AuthContext.tsx` | JWT ใน HttpOnly cookie, PBKDF2, role: `admin` / `editor` / `member` |
| ล็อกอินด้วยบัญชี undes-studio | `api/auth.ts` (`findUndesUser`) | อ่านตาราง `users` ของ undes-studio (PBKDF2 รูปแบบเดียวกัน) แบบอ่านอย่างเดียว |
| โลโก้ | `public/logo.svg`, `src/app/icon.svg` | สีเขียว `#33FF00` บนกรอบ `#2f3437` |

**Cron:** `.github/workflows/ai-desk-cron.yml` เรียก `POST /api/ai-desk {"action":"run"}` ทุก 10 นาที ด้วย header `x-cron-secret` + AI ถูกปลุกเมื่อมีคนเข้าเว็บด้วย (`waitUntil`, ครั้งละ 1 ข่าว)

## 3. ตาราง D1 (สร้าง/migrate อัตโนมัติใน `functions/_lib/db.ts`)
`rmln_users`, `rmln_news` (มี `status` published/draft, `source_url`, `created_by` — `ai-desk` = AI), `rmln_comments`, `rmln_reactions`, `rmln_scouted_players` (เลิกใช้แล้ว), `rmln_translations`, `rmln_ai_jobs`, `rmln_settings` (รวม `jwt_secret` ที่สร้างอัตโนมัติ, `ai_enabled`, `ai_auto_publish`, `ai_last_run`), `rmln_prospects`
ตาราง `users` เป็นของ undes-studio — **ห้ามเขียน**

## 4. การตั้งค่า (ทำแล้ว)
Cloudflare Pages → rmln-news → Variables and Secrets (ใส่ได้เฉพาะ **Secret** เพราะ vars จัดการผ่าน wrangler.toml):
- `ADMIN_EMAILS` ✅ (อีเมลเจ้าของ) • `GEMINI_API_KEY` ✅ • `CRON_SECRET` ✅
- `JWT_SECRET` ไม่ต้องใส่ (ระบบสร้างเองเก็บใน D1)
- ไม่บังคับ: `GEMINI_MODEL` (ค่าเริ่มต้น `gemini-2.5-flash`)

## 5. ยังไม่ได้ยืนยัน / งานค้าง
1. **ยังไม่เคยทดสอบกับบริการจริง** (sandbox เข้า Gemini/ESPN/Sky/BBC/rmln-news.pages.dev ไม่ได้ ทดสอบด้วย mock เท่านั้น) — ต้องให้เจ้าของลอง:
   - `/admin` → AI เขียนข่าว → "รันตอนนี้"
   - `/academy` → "อัปเดตรายชื่อด้วย AI"
   - ถ้า error ให้ดูข้อความ เช่น `Gemini 400/403` (key ที่เจ้าของมีขึ้นต้นด้วย `AQ.` ไม่แน่ใจว่าใช้กับ Gemini API ได้ — key AI Studio ปกติขึ้นต้น `AIza`)
2. ยังไม่ยืนยันว่าเจ้าของใส่ `CRON_SECRET` ใน **GitHub Actions secrets** แล้วหรือยัง
3. ยังไม่ยืนยันว่าเจ้าของกด **Retry deployment** หลังใส่ secrets และล็อกอินเป็น admin ได้
4. ข้อจำกัดที่รู้: RSS ให้เนื้อหาสั้น, การแปล gtx เป็นภาษาเครื่อง, Gemini grounding กับ JSON schema ใช้ร่วมกันไม่ได้ (เลยแกะ JSON จากข้อความ)
5. แนะนำเจ้าของ: ช่วงแรกปิด "เผยแพร่ทันที" ของ AI เพื่อตรวจคุณภาพก่อน

## 6. วิธีทำงานต่อ
```bash
git clone https://github.com/thawatter877-code/rmln-football && cd rmln-football
npm ci && npm run build
printf 'ADMIN_EMAILS=admin@example.com\n' > .dev.vars   # JWT_SECRET ไม่จำเป็น
npx wrangler pages dev out --port 8788                  # API + D1 แบบ local
```
- Typecheck: `npx tsc --noEmit -p .` • ตรวจ Functions: `npx wrangler pages functions build --outdir /tmp/fn`
- ส่งงาน: commit บน branch → PR เข้า `main` → merge → Cloudflare deploy Production อัตโนมัติ (Preview สร้างจาก branch อื่น)
- ห้าม commit ค่า secret/อีเมลเจ้าของลง repo

## 7. ประวัติ PR
#1 ระบบหลักทั้งหมด • #2 JWT secret อัตโนมัติ • #3 สมัครที่ค้างครึ่งทาง • #4 ล็อกอินด้วยบัญชี undes-studio • #5 ดาวรุ่ง TOP 100 • #6 ลบข่าวปลอม/แก้วันที่/รูป • #7 โลโก้ใหม่
