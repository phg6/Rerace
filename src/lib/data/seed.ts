import type {
  RaceEvent,
  ReplayItem,
  MediaItem,
  NewsArticle,
  Poll,
  Driver,
  Team,
  StandingsTable,
  SessionResult,
} from "../types";

/**
 * Seed / fallback content. Used whenever Payload (DATABASE_URI) is not configured
 * so the site always renders. Dates are computed relative to "now" so the demo
 * always shows a believable mix of live, upcoming and finished events.
 */

const now = Date.now();
const H = 3600_000;
const D = 24 * H;
const iso = (t: number) => new Date(t).toISOString();

// A public HLS test stream so the player works out of the box in development.
const DEMO_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

function demoStreams(prefix: string) {
  return [
    { id: `${prefix}-en1`, label: "World Feed", language: "English", source: "Rerace One", url: DEMO_HLS, kind: "hls" as const },
    { id: `${prefix}-en2`, label: "Backup Feed", language: "English", source: "Rerace Two", url: DEMO_HLS, kind: "hls" as const },
    { id: `${prefix}-nl`, label: "Dutch Commentary", language: "Dutch", source: "Rerace NL", url: DEMO_HLS, kind: "hls" as const },
    { id: `${prefix}-es`, label: "Spanish Commentary", language: "Spanish", source: "Rerace ES", url: DEMO_HLS, kind: "hls" as const },
  ];
}

