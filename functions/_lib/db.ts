// Database and auto-healing schema for RMLN Football Platform (Cloudflare D1)

let schemaInitialized = false;

export async function ensureRmlnSchema(db: any) {
  if (schemaInitialized || !db) return;

  try {
    // 1. Users Table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        favorite_club TEXT DEFAULT 'Arsenal',
        coins INTEGER DEFAULT 198000,
        gems INTEGER DEFAULT 282,
        academy_level TEXT DEFAULT 'D4',
        squad_count INTEGER DEFAULT 23,
        max_squad INTEGER DEFAULT 50,
        role TEXT DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // 2. News Table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_news (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        category_label TEXT,
        league TEXT,
        club TEXT,
        image_url TEXT,
        views INTEGER DEFAULT 0,
        author TEXT DEFAULT 'กองบรรณาธิการ RMLN',
        is_breaking INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        published_at TEXT,
        read_time TEXT DEFAULT '3 นาที',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // 3. Comments Table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_comments (
        id TEXT PRIMARY KEY,
        news_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_club TEXT,
        content TEXT NOT NULL,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // 4. Reactions Table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_reactions (
        id TEXT PRIMARY KEY,
        news_id TEXT NOT NULL,
        user_id TEXT,
        reaction_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // 5. Scouted Players Table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rmln_scouted_players (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        nationality TEXT NOT NULL,
        position TEXT NOT NULL,
        age INTEGER NOT NULL,
        overall INTEGER NOT NULL,
        potential INTEGER NOT NULL,
        special_skill TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // 6. Check and seed initial news if rmln_news is empty
    const countCheck = await db.prepare("SELECT count(*) as total FROM rmln_news").first().catch(() => null);
    if (countCheck && countCheck.total === 0) {
      await seedInitialNews(db);
    }

    schemaInitialized = true;
  } catch (err: any) {
    console.error("Schema error:", err.message);
  }
}

