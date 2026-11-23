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

---

## 🛠️ ทดสอบบนเครื่อง Local

```bash
npm install
npm run dev
```

เปิดดูที่ `http://localhost:3000`
