// "Top 100 wonderkids" data: built and verified by Gemini with Google Search grounding,
// stored in D1 (rmln_prospects) and editable by staff.
//
// One refresh = one position group (keeps each request well under Cloudflare's ~100s limit):
//   1. RESEARCH – Gemini + Google Search lists the most interesting players of that group
//      who are 21 or younger this year, with current club, birth date, nationality
//   2. VERIFY   – a second grounded call re-checks club / birth date / nationality of every
//      player and returns corrections; unconfirmed players are stored but flagged
//   3. the group's previous AI rows are replaced; rows edited by staff are kept

export interface ProspectEnv {
  DB?: any;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
}

export const GROUPS: Record<string, { label: string; count: number; desc: string }> = {
  GK: { label: "ผู้รักษาประตู", count: 10, desc: "goalkeepers" },
  DEF: { label: "กองหลัง", count: 30, desc: "defenders (centre-backs and full-backs)" },
  MID: { label: "กองกลาง", count: 30, desc: "midfielders (defensive, central and attacking midfielders)" },
  FWD: { label: "กองหน้า", count: 30, desc: "forwards (wingers and strikers)" },
};

const DEFAULT_MODEL = "gemini-2.5-flash";

export async function ensureProspectTable(db: any) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS rmln_prospects (
        id TEXT PRIMARY KEY,
        grp TEXT NOT NULL,              -- GK | DEF | MID | FWD
        name TEXT NOT NULL,
        name_th TEXT,
        birth_date TEXT,                -- YYYY-MM-DD
        nationality TEXT,
        nationality_th TEXT,
        position TEXT,                  -- e.g. "Right winger"
        position_th TEXT,
        club TEXT,
        league TEXT,
        highlight TEXT,                 -- Thai: why this player is interesting
        score INTEGER DEFAULT 0,        -- editorial interest score 1-100 (AI)
        verified INTEGER DEFAULT 0,     -- 1 = club/birth date/nationality confirmed by the verify pass
        verify_note TEXT,
        sources TEXT,                   -- JSON [{title, uri}]
        edited_by_staff INTEGER DEFAULT 0,
        hidden INTEGER DEFAULT 0,
        updated_at TEXT
      )`
    )
    .run();
}

function maxBirthYear(): number {
  // "Young" = 21 or younger during the current year
  return new Date().getUTCFullYear() - 21;
}

interface GroundedResult {
  text: string;
  sources: { title: string; uri: string }[];
}

async function groundedGemini(env: ProspectEnv, prompt: string): Promise<GroundedResult> {
  const model = env.GEMINI_MODEL || DEFAULT_MODEL;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY as string },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.2 },
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${data?.error?.message || "request failed"}`);
  const cand = data?.candidates?.[0];
  const text = (cand?.content?.parts || []).map((p: any) => p.text || "").join("");
  if (!text) throw new Error("Gemini ไม่ส่งผลลัพธ์");
  const sources = (cand?.groundingMetadata?.groundingChunks || [])
    .map((c: any) => ({ title: String(c?.web?.title || ""), uri: String(c?.web?.uri || "") }))
    .filter((s: any) => s.uri);
  return { text, sources };
}