export const seedEvents: RaceEvent[] = [
  {
    id: "wec-le-mans-2026",
    title: "24 Hours of Le Mans",
    series: "wec",
    circuit: "Circuit de la Sarthe",
    country: "France",
    image: "/img/series/wec.svg",
    featured: true,
    description:
      "The centrepiece of the endurance season. Hypercars, LMP2 and LMGT3 battle around the clock at La Sarthe.",
    sessions: [
      { key: "warmup", name: "Warm-Up", startsAt: iso(now - 8 * H), endsAt: iso(now - 7 * H) },
      { key: "race", name: "Race", startsAt: iso(now - 4 * H), endsAt: iso(now + 20 * H) },
    ],
    streams: demoStreams("lemans"),
  },
  {
    id: "f1-spain-2026",
    title: "Formula 1 Spanish Grand Prix",
    series: "f1",
    circuit: "Circuit de Barcelona-Catalunya",
    country: "Spain",
    image: "/img/series/f1.svg",
    featured: true,
    description: "Round 9 of the 2026 FIA Formula One World Championship.",
    sessions: [
      { key: "fp1", name: "Practice 1", startsAt: iso(now + 2 * D), endsAt: iso(now + 2 * D + 1 * H) },
      { key: "fp2", name: "Practice 2", startsAt: iso(now + 2 * D + 4 * H), endsAt: iso(now + 2 * D + 5 * H) },
      { key: "fp3", name: "Practice 3", startsAt: iso(now + 3 * D), endsAt: iso(now + 3 * D + 1 * H) },
      { key: "quali", name: "Qualifying", startsAt: iso(now + 3 * D + 4 * H), endsAt: iso(now + 3 * D + 5 * H) },
      { key: "race", name: "Race", startsAt: iso(now + 4 * D + 3 * H), endsAt: iso(now + 4 * D + 5 * H) },
    ],
    streams: demoStreams("f1spain"),
  },
  {
    id: "f2-spain-2026",
    title: "Formula 2 — Barcelona",
    series: "f2",
    circuit: "Circuit de Barcelona-Catalunya",
    country: "Spain",
    image: "/img/series/f2.svg",
    sessions: [
      { key: "sprint", name: "Sprint Race", startsAt: iso(now + 3 * D + 7 * H), endsAt: iso(now + 3 * D + 8 * H) },
      { key: "feature", name: "Feature Race", startsAt: iso(now + 4 * D), endsAt: iso(now + 4 * D + 1 * H) },
    ],
    streams: demoStreams("f2spain"),
  },
  {
    id: "f3-spain-2026",
    title: "Formula 3 — Barcelona",
    series: "f3",
    circuit: "Circuit de Barcelona-Catalunya",
    country: "Spain",
    image: "/img/series/f3.svg",
    sessions: [
      { key: "sprint", name: "Sprint Race", startsAt: iso(now + 3 * D + 2 * H), endsAt: iso(now + 3 * D + 3 * H) },
      { key: "feature", name: "Feature Race", startsAt: iso(now + 3 * D + 22 * H), endsAt: iso(now + 3 * D + 23 * H) },
    ],
    streams: demoStreams("f3spain"),
  },
  {
    id: "nascar-iowa-2026",
    title: "NASCAR Cup Series — Iowa Corn 350",
    series: "nascar",
    circuit: "Iowa Speedway",
    country: "United States",
    image: "/img/series/nascar.svg",
    sessions: [
      { key: "quali", name: "Qualifying", startsAt: iso(now + 2 * D + 20 * H), endsAt: iso(now + 2 * D + 21 * H) },
      { key: "race", name: "Race", startsAt: iso(now + 3 * D + 23 * H), endsAt: iso(now + 4 * D + 2 * H) },
    ],
    streams: demoStreams("nascar"),
  },
  {
    id: "motogp-aragon-2026",
    title: "MotoGP — Gran Premio de Aragón",
    series: "motogp",
    circuit: "MotorLand Aragón",
    country: "Spain",
    image: "/img/series/motogp.svg",
    sessions: [
      { key: "quali", name: "Qualifying", startsAt: iso(now + 9 * D), endsAt: iso(now + 9 * D + 1 * H) },
      { key: "sprint", name: "Sprint", startsAt: iso(now + 9 * D + 4 * H), endsAt: iso(now + 9 * D + 5 * H) },
      { key: "race", name: "Race", startsAt: iso(now + 10 * D + 2 * H), endsAt: iso(now + 10 * D + 4 * H) },
    ],
    streams: demoStreams("motogp"),
  },
  {
    id: "indycar-road-america-2026",
    title: "IndyCar — XPEL Grand Prix at Road America",
    series: "indycar",
    circuit: "Road America",
    country: "United States",
    image: "/img/series/indycar.svg",
    sessions: [
      { key: "quali", name: "Qualifying", startsAt: iso(now + 9 * D + 20 * H), endsAt: iso(now + 9 * D + 21 * H) },
      { key: "race", name: "Race", startsAt: iso(now + 10 * D + 19 * H), endsAt: iso(now + 10 * D + 21 * H) },
    ],
    streams: demoStreams("indycar"),
  },
  {
    id: "wrc-greece-2026",
    title: "WRC — EKO Acropolis Rally Greece",
    series: "wrc",
    circuit: "Lamia Service Park",
    country: "Greece",
    image: "/img/series/wrc.svg",
    sessions: [
      { key: "ss1", name: "Shakedown", startsAt: iso(now + 15 * D), endsAt: iso(now + 15 * D + 2 * H) },
      { key: "powerstage", name: "Power Stage", startsAt: iso(now + 18 * D), endsAt: iso(now + 18 * D + 2 * H) },
    ],
    streams: demoStreams("wrc"),
  },
  {
    id: "supercup-spain-2026",
    title: "Porsche Supercup — Barcelona",
    series: "supercup",
    circuit: "Circuit de Barcelona-Catalunya",
    country: "Spain",
    image: "/img/series/supercup.svg",
    sessions: [
      { key: "race", name: "Race", startsAt: iso(now + 4 * D + 1 * H), endsAt: iso(now + 4 * D + 1.75 * H) },
    ],
    streams: demoStreams("supercup"),
  },
];