async function seedInitialNews(db: any) {
  const seedItems = [
    {
      id: "news-1",
      slug: "arne-slot-liverpool-premier-league-leaders-tactics",
      title: "อาร์เน่อ สล็อต เผยปรัชญาพาลิเวอร์พูลยึดจ่าฝูงพรีเมียร์ลีก: การคุมจังหวะเกมและความสมดุลแดนกลาง",
      excerpt: "เจาะลึกแนวทางการทำทีมของกุนซือชาวดัตช์ที่พาหงส์แดงออกสตาร์ตฤดูกาลได้อย่างแข็งแกร่ง พร้อมสถิติครองบอลและเกมรับที่เหนียวแน่นที่สุดในลีก",
      content: `การเริ่มต้นยุคใหม่ของ ลิเวอร์พูล ภายใต้การคุมทัพของ อาร์เน่อ สล็อต กำลังดำเนินไปอย่างราบรื่นและน่าประทับใจ หลังพาทีมเก็บชัยชนะได้อย่างต่อเนื่องและรั้งตำแหน่งจ่าฝูงพรีเมียร์ลีกได้อย่างเหนียวแน่น

จุดเด่นสำคัญของลิเวอร์พูลในฤดูกาลนี้คือ 'การควบคุมจังหวะการเล่น' ที่สุขุมขึ้น แตกต่างจากยุค Gegenpressing เดิมที่เน้นความเร็วสูงแบบเต็มกำลัง สล็อตเลือกปรับโครงสร้างแดนกลางโดยใช้ ไรอัน กราเฟนแบร์ก ในบทบาทมิดฟิลด์เบอร์ 6 คอยเชื่อมเกมและชะลอจังหวะเกมรุกของคู่แข่งได้อย่างยอดเยี่ยม

"เราไม่ได้ต้องการวิ่งให้เร็วขึ้นเพียงอย่างเดียว แต่เราต้องการเลือกจังหวะที่ถูกต้องในการเข้าทำ เมื่อเราคุมพื้นที่แดนกลางได้ เกมรับของเราก็จะไม่ต้องรับภาระหนักจนเกินไป" อาร์เน่อ สล็อต ให้สัมภาษณ์หลังเกม

ด้วยผลต่างประตูได้เสียที่แข็งแกร่ง และการเสียประตูน้อยที่สุดในลีก ลิเวอร์พูลกำลังพิสูจน์ให้เห็นถึงความพร้อมในการขับเคี่ยวลุ้นแชมป์พรีเมียร์ลีกฤดูกาลนี้อย่างเต็มตัว`,
      category: "analysis",
      category_label: "บทวิเคราะห์แท็กติก",
      league: "Premier League",
      club: "Liverpool",
      image_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
      views: 52400,
      author: "กิตติพงษ์ เกียรติ์สุขุม (RMLN Editor)",
      is_breaking: 1,
      is_featured: 1,
      published_at: "15 นาทีที่แล้ว",
      read_time: "3 นาที"
    },
    {
      id: "news-2",
      slug: "florian-wirtz-transfer-arsenal-man-city-talks",
      title: "เปิดศึกแย่งตัว ฟลอเรียน เวียร์ตซ์: อาร์เซน่อล และ แมนเชสเตอร์ ซิตี้ เตรียมเปิดฉากเจรจาช่วงซัมเมอร์",
      excerpt: "จอมทัพทีมชาติเยอรมนีของไบเออร์ เลเวอร์คูเซ่น ตกเป็นเป้าหมายเบอร์หนึ่งของสองยักษ์ใหญ่พรีเมียร์ลีก ด้วยค่าตัวประเมินไม่ต่ำกว่า 130 ล้านยูโร",
      content: `ตลาดซื้อขายนักเตะช่วงซัมเมอร์นี้เตรียมระอุอีกครั้ง เมื่อสองทีมหัวแถวของพรีเมียร์ลีกอย่าง แมนเชสเตอร์ ซิตี้ และ อาร์เซน่อล ต่างแสดงความสนใจดึงตัว ฟลอเรียน เวียร์ตซ์ เพลย์เมกเกอร์ตัวเก่งของ ไบเออร์ เลเวอร์คูเซ่น มาร่วมทัพ

เวียร์ตซ์ วัย 21 ปี เป็นกำลังสำคัญในการพาทัพห้างขายยาคว้าแชมป์บุนเดสลีกาแบบไร้พ่ายในฤดูกาลที่ผ่านมา และยังคงรักษาฟอร์มการเล่นในระดับสูงได้อย่างต่อเนื่อง ทั้งการทำประตูและการสร้างสรรค์โอกาส

แหล่งข่าวใกล้ชิดระบุว่า เลเวอร์คูเซ่นตั้งค่าตัวของดาวเตะรายนี้ไว้ที่ไม่ต่ำกว่า 130 ล้านยูโร โดย แมนฯ ซิตี้ มองเขาเป็นตัวแทนระยะยาวของ เควิน เดอ บรอยน์ ขณะที่ มิเกล อาร์เตต้า ต้องการนำเวียร์ตซ์เข้ามาเพิ่มมิติเกมรุกในพื้นที่ Final Third ให้กับอาร์เซน่อล`,
      category: "transfer",
      category_label: "ตลาดซื้อขายนักเตะ",
      league: "Premier League & Bundesliga",
      club: "Arsenal / Man City",
      image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      views: 41800,
      author: "ธนภัทร วงศ์เจริญ (โต๊ะข่าวยุโรป)",
      is_breaking: 1,
      is_featured: 0,
      published_at: "35 นาทีที่แล้ว",
      read_time: "2 นาที"
    },
    {
      id: "news-3",
      slug: "real-madrid-bayern-munich-champions-league-mbappe",
      title: "เรอัล มาดริด เฉือน บาเยิร์น มิวนิค 2-1: คิลิยัน เอ็มบัปเป้ ซัดประตูชัยพาทีมลิ่วรอบ 8 ทีม แชมเปียนส์ลีก",
      excerpt: "เกมระดับ 5 ดาวที่ซานติอาโก้ เบร์นาเบว สู้กันอย่างเข้มข้น ก่อนที่เอ็มบัปเป้จะยิงประตูสำคัญในนาทีที่ 88 พาแชมป์เก่าผ่านเข้ารอบต่อไป",
      content: `ศึก ยูฟ่า แชมเปียนส์ลีก รอบ 16 ทีมสุดท้ายนัดชี้ชะตา ณ สนาม ซานติอาโก้ เบร์นาเบว จบลงด้วยชัยชนะอันน่าทึ่งของเจ้าถิ่น เรอัล มาดริด เหนือ บาเยิร์น มิวนิค ด้วยสกอร์ 2-1 (สกอร์รวม 4-3)

บาเยิร์นเป็นฝ่ายออกนำก่อนจากลูกยิงของ แฮร์รี่ เคน ในนาทีที่ 32 ก่อนที่ วินิซิอุส จูเนียร์ จะตีเสมอให้ราชันชุดขาวได้ในนาทีที่ 67

เกมทำท่าว่าจะต้องต่อเวลาพิเศษ แต่นาทีที่ 88 คิลิยัน เอ็มบัปเป้ ได้จังหวะหลุดเดี่ยวจากการจ่ายบอลทะลุช่องของ จู๊ด เบลลิงแฮม ก่อนจะชิพบอลข้ามตัว มานูเอล นอยเออร์ เข้าไปอย่างเยือกเย็น ส่งผลให้ เรอัล มาดริด คว้าตั๋วเข้าสู่รอบก่อนรองชนะเลิศได้สำเร็จ`,
      category: "match_report",
      category_label: "รายงานการแข่งขัน",
      league: "UEFA Champions League",
      club: "Real Madrid vs Bayern Munich",
      image_url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
      views: 63100,
      author: "ศรายุทธ เลิศพานิช (ผู้สื่อข่าวฟุตบอลยุโรป)",
      is_breaking: 0,
      is_featured: 0,
      published_at: "3 ชั่วโมงที่แล้ว",
      read_time: "4 นาที"
    }
  ];

  for (const item of seedItems) {
    await db.prepare(`
      INSERT OR IGNORE INTO rmln_news 
      (id, slug, title, excerpt, content, category, category_label, league, club, image_url, views, author, is_breaking, is_featured, published_at, read_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      item.id, item.slug, item.title, item.excerpt, item.content, item.category, item.category_label,
      item.league, item.club, item.image_url, item.views, item.author, item.is_breaking, item.is_featured,
      item.published_at, item.read_time
    ).run().catch(() => {});
  }
}
