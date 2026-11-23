export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'transfer' | 'match_report' | 'analysis' | 'breaking' | 'feature';
  categoryLabel: string;
  league: string;
  club: string;
  imageUrl: string;
  views: number;
  author: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  publishedAt: string;
  readTime: string;
  reactions: {
    fire: number;
    magic: number;
    clap: number;
  };
  comments: NewsComment[];
}

export interface NewsComment {
  id: string;
  userId: string;
  userName: string;
  userClub: string;
  content: string;
  likesCount: number;
  createdAt: string;
}

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    slug: "champions-league-thriller-90-min-magic",
    title: "มหัศจรรย์นาที 90+4! พลิกนรกคว้าตั๋วรอบ 8 ทีม UCL เกมระดับ 5 ดาวที่โลกต้องจารึก",
    excerpt: "ดราม่าช่วงทดเจ็บสุดระทึก เมื่อลูกยิงไกลเสียบสามเหลี่ยมดับฝันเจ้าบ้าน กลายเป็นหนึ่งในค่ำคืนที่บ้าคลั่งที่สุดในประวัติศาสตร์ฟุตบอลยุโรป",
    content: `เสียงนกหวีดหมดเวลาที่ดังกึกก้องไปทั่วสนาม เป็นบทสรุปของ 90 นาทีที่เต็มไปด้วยมนต์สะกดของเกมลูกหนังอย่างแท้จริง

ตลอดทั้งเกม ทั้งสองทีมเปิดเกมแลกกันหมัดต่อหมัด แท็กติกการเพรสซิ่งแดนบนที่บีบพื้นที่จนหายใจไม่ทั่วท้อง ทำให้แฟนบอลลุ้นจนแทบนั่งไม่ติดเก้าอี้ 

จุดเปลี่ยนสำคัญเกิดขึ้นในช่วงทดเวลาบาดเจ็บนาทีที่ 90+4 เมื่อบอลถูกเปิดโด่งเข้าไปในกรอบเขตโทษ ก่อนจะถูกโหม่งสกัดออกมาเข้าทางปืน แดนกลางตัวเก่งตะบันด้วยหลังเท้า บอลพุ่งแสกหน้าผู้รักษาประตูเสียบสามเหลี่ยมบนชนิดไร้การป้องกัน

"นี่คือเหตุผลที่พวกเรารักฟุตบอล ไม่มีอะไรการันตีจนกว่าเสียงนกหวีดจะดัง" กุนซือผู้ชนะให้สัมภาษณ์หลังเกมด้วยรอยยิ้มปนน้ำตา`,
    category: "match_report",
    categoryLabel: "รายงานการแข่งขัน",
    league: "UEFA Champions League",
    club: "Real Madrid vs Man City",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    views: 48250,
    author: "กองบรรณาธิการ RMLN",
    isBreaking: true,
    isFeatured: true,
    publishedAt: "10 นาทีที่แล้ว",
    readTime: "3 นาที",
    reactions: { fire: 1420, magic: 2890, clap: 640 },
    comments: [
      {
        id: "c-1",
        userId: "u-arsenal",
        userName: "GunnerSpells",
        userClub: "Arsenal",
        content: "ลูกยิงทดเจ็บนี่คือมนต์สะกดของจริง ใครดูสดคือคุ้มค่าตื่นมาก!",
        likesCount: 142,
        createdAt: "5 นาทีที่แล้ว"
      },
      {
        id: "c-2",
        userId: "u-madrid",
        userName: "HalaMagic",
        userClub: "Real Madrid",
        content: "DNA แชมเปียนส์ลีกไม่มีวันตาย 90 นาทีไม่เคยยอมแพ้",
        likesCount: 98,
        createdAt: "8 นาทีที่แล้ว"
      }
    ]
  },
  {
    id: "news-2",
    slug: "here-we-go-mega-transfer-record",
    title: "HERE WE GO! สรุปดีลประวัติศาสตร์ 120 ล้านปอนด์ ย้ายข้ามลีกสะเทือนยุโรป",
    excerpt: "การเจรจามาราธอนจบลงแล้ว กองหน้าวัย 22 ปีเซ็นสัญญายาว 6 ปี ตรวจร่างกายผ่านฉลุย เตรียมเปิดตัวทางการสัปดาห์นี้",
    content: `ดีลที่แฟนบอลทั่วโลกจับตามองมาตลอดซัมเมอร์ได้บทสรุปอย่างเป็นทางการ หลังการเจรจาระหว่างผู้บริหารทั้งสองสโมสรล่วงเลยมาจนถึงช่วงดึก

ค่าตัวสุทธิอยู่ที่ 100 ล้านปอนด์ พร้อมออปชั่นแอดออนอีก 20 ล้านปอนด์ ทำให้เขากลายเป็นนักเตะค่าตัวแพงที่สุดในประวัติศาสตร์ของสโมสรใหม่

สัญญาจะยาวถึงปี 2031 พร้อมสวมเสื้อหมายเลข 9 คนใหม่`,
    category: "transfer",
    categoryLabel: "ตลาดซื้อขายนักเตะ",
    league: "Premier League",
    club: "Arsenal / Barcelona",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    views: 35120,
    author: "ฟาบริซิโอ RMLN",
    isBreaking: true,
    isFeatured: false,
    publishedAt: "25 นาทีที่แล้ว",
    readTime: "2 นาที",
    reactions: { fire: 2150, magic: 1840, clap: 890 },
    comments: [
      {
        id: "c-3",
        userId: "u-liverpool",
        userName: "TheKopTactics",
        userClub: "Liverpool",
        content: "ราคานี้ถ้าฟอร์มไม่ปังมีกดดันหนักแน่นอน รอดูผลงานในสนาม",
        likesCount: 54,
        createdAt: "12 นาทีที่แล้ว"
      }
    ]
  },
  {
    id: "news-3",
    slug: "tactical-sorcery-art-of-high-press",
    title: "ผ่าแท็กติก 'ร่ายมนต์บีบพื้นที่': ถอดรหัสแผนเพรสซิ่งไร้ช่องว่างที่กำลังครองวงการลูกหนัง",
    excerpt: "เจาะลึกการจัดโครงสร้าง 3-2-4-1 และทริกเกอร์การบีบแย่งบอลภายใน 5 วินาทีของยอดโค้ชยุคใหม่",
    content: `ในโลกฟุตบอลยุคปัจจุบัน ความเร็วไม่ได้วัดกันแค่ที่ฝีเท้าของปีกริมเส้น แต่วัดกันที่ 'ความเร็วทางความคิด' และการเคลื่อนที่แบบ Synchronized

เมื่อเสียการครองบอล โซนแนวรุกจะปิดช่องส่งบอลทะลุช่องในแนวลึกทันที บีบให้คู่แข่งต้องคืนหลังหรือเตะทิ้งยาว...`,
    category: "analysis",
    categoryLabel: "บทวิเคราะห์เจาะลึก",
    league: "World Football",
    club: "Tactical Hub",
    imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    views: 19400,
    author: "อาจารย์ลูกหนัง RMLN",
    isBreaking: false,
    isFeatured: false,
    publishedAt: "2 ชั่วโมงที่แล้ว",
    readTime: "5 นาที",
    reactions: { fire: 890, magic: 3100, clap: 1200 },
    comments: []
  },
  {
    id: "news-4",
    slug: "el-clasico-preview-battle-of-giants",
    title: "พรีวิวก่อนศึกเอล กลาซิโก้: สถิติ, ผู้เล่นบาดเจ็บ และกุญแจสำคัญสู่ 3 แต้มชี้ชะตาแชมป์",
    excerpt: "สงครามศักดิ์ศรีสองมหาอำนาจสเปนที่มีบัลลังก์จ่าฝูงเป็นเดิมพัน ทุกมิติที่คุณต้องรู้ก่อนคิกออฟคืนวันเสาร์นี้",
    content: `ทุกครั้งที่สองทีมนี้พบกัน ไม่เคยมีคำว่าเกมกระชับมิตร แต้มบนตารางห่างกันเพียง 2 คะแนน ทำให้เกมนี้มีค่าเท่ากับ 6 แต้มเต็มในการลุ้นแชมป์ลีก...`,
    category: "match_report",
    categoryLabel: "พรีวิวฟุตบอล",
    league: "La Liga",
    club: "Real Madrid vs Barcelona",
    imageUrl: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80",
    views: 28900,
    author: "สเปนอินไซด์ RMLN",
    isBreaking: false,
    isFeatured: false,
    publishedAt: "4 ชั่วโมงที่แล้ว",
    readTime: "4 นาที",
    reactions: { fire: 1100, magic: 1450, clap: 520 },
    comments: []
  },
  {
    id: "news-5",
    slug: "thai-league-rising-stars-abroad",
    title: "แข้งไทยโกอินเตอร์! สรุปฟอร์มสตาร์ช้างศึกในเจลีกและยุโรปสัปดาห์ล่าสุด",
    excerpt: "โชว์แอสซิสต์สุดเหนือชั้น พร้อมเรตติ้งติดท็อป 3 ประจำสัปดาห์ พิสูจน์มาตรฐานฟุตบอลไทยในเวทีสากล",
    content: `ฟอร์มการเล่นของนักเตะไทยในลีกต่างแดนยังคงสร้างความประทับใจต่อเนื่อง การจ่ายบอลทะลุช่องที่แม่นยำและการอ่านเกมช่วยพาทีมเก็บชัยชนะสำคัญ...`,
    category: "feature",
    categoryLabel: "ฟุตบอลไทย & ทีมชาติ",
    league: "Thai League & Abroad",
    club: "Thailand National Team",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    views: 22100,
    author: "โต๊ะบอลไทย RMLN",
    isBreaking: false,
    isFeatured: false,
    publishedAt: "6 ชั่วโมงที่แล้ว",
    readTime: "3 นาที",
    reactions: { fire: 1540, magic: 2200, clap: 980 },
    comments: []
  }
];

export const MOCK_FIXTURES = [
  {
    id: "f1",
    league: "Premier League",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    homeScore: 3,
    awayScore: 1,
    status: "FT",
    date: "จบการแข่งขัน"
  },
  {
    id: "f2",
    league: "Premier League",
    homeTeam: "Man City",
    awayTeam: "Liverpool",
    homeScore: 2,
    awayScore: 2,
    status: "FT",
    date: "จบการแข่งขัน"
  },
  {
    id: "f3",
    league: "UEFA Champions League",
    homeTeam: "Real Madrid",
    awayTeam: "Bayern Munich",
    homeScore: null,
    awayScore: null,
    status: "LIVE",
    date: "03:00 น."
  },
  {
    id: "f4",
    league: "La Liga",
    homeTeam: "Barcelona",
    awayTeam: "Atletico Madrid",
    homeScore: null,
    awayScore: null,
    status: "UPCOMING",
    date: "พรุ่งนี้ 02:00 น."
  }
];