// ——— F1 replays: full 2026 season so far, every session ———
const F1_2026_ROUNDS: { round: number; name: string; key: string; sprint?: boolean }[] = [
  { round: 1, name: "Australian Grand Prix", key: "australia" },
  { round: 2, name: "Chinese Grand Prix", key: "china", sprint: true },
  { round: 3, name: "Japanese Grand Prix", key: "japan" },
  { round: 4, name: "Bahrain Grand Prix", key: "bahrain" },
  { round: 5, name: "Saudi Arabian Grand Prix", key: "saudi-arabia" },
  { round: 6, name: "Miami Grand Prix", key: "miami", sprint: true },
  { round: 7, name: "Canadian Grand Prix", key: "canada" },
  { round: 8, name: "Monaco Grand Prix", key: "monaco" },
];

export const seedReplays: ReplayItem[] = F1_2026_ROUNDS.flatMap((r) => {
  const sessions = r.sprint
    ? ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"]
    : ["FP1", "FP2", "FP3", "Qualifying", "Race"];
  const weekendStart = now - (F1_2026_ROUNDS.length - r.round + 1) * 14 * D;
  return sessions.map((session, i) => ({
    id: `f1-2026-r${r.round}-${session.toLowerCase().replace(/\s+/g, "-")}`,
    title: `${r.name} — ${session}`,
    series: "f1" as const,
    season: 2026,
    round: r.round,
    eventName: r.name,
    session,
    url: DEMO_HLS,
    kind: "hls" as const,
    image: "/img/series/f1.svg",
    durationMin: session === "Race" ? 120 : 65,
    airedAt: iso(weekendStart + i * 8 * H),
  }));
});

export const seedMedia: MediaItem[] = [
  // Documentaries
  { id: "doc-dts-s8", kind: "documentary", title: "Drive to Survive — Season 8", description: "Behind the scenes of the 2025 Formula 1 season: title fights, team politics and the new era of regulations.", series: "f1", year: 2026, image: "/img/series/f1.svg", url: DEMO_HLS, embedKind: "hls", durationMin: 480 },
  { id: "doc-all-access", kind: "documentary", title: "NASCAR: All Access", description: "Unfiltered access to the Cup Series garage across a full season of American stock car racing.", series: "nascar", year: 2025, image: "/img/series/nascar.svg", url: DEMO_HLS, embedKind: "hls", durationMin: 360 },
  { id: "doc-mgp-unlimited", kind: "documentary", title: "MotoGP Unlimited", description: "Riders, rivalries and 350 km/h bravery — inside the world championship paddock.", series: "motogp", year: 2024, image: "/img/series/motogp.svg", url: DEMO_HLS, embedKind: "hls", durationMin: 380 },
  { id: "doc-100-indy", kind: "documentary", title: "100 Days to Indy", description: "The road to the greatest spectacle in racing — the Indianapolis 500.", series: "indycar", year: 2025, image: "/img/series/indycar.svg", url: DEMO_HLS, embedKind: "hls", durationMin: 300 },
  { id: "doc-le-mans-glory", kind: "documentary", title: "Le Mans: Racing Is Everything", description: "One race, 24 hours, and the teams who give everything for endurance glory.", series: "wec", year: 2024, image: "/img/series/wec.svg", url: DEMO_HLS, embedKind: "hls", durationMin: 240 },
  // Movies (account required)
  { id: "movie-rush", kind: "movie", title: "Rush", description: "Hunt vs. Lauda — the legendary 1976 Formula 1 title fight.", series: "f1", year: 2013, image: "/img/series/f1.svg", url: DEMO_HLS, embedKind: "hls", durationMin: 123, requiresAccount: true },
  { id: "movie-ford-v-ferrari", kind: "movie", title: "Ford v Ferrari", description: "Carroll Shelby and Ken Miles take on Ferrari at Le Mans 1966.", series: "wec", year: 2019, image: "/img/series/wec.svg", url: DEMO_HLS, embedKind: "hls", durationMin: 152, requiresAccount: true },
  { id: "movie-senna", kind: "movie", title: "Senna", description: "The life and legacy of Ayrton Senna, three-time world champion.", series: "f1", year: 2010, image: "/img/series/f1.svg", url: DEMO_HLS, embedKind: "hls", durationMin: 106, requiresAccount: true },
  { id: "movie-gran-turismo", kind: "movie", title: "Gran Turismo", description: "From sim racer to professional driver — based on a true story.", series: "general", year: 2023, image: "/img/series/general.svg", url: DEMO_HLS, embedKind: "hls", durationMin: 134, requiresAccount: true },
  // Crawled videos
  { id: "vid-onboard-monaco", kind: "video", title: "Onboard: Pole lap around Monaco", description: "Full onboard from the closest qualifying session of the season.", series: "f1", image: "/img/series/f1.svg", url: DEMO_HLS, embedKind: "hls", source: "Motorsport Clips", durationMin: 3 },
  { id: "vid-top10-overtakes", kind: "video", title: "Top 10 overtakes of 2026 so far", series: "general", image: "/img/series/general.svg", url: DEMO_HLS, embedKind: "hls", source: "RaceReel", durationMin: 9 },
  { id: "vid-wrc-flatout", kind: "video", title: "WRC: Flat-out through the Greek mountains", series: "wrc", image: "/img/series/wrc.svg", url: DEMO_HLS, embedKind: "hls", source: "RallyCast", durationMin: 6 },
  { id: "vid-nascar-finish", kind: "video", title: "Three-wide photo finish at Atlanta", series: "nascar", image: "/img/series/nascar.svg", url: DEMO_HLS, embedKind: "hls", source: "OvalNation", durationMin: 4 },
  { id: "vid-motogp-saves", kind: "video", title: "Impossible saves: MotoGP edition", series: "motogp", image: "/img/series/motogp.svg", url: DEMO_HLS, embedKind: "hls", source: "TwoWheelsTV", durationMin: 7 },
];

