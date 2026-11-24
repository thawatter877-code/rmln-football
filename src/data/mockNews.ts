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
    slug: "arne-slot-liverpool-premier-league-leaders-tactics",
    title: "อาร์เน่อ สล็อต เผยปรัชญาพาลิเวอร์พูลยึดจ่าฝูงพรีเมียร์ลีก: การคุมจังหวะเกมและความสมดุลแดนกลาง",
    excerpt: "เจาะลึกแนวทางการทำทีมของกุนซือชาวดัตช์ที่พาหงส์แดงออกสตาร์ตฤดูกาลได้อย่างแข็งแกร่ง พร้อมสถิติครองบอลและเกมรับที่เหนียวแน่นที่สุดในลีก",
    content: `การเริ่มต้นยุคใหม่ของ ลิเวอร์พูล ภายใต้การคุมทัพของ อาร์เน่อ สล็อต กำลังดำเนินไปอย่างราบรื่นและน่าประทับใจ หลังพาทีมเก็บชัยชนะได้อย่างต่อเนื่องและรั้งตำแหน่งจ่าฝูงพรีเมียร์ลีกได้อย่างเหนียวแน่น

จุดเด่นสำคัญของลิเวอร์พูลในฤดูกาลนี้คือ 'การควบคุมจังหวะการเล่น' ที่สุขุมขึ้น แตกต่างจากยุค Gegenpressing เดิมที่เน้นความเร็วสูงแบบเต็มกำลัง สล็อตเลือกปรับโครงสร้างแดนกลางโดยใช้ ไรอัน กราเฟนแบร์ก ในบทบาทมิดฟิลด์เบอร์ 6 คอยเชื่อมเกมและชะลอจังหวะเกมรุกของคู่แข่งได้อย่างยอดเยี่ยม

"เราไม่ได้ต้องการวิ่งให้เร็วขึ้นเพียงอย่างเดียว แต่เราต้องการเลือกจังหวะที่ถูกต้องในการเข้าทำ เมื่อเราคุมพื้นที่แดนกลางได้ เกมรับของเราก็จะไม่ต้องรับภาระหนักจนเกินไป" อาร์เน่อ สล็อต ให้สัมภาษณ์หลังเกม

ด้วยผลต่างประตูได้เสียที่แข็งแกร่ง และการเสียประตูน้อยที่สุดในลีก ลิเวอร์พูลกำลังพิสูจน์ให้เห็นถึงความพร้อมในการขับเคี่ยวลุ้นแชมป์พรีเมียร์ลีกฤดูกาลนี้อย่างเต็มตัว`,
    category: "analysis",
    categoryLabel: "บทวิเคราะห์แท็กติก",
    league: "Premier League",
    club: "Liverpool",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    views: 52400,
    author: "กิตติพงษ์ เกียรติ์สุขุม (RMLN Editor)",
    isBreaking: true,
    isFeatured: true,
    publishedAt: "15 นาทีที่แล้ว",
    readTime: "3 นาที",
    reactions: { fire: 1840, magic: 3120, clap: 890 },
    comments: [
      {
        id: "c-1",
        userId: "u-kop",
        userName: "KopiteBKK",
        userClub: "Liverpool",
        content: "กราเฟนแบร์กเล่นตำแหน่งนี้คือการค้นพบที่ดีที่สุดของสล็อตจริงๆ นิ่งและแกะเพรสได้ดีมาก",
        likesCount: 168,
        createdAt: "10 นาทีที่แล้ว"
      },
      {
        id: "c-2",
        userId: "u-tactics",
        userName: "TacticsZone",
        userClub: "Arsenal",
        content: "เกมรับของลิเวอร์พูลปีนี้เหนียวขึ้นชัดเจน แดนกลางไม่เปิดพื้นที่ว่างให้คู่แข่งเหมือนปีก่อน",
        likesCount: 112,
        createdAt: "12 นาทีที่แล้ว"
      }
    ]
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
    categoryLabel: "ตลาดซื้อขายนักเตะ",
    league: "Premier League & Bundesliga",
    club: "Arsenal / Man City",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    views: 41800,
    author: "ธนภัทร วงศ์เจริญ (โต๊ะข่าวยุโรป)",
    isBreaking: true,
    isFeatured: false,
    publishedAt: "35 นาทีที่แล้ว",
    readTime: "2 นาที",
    reactions: { fire: 2450, magic: 1980, clap: 920 },
    comments: [
      {
        id: "c-3",
        userId: "u-city",
        userName: "CitizenBlue",
        userClub: "Man City",
        content: "ถ้าได้เวียร์ตซ์มาแทนเดอบรอยน์จริง แนวรุกซิตี้จะลงตัวไปอีกหลายปี",
        likesCount: 78,
        createdAt: "20 นาทีที่แล้ว"
      }
    ]
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
    categoryLabel: "รายงานการแข่งขัน",
    league: "UEFA Champions League",
    club: "Real Madrid vs Bayern Munich",
    imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    views: 63100,
    author: "ศรายุทธ เลิศพานิช (ผู้สื่อข่าวฟุตบอลยุโรป)",
    isBreaking: false,
    isFeatured: false,
    publishedAt: "3 ชั่วโมงที่แล้ว",
    readTime: "4 นาที",
    reactions: { fire: 3100, magic: 4200, clap: 1450 },
    comments: []
  },
  {
    id: "news-4",
    slug: "inverted-full-back-tactical-evolution-pep-arteta",
    title: "วิวัฒนาการ Inverted Full-back: นิยามใหม่ของฟูลแบ็กยุคเป๊ป กวาร์ดิโอล่า และมิเกล อาร์เตต้า",
    excerpt: "ทำไมการขยับฟูลแบ็กเข้าสู่แดนกลางถึงกลายเป็นกลยุทธ์สำคัญในการควบคุมพื้นที่และป้องกันเกมโต้กลับเร็วในฟุตบอลสมัยใหม่",
    content: `ในอดีต หน้าที่หลักของฟูลแบ็กคือการเติมเกมรุกริมเส้นและการเปิดบอลจากริมกรอบเขตโทษ แต่ในยุคปัจจุบัน แท็กติก Inverted Full-back ได้เปลี่ยนโฉมบทบาทของตำแหน่งนี้ไปอย่างสิ้นเชิง

การขยับฟูลแบ็กเข้ามาเล่นคู่กับมิดฟิลด์ตัวรับ (Double Pivot) ในขณะที่ทีมเป็นฝ่ายครองบอล มีประโยชน์เชิงกลยุทธ์หลายประการ:
1. สร้างความได้เปรียบเชิงตัวเลขในแดนกลาง (Overload 3v2 หรือ 4v3)
2. ป้องกันการโต้กลับเร็วตรงจุดกึ่งกลางสนามทันทีที่เสียบอล (Counter-pressing Structure)
3. เปิดพื้นที่ให้ปีกริมเส้นสามารถเล่นแบบ 1 ต่อ 1 กับกองหลังคู่แข่งได้อย่างมีประสิทธิภาพ

ผู้เล่นอย่าง ริโก้ ลูอิส ของแมนเชสเตอร์ ซิตี้ และ เยอร์เรียน ทิมเบอร์ ของอาร์เซน่อล คือตัวอย่างที่ชัดเจนของผู้เล่นที่มีความฉลาดทางแท็กติก สามารถเล่นได้ทั้งสองบทบาทในเกมเดียว`,
    category: "analysis",
    categoryLabel: "บทวิเคราะห์แท็กติก",
    league: "Premier League",
    club: "Tactical Hub",
    imageUrl: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80",
    views: 29800,
    author: "อาจารย์ลูกหนัง RMLN",
    isBreaking: false,
    isFeatured: false,
    publishedAt: "5 ชั่วโมงที่แล้ว",
    readTime: "5 นาที",
    reactions: { fire: 940, magic: 3800, clap: 1280 },
    comments: []
  },
  {
    id: "news-5",
    slug: "thailand-national-team-asian-cup-qualifiers-squad-ishii",
    title: "มาซาทาดะ อิชิอิ ประกาศรายชื่อ 23 แข้งทีมชาติไทย ลุยศึกฟุตบอลเอเชียน คัพ 2027 รอบคัดเลือก",
    excerpt: "ทัพช้างศึกเรียกตัวหลักจากเจลีกและยุโรปครบครัน พร้อมดันดาวรุ่งฟอร์มแรงจากไทยลีกเตรียมบู๊นัดสำคัญ",
    content: `สมาคมกีฬาฟุตบอลแห่งประเทศไทยฯ โดย มาซาทาดะ อิชิอิ หัวหน้าผู้ฝึกสอนทีมชาติไทย ประกาศรายชื่อ 23 ผู้เล่นชุดเตรียมลงแข่งขันฟุตบอล เอเชียน คัพ 2027 รอบคัดเลือก

แกนหลักของทีมยังคงนำทัพโดย ธีราทร บุญมาทัน, ชนาธิป สรงกระสินธ์ และ สุภโชค สารชาติ ที่กำลังทำผลงานได้ดีในเจลีก ประเทศญี่ปุ่น พร้อมทั้ง นิโคลัส มิคเกลสัน แบ็กขวาจากลีกเดนมาร์ก

นอกจากนี้ อิชิอิ ยังได้เรียกตัวผู้เล่นดาวรุ่งฟอร์มโดดเด่นจากไทยลีกเข้ามาเสริมความสดในแดนกลาง โดยทีมชาติไทยมีกำหนดการเข้าแคมป์ฝึกซ้อมในสัปดาห์หน้าก่อนออกเดินทางไปแข่งขัน`,
    category: "feature",
    categoryLabel: "ฟุตบอลไทยและทีมชาติ",
    league: "Thai League & National Teams",
    club: "Thailand National Team",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    views: 34500,
    author: "ฝ่ายข่าวฟุตบอลไทย RMLN",
    isBreaking: false,
    isFeatured: false,
    publishedAt: "7 ชั่วโมงที่แล้ว",
    readTime: "3 นาที",
    reactions: { fire: 1890, magic: 2450, clap: 1150 },
    comments: []
  }
];

export const MOCK_FIXTURES = [
  {
    id: "f1",
    league: "Premier League",
    homeTeam: "Liverpool",
    awayTeam: "Aston Villa",
    homeScore: 2,
    awayScore: 0,
    status: "FT",
    date: "จบการแข่งขัน"
  },
  {
    id: "f2",
    league: "Premier League",
    homeTeam: "Chelsea",
    awayTeam: "Arsenal",
    homeScore: 1,
    awayScore: 1,
    status: "FT",
    date: "จบการแข่งขัน"
  },
  {
    id: "f3",
    league: "Premier League",
    homeTeam: "Brighton",
    awayTeam: "Man City",
    homeScore: 2,
    awayScore: 1,
    status: "FT",
    date: "จบการแข่งขัน"
  },
  {
    id: "f4",
    league: "UEFA Champions League",
    homeTeam: "Real Madrid",
    awayTeam: "Liverpool",
    homeScore: null,
    awayScore: null,
    status: "LIVE",
    date: "03:00 น."
  }
];
