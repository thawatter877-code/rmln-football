# RMLN - ร่ายมนต์ลูกหนัง (THE 90-MINUTE FOOTBALL MAGIC)

แพลตฟอร์มสำนักข่าวและมีเดียฟุตบอลระดับโลก พัฒนาด้วย **Next.js 16 (App Router / Static Export)**, **Tailwind CSS v4** และพร้อมสำหรับ **Cloudflare Pages + Cloudflare D1 Database**

---

## ⚽ จุดเด่นและฟีเจอร์หลัก (Key Features)

1. **สำนักข่าวฟุตบอลครบวงจร (Football Media & News Hub):**
   - 90' Breaking Ticker พาดหัวข่าวด่วนแบบเรียลไทม์
   - ข่าวเด่น ข่าวเจาะลึก ทุกลีกดัง (พรีเมียร์ลีก, ยูฟ่า แชมเปียนส์ลีก, ลาลีกา, บอลไทย ฯลฯ)
   - ตลาดซื้อขายนักเตะ (Transfer Market / Here We Go)
   - คอลัมน์แท็กติกและบทวิเคราะห์เชิงลึก
2. **ระบบสมาชิกและคอมมูนิตี้แฟนบอล (Independent Auth & Comments):**
   - สมัครสมาชิกแยกอิสระ พร้อมเลือกสโมสรที่ชอบ (Favorite Club Badge)
   - แสดงความคิดเห็นแลกเปลี่ยนมุมมองใต้ทุกข่าว
   - กด Reaction ให้กำลังใจ (🔥 ไฟลุก, ✨ ร่ายมนต์, 👏 ปรบมือ)
3. **มินิเกมแฟนบอล: อคาเดมี่เยาวชน (Youth Academy Mini-Game):**
   - ระบบสุ่มสัญชาติและตำแหน่งนักเตะ (GK, ตัวรับ, ตัวกลาง, ตัวรุก)
   - ปั้นดาวรุ่งและตั้งชื่อนักเตะเข้าสู่สโมสรของคุณ
   - สะสมเหรียญ (Coins) และเพชร (Gems)

---

## 🚀 วิธีเชื่อมต่อและ Deploy บน Cloudflare Pages

### 1. เชื่อมต่อ Git Repository
1. เข้าไปที่แดชบอร์ด **[Cloudflare Dashboard](https://dash.cloudflare.com/)**
2. เลือกเมนู **Workers & Pages** > **Create application** > แท็บ **Pages**
3. เลือก **Connect to Git** และเลือก Repository: `thawatter877-code/rmln-football`

### 2. ตั้งค่าการ Build (Build Settings)
- **Framework preset:** `Next.js (Static Export)` หรือ `None`
- **Build command:** `npm run build`
- **Build output directory:** `out`
- **Root directory:** *(ปล่อยว่างไว้)*
- **Node.js version (Environment Variable):**
  - ใส่ Environment Variable: `NODE_VERSION` = `20` หรือ `22`

### 3. ผูกฐานข้อมูล Cloudflare D1 (Optional - สำหรับข้อมูลถาวร)
1. ใน Cloudflare Dashboard ไปที่ **Workers & Pages** > **D1 SQL Database** > สร้างฐานข้อมูลชื่อ `rmln_football_db`
2. รัน SQL Schema: นำโค้ดในไฟล์ `schema.sql` ไป Execute ใน Console ของ D1
3. ไปที่หน้าการตั้งค่า Pages ของโปรเจกต์ `rmln-football` > **Settings** > **Functions** > **D1 database bindings**
   - Variable name: `DB`
   - D1 Database: เลือก `rmln_football_db`

### 4. ตั้งค่า Environment Variables (จำเป็น)
ไปที่ **Settings** > **Variables and Secrets** ของโปรเจกต์ Pages (ทั้ง Production และ Preview):

| ชื่อ | ประเภท | ค่า |
|---|---|---|
| `JWT_SECRET` | Secret (Encrypt) | สตริงสุ่มยาว 32 ตัวขึ้นไป เช่นผลจาก `openssl rand -hex 32` |
| `ADMIN_EMAILS` | Text | อีเมลผู้ดูแลระบบ คั่นด้วยจุลภาค เช่น `you@example.com` |

- ถ้าไม่มี `JWT_SECRET` ระบบสมัครสมาชิก/ล็อกอินจะใช้งานไม่ได้
- บัญชีที่สมัครหรือล็อกอินด้วยอีเมลใน `ADMIN_EMAILS` จะได้สิทธิ์ admin (เข้า `/admin` เพื่อเขียน/ลบข่าว)
- หลังเปลี่ยนค่าต้อง **Redeploy** ใหม่หนึ่งครั้ง
- ผู้ใช้ที่เป็น admin ในระบบ undes-studio (ตาราง `users` ใน D1 เดียวกัน) จะได้สิทธิ์ admin ใน RMLN อัตโนมัติเมื่อสมัคร/ล็อกอินด้วยอีเมลเดียวกัน

### 5. ห้องข่าวและพนักงาน (`/admin`)
- **ข่าวเข้า**: ข่าวจริงจาก Sky Sports / BBC Sport แปลเป็นไทยอัตโนมัติ (แคชคำแปลไว้ในตาราง `rmln_translations`)
- **เรียบเรียง**: พนักงานตรวจคำแปล เขียนเพิ่ม แล้วเผยแพร่เป็นข่าว RMLN (ข่าวสดตัวเดิมจะถูกซ่อนจากหน้าแรกอัตโนมัติ)
- **พนักงาน** (admin): ให้พนักงานสมัครสมาชิกก่อน แล้วค้นหาและตั้งเป็น "บรรณาธิการ" (editor)
- ผลบอล/ตารางคะแนนจริงมาจาก ESPN public API (`/api/football`)

---

## 🛠️ ทดสอบบนเครื่อง Local

```bash
npm install
npm run build
printf 'JWT_SECRET=local-dev-secret-change-me-0123456789abcdef\nADMIN_EMAILS=you@example.com\n' > .dev.vars
npx wrangler pages dev out
```

เปิดดูที่ `http://localhost:8788` (ต้องใช้ `wrangler pages dev` เพื่อให้ API และ D1 ทำงาน, `npm run dev` จะเห็นแค่หน้าเว็บโดยไม่มีข้อมูล)