export const seedNews: NewsArticle[] = [
  {
    id: "rerace-welcome",
    title: "Welcome to the new Rerace — every race, every series, one place",
    url: "/news/welcome-to-the-new-rerace",
    slug: "welcome-to-the-new-rerace",
    source: "Rerace",
    isOriginal: true,
    image: "/img/series/general.svg",
    excerpt:
      "A faster, sleeker Rerace built for race weekends: multi-language live streams, full F1 replay coverage, daily polls, predictions and more.",
    series: "general",
    publishedAt: iso(now - 6 * H),
    author: "Rerace Team",
  },
  { id: "n1", title: "Title fight tightens as championship leader stumbles in Monaco", url: "https://www.motorsport.com/", source: "Motorsport.com", isOriginal: false, image: "/img/series/f1.svg", excerpt: "The gap at the top of the drivers' standings is down to single digits after a chaotic weekend in the principality.", series: "f1", publishedAt: iso(now - 10 * H) },
  { id: "n2", title: "Hypercar grid hits record size for Le Mans centenary era", url: "https://www.autosport.com/", source: "Autosport", isOriginal: false, image: "/img/series/wec.svg", excerpt: "More manufacturers than ever line up at La Sarthe as the endurance boom continues.", series: "wec", publishedAt: iso(now - 16 * H) },
  { id: "n3", title: "Analysis: why the 2026 aero rules are rewarding late brakers", url: "https://www.the-race.com/", source: "The Race", isOriginal: false, image: "/img/series/f1.svg", excerpt: "The new regulations have changed overtaking dynamics more than anyone predicted.", series: "f1", publishedAt: iso(now - 22 * H) },
  { id: "n4", title: "Rookie sensation takes maiden MotoGP podium at Mugello", url: "https://www.crash.net/", source: "Crash.net", isOriginal: false, image: "/img/series/motogp.svg", series: "motogp", publishedAt: iso(now - 28 * H) },
  { id: "n5", title: "NASCAR confirms 2027 street race expansion", url: "https://racer.com/", source: "Racer", isOriginal: false, image: "/img/series/nascar.svg", series: "nascar", publishedAt: iso(now - 34 * H) },
  { id: "n6", title: "IndyCar silly season: who lands the final top-team seat?", url: "https://racefans.net/", source: "RaceFans", isOriginal: false, image: "/img/series/indycar.svg", series: "indycar", publishedAt: iso(now - 40 * H) },
];

