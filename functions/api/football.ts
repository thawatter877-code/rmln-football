// Real fixtures/results and league table from ESPN's public soccer API (no API key).
// GET /api/football -> { matches: [...], standings: [...] }
// GET /api/football?league=eng.1 (eng.1 = Premier League, uefa.champions, esp.1, ita.1, ger.1, tha.1)

const LEAGUES: Record<string, string> = {
  "eng.1": "Premier League",
  "uefa.champions": "UEFA Champions League",
  "esp.1": "La Liga",
  "ita.1": "Serie A",
  "ger.1": "Bundesliga",
  "tha.1": "Thai League 1",
};

interface Match {
  id: string;
  league: string;
  date: string;
  state: "pre" | "in" | "post";
  statusText: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number | null;
  awayScore: number | null;
}

interface StandingRow {
  rank: number;
  team: string;
  logo: string;
  played: number;
  points: number;
  goalDiff: number;
}

async function getJson(url: string, ttl: number): Promise<any> {
  const res = await fetch(url, { cf: { cacheTtl: ttl, cacheEverything: true } } as RequestInit);
  if (!res.ok) throw new Error(`ESPN ${res.status}`);
  return res.json();
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

async function loadMatches(league: string): Promise<Match[]> {
  // Window: 3 days back to 4 days ahead so there are always recent results + upcoming fixtures
  const from = new Date(Date.now() - 3 * 86400_000);
  const to = new Date(Date.now() + 4 * 86400_000);
  const data = await getJson(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=${ymd(from)}-${ymd(to)}`,
    60
  );
  const events: any[] = Array.isArray(data?.events) ? data.events : [];
  return events
    .map((ev): Match | null => {
      const comp = ev?.competitions?.[0];
      const teams: any[] = comp?.competitors || [];
      const home = teams.find((t) => t.homeAway === "home") || teams[0];
      const away = teams.find((t) => t.homeAway === "away") || teams[1];
      if (!home || !away) return null;
      const type = ev?.status?.type || comp?.status?.type || {};
      const state = (["pre", "in", "post"].includes(type.state) ? type.state : "pre") as Match["state"];
      const score = (t: any) => {
        const v = typeof t.score === "object" ? t.score?.value : t.score;
        const n = Number(v);
        return state === "pre" || v === undefined || v === "" || isNaN(n) ? null : n;
      };
      return {
        id: String(ev.id),
        league: LEAGUES[league] || league,
        date: ev.date,
        state,
        statusText: type.shortDetail || type.detail || type.description || "",
        homeTeam: home.team?.shortDisplayName || home.team?.displayName || "",
        awayTeam: away.team?.shortDisplayName || away.team?.displayName || "",
        homeLogo: home.team?.logo || "",
        awayLogo: away.team?.logo || "",
        homeScore: score(home),
        awayScore: score(away),
      };
    })
    .filter((m): m is Match => !!m);
}

async function loadStandings(league: string): Promise<StandingRow[]> {
  const data = await getJson(`https://site.api.espn.com/apis/v2/sports/soccer/${league}/standings`, 600);
  const entries: any[] = data?.children?.[0]?.standings?.entries || data?.standings?.entries || [];
  const stat = (e: any, ...names: string[]) => {
    const s = (e.stats || []).find((x: any) => names.includes(x.name) || names.includes(x.type));
    return Number(s?.value ?? 0);
  };
  return entries
    .map((e, i) => ({
      rank: stat(e, "rank") || i + 1,
      team: e.team?.shortDisplayName || e.team?.displayName || "",
      logo: e.team?.logos?.[0]?.href || "",
      played: stat(e, "gamesPlayed"),
      points: stat(e, "points"),
      goalDiff: stat(e, "pointDifferential", "goalDifference"),
    }))
    .sort((a, b) => a.rank - b.rank);
}

export const onRequestGet = async ({ request }: { request: Request }) => {
  const league = new URL(request.url).searchParams.get("league") || "eng.1";
  if (!LEAGUES[league]) {
    return new Response(JSON.stringify({ error: "Unknown league" }), { status: 400 });
  }

  const [m, s] = await Promise.allSettled([loadMatches(league), loadStandings(league)]);
  const errors = [m, s].filter((r) => r.status === "rejected").map((r: any) => String(r.reason?.message || r.reason));

  return new Response(
    JSON.stringify({
      league: LEAGUES[league],
      matches: m.status === "fulfilled" ? m.value : [],
      standings: s.status === "fulfilled" ? s.value : [],
      errors,
      source: "ESPN",
    }),
    { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" } }
  );
};
