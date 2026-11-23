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
    title: "มหัศจรรย์นาที 90+4! พลิกสถานการณ์คว้าตั๋วรอบ 8 ทีม UCL ในค่ำคืนประวัติศาสตร์",
    excerpt: "ช่วงทดเจ็บสุดระทึก เมื่อลูกยิงไกลเสียบสามเหลี่ยมตัดสินชัยชนะ กลายเป็นหนึ่งในเกมระดับมาสเตอร์พีซของฟุตบอลยุโรป",
    content: `เสียงนกหวีดหมดเวลาที่ดังกึกก้องไปทั่วสนาม เป็นบทสรุปของ 90 นาทีที่เต็มไปด้วยมนต์สะกดของเกมลูกหนังอย่างแท้จริง

ตลอดทั้งเกม ทั้งสองทีมเปิดเกมแลกกันหมัดต่อหมัด แท็กติกการเพรสซิ่งแดนบนที่บีบพื้นที่จนคู่แข่งแทบไม่มีเวลาคิด ทำให้รูปเกมดำเนินไปอย่างเข้มข้น

จุดเปลี่ยนสำคัญเกิดขึ้นในช่วงทดเวลาบาดเจ็บนาทีที่ 90+4 เมื่อบอลถูกเปิดโด่งเข้าไปในกรอบเขตโทษ ก่อนจะถูกโหม่งสกัดออกมาเข้าทางปืน แดนกลางตัวเก่งตะบันด้วยหลังเท้า บอลพุ่งแสกหน้าผู้รักษาประตูเสียบสามเหลี่ยมบนอย่างสมบูรณ์แบบ

"นี่คือเหตุผลที่พวกเรารักฟุตบอล ไม่มีอะไรการันตีผลการแข่งขันจนกว่าเสียงนกหวีดจะดัง" กุนซือผู้ชนะกล่าวในงานแถลงข่าว`,
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
        content: "ลูกยิงทดเจ็บนี้คือคุณภาพระดับโลก จังหวะและทิศทางสมบูรณ์แบบมาก",
        likesCount: 142,
        createdAt: "5 นาทีที่แล้ว"
      },
      {
        id: "c-2",
        userId: "u-madrid",
        userName: "HalaMagic",
        userClub: "Real Madrid",
        content: "เกมในระดับยุโรปไม่มีคำว่ายอมแพ้จนกว่าจะครบ 90 นาที",
        likesCount: 98,
        createdAt: "8 นาทีที่แล้ว"
      }
    ]
  },
  {
    id: "news-2",
    slug: "here-we-go-mega-transfer-record",
    title: "สรุปดีลประวัติศาสตร์ 120 ล้านปอนด์ ย้ายข้ามลีกทางการ สัญญายาว 6 ปี",
    excerpt: "การเจรจามาราธอนสิ้นสุดลง กองหน้าวัย 22 ปีผ่านขั้นตอนการตรวจร่างกาย เตรียมเปิดตัวอย่างเป็นทางการในสัปดาห์นี้",
    content: `ดีลสำคัญที่ได้รับความสนใจมาตลอดช่วงเปิดตลาดซื้อขายได้บทสรุปเรียบร้อยแล้ว หลังผู้บริหารทั้งสองสโมสรบรรลุข้อตกลงร่วมกัน

ค่าตัวรวมอยู่ที่ 100 ล้านปอนด์ พร้อมเงื่อนไขส่วนเสริมอีก 20 ล้านปอนด์ ทำให้เขากลายเป็นผู้เล่นที่มีค่าตัวสูงที่สุดในประวัติศาสตร์ของสโมสร

สัญญาจะมีผลจนถึงปี 2031 พร้อมสวมเสื้อหมายเลข 9 ในฤดูกาลใหม่`,
    category: "transfer",
    categoryLabel: "ตลาดซื้อขายนักเตะ",
    league: "Premier League",
    club: "Arsenal / Barcelona",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    views: 35120,
    author: "โต๊ะข่าวซื้อขาย RMLN",
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
        content: "เป็นการเสริมทัพที่น่าจับตามองในฤดูกาลนี้ รอดูระบบการเล่นใหม่",
        likesCount: 54,
        createdAt: "12 นาทีที่แล้ว"
      }
    ]
  },
  {
    id: "news-3",
    slug: "tactical-sorcery-art-of-high-press",
    title: "ถอดรหัสแท็กติกการเพรสซิ่งสูง: การบีบพื้นที่และเปลี่ยนจังหวะเกมยุคใหม่",
    excerpt: "วิเคราะห์โครงสร้างแผนการเล่น 3-2-4-1 และเงื่อนไขการแย่งบอลกลับคืนภายใน 5 วินาทีของยอดโค้ชชั้นนำ",
    content: `ในระบบฟุตบอลยุคปัจจุบัน ความเร็วในการตัดสินใจและการประสานงานร่วมกันแบบเป็นระบบมีความสำคัญอย่างยิ่ง

เมื่อเสียการครองบอล โซนแนวรุกจะปิดช่องทางการส่งบอลในแนวลึกทันที บีบให้คู่แข่งต้องเปิดบอลยาว ซึ่งช่วยเพิ่มโอกาสในการเก็บบอลจังหวะสอง`,
    category: "analysis",
    categoryLabel: "บทวิเคราะห์แท็กติก",
    league: "World Football",
    club: "Tactical Hub",
    imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    views: 19400,
    author: "ฝ่ายวิเคราะห์ข้อมูล RMLN",
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
    title: "พรีวิวศึกเอล กลาซิโก้: วิเคราะห์สถิติ สภาพความพร้อม และแท็กติกชี้ชะตาเกม",
    excerpt: "การพบกันของสองสโมสรใหญ่แห่งสเปนที่มีคะแนนบนตารางเบียดกันอย่างสูสี ข้อมูลสำคัญก่อนเกมคิกออฟสัปดาห์นี้",
    content: `ทั้งสองทีมลงสนามด้วยความพร้อมของผู้เล่นหลัก คะแนนบนตารางที่ห่างกันเพียงเล็กน้อยทำให้เกมนี้มีความสำคัญอย่างยิ่งต่อการลุ้นแชมป์ในระยะยาว`,
    category: "match_report",
    categoryLabel: "พรีวิวการแข่งขัน",
    league: "La Liga",
    club: "Real Madrid vs Barcelona",
    imageUrl: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80",
    views: 28900,
    author: "ผู้สื่อข่าวฟุตบอลสเปน RMLN",
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
    title: "รายงานผลงานนักเตะไทยในลีกต่างแดน: สรุปสถิติและคะแนนความสามารถประจำสัปดาห์",
    excerpt: "ฟอร์มการเล่นของแข้งทีมชาติไทยในเจลีกและลีกยุโรปกับการสร้างสรรค์โอกาสและผลงานในสนาม",
    content: `ผู้เล่นไทยในลีกต่างประเทศยังคงรักษามาตรฐานการเล่นได้อย่างสม่ำเสมอ การอ่านเกมและการจ่ายบอลจังหวะสำคัญช่วยขับเคลื่อนเกมรุกของทีมได้อย่างมีประสิทธิภาพ`,
    category: "feature",
    categoryLabel: "ฟุตบอลไทยและทีมชาติ",
    league: "Thai League & Abroad",
    club: "Thailand National Team",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    views: 22100,
    author: "ฝ่ายข่าวฟุตบอลไทย RMLN",
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