export const seedPoll: Poll = {
  id: "seed-poll-lemans",
  question: "Who wins the 24 Hours of Le Mans?",
  options: ["Ferrari", "Toyota", "Porsche", "Cadillac", "BMW"],
  startsAt: iso(now - 6 * H),
  endsAt: iso(now + 18 * H),
};

export const seedTeams: Team[] = [
  { id: "t-mclaren", slug: "mclaren", name: "McLaren", series: "f1", color: "#ff8000", base: "Woking, United Kingdom" },
  { id: "t-ferrari", slug: "ferrari", name: "Ferrari", series: "f1", color: "#e8002d", base: "Maranello, Italy" },
  { id: "t-redbull", slug: "red-bull-racing", name: "Red Bull Racing", series: "f1", color: "#3671c6", base: "Milton Keynes, United Kingdom" },
  { id: "t-mercedes", slug: "mercedes", name: "Mercedes-AMG", series: "f1", color: "#27f4d2", base: "Brackley, United Kingdom" },
  { id: "t-aston", slug: "aston-martin", name: "Aston Martin", series: "f1", color: "#229971", base: "Silverstone, United Kingdom" },
  { id: "t-williams", slug: "williams", name: "Williams", series: "f1", color: "#64c4ff", base: "Grove, United Kingdom" },
  { id: "t-audi", slug: "audi", name: "Audi", series: "f1", color: "#bb0a30", base: "Hinwil, Switzerland" },
  { id: "t-alpine", slug: "alpine", name: "Alpine", series: "f1", color: "#ff87bc", base: "Enstone, United Kingdom" },
  { id: "t-haas", slug: "haas", name: "Haas", series: "f1", color: "#b6babd", base: "Kannapolis, United States" },
  { id: "t-rb", slug: "racing-bulls", name: "Racing Bulls", series: "f1", color: "#6692ff", base: "Faenza, Italy" },
  { id: "t-cadillac", slug: "cadillac", name: "Cadillac", series: "f1", color: "#d4af37", base: "Charlotte, United States" },
];

export const seedDrivers: Driver[] = [
  { id: "d-norris", slug: "lando-norris", name: "Lando Norris", series: "f1", team: "McLaren", number: 1, country: "United Kingdom" },
  { id: "d-piastri", slug: "oscar-piastri", name: "Oscar Piastri", series: "f1", team: "McLaren", number: 81, country: "Australia" },
  { id: "d-verstappen", slug: "max-verstappen", name: "Max Verstappen", series: "f1", team: "Red Bull Racing", number: 33, country: "Netherlands" },
  { id: "d-leclerc", slug: "charles-leclerc", name: "Charles Leclerc", series: "f1", team: "Ferrari", number: 16, country: "Monaco" },
  { id: "d-hamilton", slug: "lewis-hamilton", name: "Lewis Hamilton", series: "f1", team: "Ferrari", number: 44, country: "United Kingdom" },
  { id: "d-russell", slug: "george-russell", name: "George Russell", series: "f1", team: "Mercedes-AMG", number: 63, country: "United Kingdom" },
  { id: "d-antonelli", slug: "kimi-antonelli", name: "Kimi Antonelli", series: "f1", team: "Mercedes-AMG", number: 12, country: "Italy" },
  { id: "d-alonso", slug: "fernando-alonso", name: "Fernando Alonso", series: "f1", team: "Aston Martin", number: 14, country: "Spain" },
  { id: "d-sainz", slug: "carlos-sainz", name: "Carlos Sainz", series: "f1", team: "Williams", number: 55, country: "Spain" },
  { id: "d-albon", slug: "alex-albon", name: "Alex Albon", series: "f1", team: "Williams", number: 23, country: "Thailand" },
];