/** Grounded responses can't use JSON mode, so pull the first JSON array/object out of the text */
function extractJson(text: string): any {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.search(/[\[{]/);
  if (start < 0) throw new Error("ไม่พบ JSON ในคำตอบของ AI");
  const open = body[start];
  const close = open === "[" ? "]" : "}";
  const end = body.lastIndexOf(close);
  return JSON.parse(body.slice(start, end + 1));
}

const VALID_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface Candidate {
  name: string;
  name_th?: string;
  birth_date?: string;
  nationality?: string;
  nationality_th?: string;
  position?: string;
  position_th?: string;
  club?: string;
  league?: string;
  highlight?: string;
  score?: number;
}

export async function refreshGroup(env: ProspectEnv, grp: string) {
  const db = env.DB;
  const group = GROUPS[grp];
  if (!group) throw new Error("Unknown group");
  if (!env.GEMINI_API_KEY) throw new Error("ยังไม่ได้ตั้งค่า GEMINI_API_KEY");
  await ensureProspectTable(db);

  const today = new Date().toISOString().slice(0, 10);
  const minYear = maxBirthYear();

  // ---- 1. research
  const research = await groundedGemini(
    env,
    `Today is ${today}. Use Google Search to find up-to-date information.
List the ${group.count} most interesting and highly rated young football ${group.desc} in the world right now,
born on or after ${minYear}-01-01, playing professionally (first team or recently debuted) anywhere in the world.
Prefer players who are regularly mentioned by reliable outlets as top prospects this season.
Use each player's CURRENT club as of ${today} (account for recent transfers and loans; for loans write "Club (loan from Parent Club)").
Only include facts you can confirm from search results. Do not guess birth dates.

Return ONLY a JSON array, no other text. Each element:
{"name": "full name in English",
 "name_th": "name written in Thai as Thai sports media would",
 "birth_date": "YYYY-MM-DD",
 "nationality": "English country name", "nationality_th": "country in Thai",
 "position": "specific position in English", "position_th": "position in Thai",
 "club": "current club", "league": "current league",
 "highlight": "1-2 sentences in Thai on why this player is interesting (only verified facts, e.g. debut, records, current-season numbers)",
 "score": integer 1-100 (editorial interest/potential score; best prospect highest)}`
  );

  let list: Candidate[] = [];
  try {
    const parsed = extractJson(research.text);
    list = Array.isArray(parsed) ? parsed : [];
  } catch (err: any) {
    throw new Error("AI ส่งรายชื่อกลับมาในรูปแบบที่อ่านไม่ได้: " + err.message);
  }

  // basic sanity: required fields + age rule + de-duplicate
  const seen = new Set<string>();
  list = list
    .filter((p) => p && typeof p.name === "string" && p.name.trim())
    .filter((p) => {
      const key = p.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .filter((p) => !p.birth_date || !VALID_DATE.test(p.birth_date) || Number(p.birth_date.slice(0, 4)) >= minYear)
    .slice(0, group.count);

  if (list.length === 0) throw new Error("AI ไม่พบรายชื่อนักเตะ");

  // ---- 2. verify
  const verify = await groundedGemini(
    env,
    `Today is ${today}. You are a fact-checker. Use Google Search to verify each football player below:
their CURRENT club (as of ${today}, including loans), exact birth date and nationality.
${JSON.stringify(list.map((p) => ({ name: p.name, birth_date: p.birth_date, nationality: p.nationality, club: p.club })))}

Return ONLY a JSON array with one element per player, same order:
{"name": "...", "confirmed": true|false (true only if club, birth date and nationality are all confirmed or corrected from reliable sources),
 "birth_date": "corrected YYYY-MM-DD or same", "nationality": "corrected or same", "club": "corrected current club or same",
 "note": "short English note of what was corrected or could not be confirmed (empty if all fine)"}`
  );

  let checks: any[] = [];
  try {
    const parsed = extractJson(verify.text);
    checks = Array.isArray(parsed) ? parsed : [];
  } catch {
    checks = [];
  }
  const checkByName = new Map(checks.filter((c) => c?.name).map((c) => [String(c.name).trim().toLowerCase(), c]));

  // ---- 3. store (replace this group's AI rows, keep staff-edited rows)
  const sources = JSON.stringify([...research.sources, ...verify.sources].slice(0, 12));
  const now = new Date().toISOString();
  const kept = await db
    .prepare("SELECT lower(name) AS n FROM rmln_prospects WHERE grp = ? AND edited_by_staff = 1")
    .bind(grp)
    .all();
  const keptNames = new Set((kept.results || []).map((r: any) => r.n));
  await db.prepare("DELETE FROM rmln_prospects WHERE grp = ? AND edited_by_staff = 0").bind(grp).run();

  let stored = 0;
  let verified = 0;
  for (const p of list) {
    const key = p.name.trim().toLowerCase();
    if (keptNames.has(key)) continue;
    const c = checkByName.get(key);
    const birth = VALID_DATE.test(String(c?.birth_date || "")) ? c.birth_date : VALID_DATE.test(String(p.birth_date || "")) ? p.birth_date : null;
    if (birth && Number(birth.slice(0, 4)) < minYear) continue; // too old after correction
    const isVerified = !!c?.confirmed && !!birth;
    if (isVerified) verified++;

    await db
      .prepare(
        `INSERT INTO rmln_prospects (id, grp, name, name_th, birth_date, nationality, nationality_th, position, position_th, club, league,
          highlight, score, verified, verify_note, sources, edited_by_staff, hidden, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`
      )
      .bind(
        `pr-${crypto.randomUUID()}`,
        grp,
        p.name.trim(),
        (p.name_th || "").trim() || null,
        birth,
        String(c?.nationality || p.nationality || "").trim() || null,
        (p.nationality_th || "").trim() || null,
        (p.position || "").trim() || null,
        (p.position_th || "").trim() || null,
        String(c?.club || p.club || "").trim() || null,
        (p.league || "").trim() || null,
        (p.highlight || "").trim() || null,
        Math.max(1, Math.min(100, Math.round(Number(p.score) || 50))),
        isVerified ? 1 : 0,
        String(c?.note || "").trim() || (c ? null : "not checked"),
        sources,
        now
      )
      .run();
    stored++;
  }

  return { group: grp, stored, verified };
}