const f1DriverRows = [
  { position: 1, name: "Lando Norris", team: "McLaren", points: 198, wins: 4, teamColor: "#ff8000", positionChange: 0 },
  { position: 2, name: "Oscar Piastri", team: "McLaren", points: 184, wins: 3, teamColor: "#ff8000", positionChange: 1 },
  { position: 3, name: "Max Verstappen", team: "Red Bull Racing", points: 176, wins: 1, teamColor: "#3671c6", positionChange: -1 },
  { position: 4, name: "Charles Leclerc", team: "Ferrari", points: 131, wins: 0, teamColor: "#e8002d", positionChange: 0 },
  { position: 5, name: "George Russell", team: "Mercedes-AMG", points: 118, wins: 0, teamColor: "#27f4d2", positionChange: 0 },
  { position: 6, name: "Lewis Hamilton", team: "Ferrari", points: 97, wins: 0, teamColor: "#e8002d", positionChange: 2 },
  { position: 7, name: "Kimi Antonelli", team: "Mercedes-AMG", points: 84, wins: 0, teamColor: "#27f4d2", positionChange: -1 },
  { position: 8, name: "Fernando Alonso", team: "Aston Martin", points: 52, wins: 0, teamColor: "#229971", positionChange: 0 },
  { position: 9, name: "Carlos Sainz", team: "Williams", points: 41, wins: 0, teamColor: "#64c4ff", positionChange: 1 },
  { position: 10, name: "Alex Albon", team: "Williams", points: 38, wins: 0, teamColor: "#64c4ff", positionChange: -1 },
];

export const seedStandings: StandingsTable[] = [
  { series: "f1", kind: "drivers", season: 2026, updatedAt: iso(now - 2 * H), rows: f1DriverRows },
  {
    series: "f1",
    kind: "constructors",
    season: 2026,
    updatedAt: iso(now - 2 * H),
    rows: [
      { position: 1, name: "McLaren", points: 382, wins: 7, teamColor: "#ff8000" },
      { position: 2, name: "Ferrari", points: 228, wins: 0, teamColor: "#e8002d" },
      { position: 3, name: "Mercedes-AMG", points: 202, wins: 1, teamColor: "#27f4d2" },
      { position: 4, name: "Red Bull Racing", points: 195, wins: 1, teamColor: "#3671c6" },
      { position: 5, name: "Williams", points: 79, wins: 0, teamColor: "#64c4ff" },
      { position: 6, name: "Aston Martin", points: 61, wins: 0, teamColor: "#229971" },
    ],
  },
  {
    series: "motogp",
    kind: "riders",
    season: 2026,
    updatedAt: iso(now - 3 * H),
    rows: [
      { position: 1, name: "Marc Márquez", team: "Ducati Lenovo", points: 211, wins: 5, teamColor: "#cc0000" },
      { position: 2, name: "Pecco Bagnaia", team: "Ducati Lenovo", points: 176, wins: 2, teamColor: "#cc0000" },
      { position: 3, name: "Jorge Martín", team: "Aprilia Racing", points: 158, wins: 2, teamColor: "#41b6e6" },
      { position: 4, name: "Pedro Acosta", team: "Red Bull KTM", points: 141, wins: 1, teamColor: "#ff6600" },
      { position: 5, name: "Fabio Quartararo", team: "Monster Yamaha", points: 102, wins: 0, teamColor: "#0a1f8f" },
    ],
  },
];

export const seedResults: SessionResult[] = [
  {
    series: "f1",
    season: 2026,
    eventKey: "monaco",
    eventName: "Monaco Grand Prix",
    sessionKey: "race",
    sessionName: "Race",
    completedAt: iso(now - 4 * D),
    rows: [
      { position: 1, driver: "Charles Leclerc", team: "Ferrari", time: "1:42:18.392", points: 25 },
      { position: 2, driver: "Lando Norris", team: "McLaren", time: "+3.821s", points: 18 },
      { position: 3, driver: "Max Verstappen", team: "Red Bull Racing", time: "+7.114s", points: 15 },
      { position: 4, driver: "Oscar Piastri", team: "McLaren", time: "+12.907s", points: 12 },
      { position: 5, driver: "George Russell", team: "Mercedes-AMG", time: "+18.450s", points: 10 },
    ],
  },
];
