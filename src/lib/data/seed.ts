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
  StreamSource,
} from "../types";
import { F1_CALENDAR_2026, buildSeasonEvents, roundRaceStartMs, f1EventId } from "./calendar";

export { F1_CALENDAR_2026 };

/**
 * Seed / fallback content. Used whenever Payload (DATABASE_URI) is not configured
 * so the site always renders. F1 events/replays/standings use the real 2026
 * season; other-series demo events use dates relative to "now".
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

function f1DemoStreams(prefix: string): StreamSource[] {
  return [
    { id: `${prefix}-en`, label: "World Feed", language: "English", source: "Rerace One", url: DEMO_HLS, kind: "hls", role: "feed" },
    { id: `${prefix}-es`, label: "Spanish Commentary", language: "Spanish", source: "Rerace ES", url: DEMO_HLS, kind: "hls", role: "feed" },
    { id: `${prefix}-nl`, label: "Dutch Commentary", language: "Dutch", source: "Rerace NL", url: DEMO_HLS, kind: "hls", role: "feed" },
    { id: `${prefix}-ob-verstappen`, label: "Onboard — Max Verstappen", language: "English", source: "Rerace Onboard", url: DEMO_HLS, kind: "hls", role: "onboard", driver: "Max Verstappen" },
    { id: `${prefix}-ob-norris`, label: "Onboard — Lando Norris", language: "English", source: "Rerace Onboard", url: DEMO_HLS, kind: "hls", role: "onboard", driver: "Lando Norris" },
    { id: `${prefix}-ob-leclerc`, label: "Onboard — Charles Leclerc", language: "English", source: "Rerace Onboard", url: DEMO_HLS, kind: "hls", role: "onboard", driver: "Charles Leclerc" },
    { id: `${prefix}-ob-hamilton`, label: "Onboard — Lewis Hamilton", language: "English", source: "Rerace Onboard", url: DEMO_HLS, kind: "hls", role: "onboard", driver: "Lewis Hamilton" },
  ];
}

// Auto-generated F1 events; the next upcoming round gets demo streams so the
// watch page (feeds + onboard picker) is demonstrable without the CMS.
const nextF1Round = F1_CALENDAR_2026.find((r) => roundRaceStartMs(r) + 2 * H > now);
const f1SeasonEvents: RaceEvent[] = buildSeasonEvents().map((e) =>
  nextF1Round && e.id === f1EventId(nextF1Round.round)
    ? { ...e, featured: true, streams: f1DemoStreams(e.id) }
    : e
);

const otherSeriesEvents: RaceEvent[] = [
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

export const seedEvents: RaceEvent[] = [...f1SeasonEvents, ...otherSeriesEvents];

// ——— F1 replays: every session of every completed 2026 round ———
export const seedReplays: ReplayItem[] = F1_CALENDAR_2026.filter(
  (r) => roundRaceStartMs(r) + 2 * H < now
).flatMap((r) => {
  const race = roundRaceStartMs(r);
  const sessions = r.sprint
    ? ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"]
    : ["FP1", "FP2", "FP3", "Qualifying", "Race"];
  // aired roughly when each session ended (offsets in hours relative to race start)
  const airedOffsets = r.sprint ? [-49.5, -45.5, -26, -22, 2] : [-49, -45.5, -25.5, -22, 2];
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
    durationMin: session === "Race" ? 120 : session === "Sprint" ? 60 : 65,
    airedAt: iso(race + airedOffsets[i] * H),
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
  {
    id: "n1",
    title: "Antonelli makes it five in a row as Monaco penalty review shakes up the points",
    url: "/news/article/n1",
    sourceUrl: "https://www.motorsport.com/",
    source: "Motorsport.com",
    isOriginal: false,
    image: "/img/series/f1.svg",
    excerpt: "Kimi Antonelli's fifth straight win was followed by Alpine's successful right of review, lifting Pierre Gasly onto the Monaco podium.",
    contentHtml:
      "<p>Kimi Antonelli extended his record-breaking start to the 2026 season with a fifth consecutive victory in Monaco, controlling the race from pole as Lewis Hamilton kept the Mercedes honest to the flag.</p><p>The bigger story came after the chequered flag: Alpine's right of review overturned Pierre Gasly's in-race penalties, promoting the Frenchman from seventh to third and reshaping the midfield points battle ahead of Barcelona.</p>",
    series: "f1",
    publishedAt: iso(now - 10 * H),
  },
  {
    id: "n2",
    title: "Hypercar grid hits record size for Le Mans centenary era",
    url: "/news/article/n2",
    sourceUrl: "https://www.autosport.com/",
    source: "Autosport",
    isOriginal: false,
    image: "/img/series/wec.svg",
    excerpt: "More manufacturers than ever line up at La Sarthe as the endurance boom continues.",
    contentHtml:
      "<p>The 24 Hours of Le Mans will see its largest-ever Hypercar entry this weekend, with more manufacturers than at any point in the category's history lining up at La Sarthe.</p><p>With LMP2 and LMGT3 fields also at capacity, organisers say the endurance boom shows no sign of slowing as new marques continue to commit through 2028.</p>",
    series: "wec",
    publishedAt: iso(now - 16 * H),
  },
  {
    id: "n3",
    title: "Analysis: why the 2026 aero rules are rewarding late brakers",
    url: "/news/article/n3",
    sourceUrl: "https://www.the-race.com/",
    source: "The Race",
    isOriginal: false,
    image: "/img/series/f1.svg",
    excerpt: "The new regulations have changed overtaking dynamics more than anyone predicted.",
    contentHtml:
      "<p>Six rounds into the new regulations, a clear pattern has emerged: the 2026 cars reward drivers who commit deepest on the brakes, with active aero closing the gap to the car ahead far earlier than the old DRS zones ever did.</p><p>Engineers up and down the paddock say the energy-deployment chess match into heavy braking zones is now the defining overtaking battleground of the season.</p>",
    series: "f1",
    publishedAt: iso(now - 22 * H),
  },
  {
    id: "n4",
    title: "Rookie sensation takes maiden MotoGP podium at Mugello",
    url: "/news/article/n4",
    sourceUrl: "https://www.crash.net/",
    source: "Crash.net",
    isOriginal: false,
    image: "/img/series/motogp.svg",
    contentHtml:
      "<p>A stunning final-lap move at Mugello handed MotoGP's standout rookie a maiden premier-class podium in front of the Italian crowd.</p><p>The result tightens an already frantic riders' championship heading into the European summer swing.</p>",
    series: "motogp",
    publishedAt: iso(now - 28 * H),
  },
  {
    id: "n5",
    title: "NASCAR confirms 2027 street race expansion",
    url: "/news/article/n5",
    sourceUrl: "https://racer.com/",
    source: "Racer",
    isOriginal: false,
    image: "/img/series/nascar.svg",
    contentHtml:
      "<p>NASCAR has confirmed two additional street races for the 2027 Cup Series calendar, building on the success of its downtown events.</p><p>Officials say further international exhibition rounds remain under evaluation.</p>",
    series: "nascar",
    publishedAt: iso(now - 34 * H),
  },
  {
    id: "n6",
    title: "IndyCar silly season: who lands the final top-team seat?",
    url: "/news/article/n6",
    sourceUrl: "https://racefans.net/",
    source: "RaceFans",
    isOriginal: false,
    image: "/img/series/indycar.svg",
    contentHtml:
      "<p>With contracts expiring across the paddock, IndyCar's silly season is heating up around one final vacancy at a championship-winning team.</p><p>Paddock sources suggest an announcement could come before the next oval round.</p>",
    series: "indycar",
    publishedAt: iso(now - 40 * H),
  },
];

export const seedPoll: Poll = {
  id: "seed-poll-lemans",
  question: "Who wins the 24 Hours of Le Mans?",
  options: ["Ferrari", "Toyota", "Porsche", "Cadillac", "BMW"],
  startsAt: iso(now - 6 * H),
  endsAt: iso(now + 18 * H),
};

// ——— 2026 F1 grid: 11 teams, 22 drivers ———

export const seedTeams: Team[] = [
  { id: "t-mclaren", slug: "mclaren", name: "McLaren", series: "f1", color: "#FF8000", base: "Woking, United Kingdom", fullName: "McLaren Mastercard Formula 1 Team", principal: "Andrea Stella", engine: "Mercedes", carName: "MCL40", championships: 10, raceWins: 203, firstEntry: 1966, driverSlugs: ["lando-norris", "oscar-piastri"] },
  { id: "t-ferrari", slug: "ferrari", name: "Ferrari", series: "f1", color: "#E8002D", base: "Maranello, Italy", fullName: "Scuderia Ferrari HP", principal: "Frédéric Vasseur", engine: "Ferrari", carName: "SF-26", championships: 16, raceWins: 248, firstEntry: 1950, driverSlugs: ["charles-leclerc", "lewis-hamilton"] },
  { id: "t-redbull", slug: "red-bull-racing", name: "Red Bull Racing", series: "f1", color: "#3671C6", base: "Milton Keynes, United Kingdom", fullName: "Oracle Red Bull Racing", principal: "Laurent Mekies", engine: "Red Bull Ford Powertrains", carName: "RB22", championships: 6, raceWins: 130, firstEntry: 2005, driverSlugs: ["max-verstappen", "isack-hadjar"] },
  { id: "t-mercedes", slug: "mercedes", name: "Mercedes", series: "f1", color: "#27F4D2", base: "Brackley, United Kingdom", fullName: "Mercedes-AMG Petronas F1 Team", principal: "Toto Wolff", engine: "Mercedes", carName: "W17", championships: 8, raceWins: 133, firstEntry: 1954, driverSlugs: ["george-russell", "kimi-antonelli"] },
  { id: "t-aston", slug: "aston-martin", name: "Aston Martin", series: "f1", color: "#229971", base: "Silverstone, United Kingdom", fullName: "Aston Martin Aramco F1 Team", principal: "Adrian Newey", engine: "Honda", carName: "AMR26", championships: 0, raceWins: 0, firstEntry: 2021, driverSlugs: ["fernando-alonso", "lance-stroll"] },
  { id: "t-alpine", slug: "alpine", name: "Alpine", series: "f1", color: "#0093CC", base: "Enstone, United Kingdom", fullName: "BWT Alpine F1 Team", principal: "Steve Nielsen (Managing Director; Flavio Briatore, Executive Advisor)", engine: "Mercedes", carName: "A526", championships: 2, raceWins: 21, firstEntry: 1986, driverSlugs: ["pierre-gasly", "franco-colapinto"] },
  { id: "t-williams", slug: "williams", name: "Williams", series: "f1", color: "#1868DB", base: "Grove, United Kingdom", fullName: "Atlassian Williams F1 Team", principal: "James Vowles", engine: "Mercedes", carName: "FW48", championships: 9, raceWins: 114, firstEntry: 1978, driverSlugs: ["carlos-sainz", "alexander-albon"] },
  { id: "t-rb", slug: "racing-bulls", name: "Racing Bulls", series: "f1", color: "#6692FF", base: "Faenza, Italy", fullName: "Visa Cash App Racing Bulls F1 Team", principal: "Alan Permane", engine: "Red Bull Ford Powertrains", carName: "VCARB 03", championships: 0, raceWins: 2, firstEntry: 2006, driverSlugs: ["liam-lawson", "arvid-lindblad"] },
  { id: "t-haas", slug: "haas", name: "Haas", series: "f1", color: "#B6BABD", base: "Kannapolis, North Carolina, USA", fullName: "TGR Haas F1 Team", principal: "Ayao Komatsu", engine: "Ferrari", carName: "VF-26", championships: 0, raceWins: 0, firstEntry: 2016, driverSlugs: ["esteban-ocon", "oliver-bearman"] },
  { id: "t-audi", slug: "audi", name: "Audi", series: "f1", color: "#F50537", base: "Hinwil, Switzerland", fullName: "Audi Revolut F1 Team", principal: "Mattia Binotto", engine: "Audi", carName: "R26", championships: 0, raceWins: 0, firstEntry: 2026, driverSlugs: ["nico-hulkenberg", "gabriel-bortoleto"] },
  { id: "t-cadillac", slug: "cadillac", name: "Cadillac", series: "f1", color: "#E8E8E8", base: "Fishers, Indiana, USA", fullName: "Cadillac Formula 1 Team", principal: "Graeme Lowdon", engine: "Ferrari (customer)", carName: "MAC-26", championships: 0, raceWins: 0, firstEntry: 2026, driverSlugs: ["sergio-perez", "valtteri-bottas"] },
];

const driverStats = (championships: number, wins: number, podiums: number, poles: number) => ({
  championships,
  careerWins: wins,
  careerPodiums: podiums,
  careerPoles: poles,
  stats: [
    { label: "Championships", value: String(championships) },
    { label: "Wins", value: String(wins) },
    { label: "Podiums", value: String(podiums) },
    { label: "Poles", value: String(poles) },
  ],
});

export const seedDrivers: Driver[] = [
  { id: "d-norris", slug: "lando-norris", name: "Lando Norris", series: "f1", team: "McLaren", number: 1, country: "United Kingdom", bio: "Reigning world champion who took the 2025 title by two points and now carries the No. 1 on his McLaren.", ...driverStats(1, 11, 46, 15) },
  { id: "d-piastri", slug: "oscar-piastri", name: "Oscar Piastri", series: "f1", team: "McLaren", number: 81, country: "Australia", bio: "Ice-cool Australian who pushed teammate Norris all the way to the final round of the 2025 title fight.", ...driverStats(0, 9, 30, 6) },
  { id: "d-leclerc", slug: "charles-leclerc", name: "Charles Leclerc", series: "f1", team: "Ferrari", number: 16, country: "Monaco", bio: "Monegasque cornerstone of the Scuderia, an eight-time Grand Prix winner renowned for raw one-lap speed.", ...driverStats(0, 8, 50, 27) },
  { id: "d-hamilton", slug: "lewis-hamilton", name: "Lewis Hamilton", series: "f1", team: "Ferrari", number: 44, country: "United Kingdom", bio: "Seven-time world champion and F1's all-time wins and poles record holder, resurgent in his second Ferrari season.", ...driverStats(7, 105, 205, 104) },
  { id: "d-verstappen", slug: "max-verstappen", name: "Max Verstappen", series: "f1", team: "Red Bull Racing", number: 3, country: "Netherlands", bio: "Four-time world champion (2021-24) now racing under his favourite No. 3, released to him by Daniel Ricciardo.", ...driverStats(4, 70, 127, 46) },
  { id: "d-hadjar", slug: "isack-hadjar", name: "Isack Hadjar", series: "f1", team: "Red Bull Racing", number: 6, country: "France", bio: "Franco-Algerian standout of the 2025 rookie class, promoted from Racing Bulls after a podium at Zandvoort.", ...driverStats(0, 0, 1, 0) },
  { id: "d-russell", slug: "george-russell", name: "George Russell", series: "f1", team: "Mercedes", number: 63, country: "United Kingdom", bio: "Mercedes' long-serving team leader who opened the 2026 season with victory in Australia.", ...driverStats(0, 6, 30, 8) },
  { id: "d-antonelli", slug: "kimi-antonelli", name: "Kimi Antonelli", series: "f1", team: "Mercedes", number: 12, country: "Italy", bio: "Teenage Italian phenomenon leading the 2026 championship after five consecutive wins from pole — the youngest title leader in F1 history.", ...driverStats(0, 5, 9, 5) },
  { id: "d-alonso", slug: "fernando-alonso", name: "Fernando Alonso", series: "f1", team: "Aston Martin", number: 14, country: "Spain", bio: "Two-time world champion and the most experienced driver in F1 history, chasing win 33 in Aston Martin's new Honda works era.", ...driverStats(2, 32, 106, 22) },
  { id: "d-stroll", slug: "lance-stroll", name: "Lance Stroll", series: "f1", team: "Aston Martin", number: 18, country: "Canada", bio: "Canadian with three career podiums and a famous wet-weather pole, now in his sixth season with the family-owned team.", ...driverStats(0, 0, 3, 1) },
  { id: "d-gasly", slug: "pierre-gasly", name: "Pierre Gasly", series: "f1", team: "Alpine", number: 10, country: "France", bio: "Shock 2020 Monza winner and Alpine's team leader as the Enstone squad begins its Mercedes-powered customer era.", ...driverStats(0, 1, 5, 0) },
  { id: "d-colapinto", slug: "franco-colapinto", name: "Franco Colapinto", series: "f1", team: "Alpine", number: 43, country: "Argentina", bio: "Argentina's first full-time grand prix driver in decades, retained by Alpine for 2026 after impressing in his stand-in stints.", ...driverStats(0, 0, 0, 0) },
  { id: "d-sainz", slug: "carlos-sainz", name: "Carlos Sainz", series: "f1", team: "Williams", number: 55, country: "Spain", bio: "Four-time Grand Prix winner and GPDA director spearheading Williams' bid to return to the front under the new rules.", ...driverStats(0, 4, 28, 6) },
  { id: "d-albon", slug: "alexander-albon", name: "Alexander Albon", series: "f1", team: "Williams", number: 23, country: "Thailand", bio: "Thai-British racer and two-time podium finisher, the bedrock of Williams' rebuild since 2022.", ...driverStats(0, 0, 2, 0) },
  { id: "d-lawson", slug: "liam-lawson", name: "Liam Lawson", series: "f1", team: "Racing Bulls", number: 30, country: "New Zealand", bio: "Resilient New Zealander who rebuilt his reputation at Faenza after a brutal two-race Red Bull stint in early 2025.", ...driverStats(0, 0, 0, 0) },
  { id: "d-lindblad", slug: "arvid-lindblad", name: "Arvid Lindblad", series: "f1", team: "Racing Bulls", number: 41, country: "United Kingdom", bio: "18-year-old British Red Bull junior and the only rookie on the 2026 grid, graduating straight from Formula 2.", ...driverStats(0, 0, 0, 0) },
  { id: "d-ocon", slug: "esteban-ocon", name: "Esteban Ocon", series: "f1", team: "Haas", number: 31, country: "France", bio: "Hungary 2021 winner bringing race-winning experience to Haas' new Toyota Gazoo Racing-backed era.", ...driverStats(0, 1, 4, 0) },
  { id: "d-bearman", slug: "oliver-bearman", name: "Oliver Bearman", series: "f1", team: "Haas", number: 87, country: "United Kingdom", bio: "British young gun who marked himself out as a future star with a string of standout drives in his 2025 rookie season.", ...driverStats(0, 0, 0, 0) },
  { id: "d-hulkenberg", slug: "nico-hulkenberg", name: "Nico Hülkenberg", series: "f1", team: "Audi", number: 27, country: "Germany", bio: "German veteran who finally banked his first podium at Silverstone 2025 and now leads his nation's works team.", ...driverStats(0, 0, 1, 1) },
  { id: "d-bortoleto", slug: "gabriel-bortoleto", name: "Gabriel Bortoleto", series: "f1", team: "Audi", number: 5, country: "Brazil", bio: "2024 Formula 2 champion carrying Brazil's grand prix hopes into his second season with the Hinwil squad.", ...driverStats(0, 0, 0, 0) },
  { id: "d-perez", slug: "sergio-perez", name: "Sergio Pérez", series: "f1", team: "Cadillac", number: 11, country: "Mexico", bio: "Six-time Grand Prix winner back from a year on the sidelines to lead Cadillac's historic American debut.", ...driverStats(0, 6, 39, 3) },
  { id: "d-bottas", slug: "valtteri-bottas", name: "Valtteri Bottas", series: "f1", team: "Cadillac", number: 77, country: "Finland", bio: "Ten-time race winner and five-time constructors' champion with Mercedes, anchoring F1's new 11th team.", ...driverStats(0, 10, 67, 20) },
];

// ——— 2026 standings after Round 6 (Monaco, post right-of-review) ———

const TEAM_COLOR: Record<string, string> = Object.fromEntries(
  seedTeams.map((t) => [t.name, t.color as string])
);

const f1DriverRows = [
  { position: 1, name: "Kimi Antonelli", team: "Mercedes", points: 156, wins: 5, nationality: "Italy" },
  { position: 2, name: "Lewis Hamilton", team: "Ferrari", points: 90, wins: 0, nationality: "United Kingdom" },
  { position: 3, name: "George Russell", team: "Mercedes", points: 88, wins: 1, nationality: "United Kingdom" },
  { position: 4, name: "Charles Leclerc", team: "Ferrari", points: 75, wins: 0, nationality: "Monaco" },
  { position: 5, name: "Oscar Piastri", team: "McLaren", points: 58, wins: 0, nationality: "Australia" },
  { position: 6, name: "Lando Norris", team: "McLaren", points: 58, wins: 0, nationality: "United Kingdom" },
  { position: 7, name: "Max Verstappen", team: "Red Bull Racing", points: 43, wins: 0, nationality: "Netherlands" },
  { position: 8, name: "Pierre Gasly", team: "Alpine", points: 35, wins: 0, nationality: "France" },
  { position: 9, name: "Isack Hadjar", team: "Red Bull Racing", points: 26, wins: 0, nationality: "France" },
  { position: 10, name: "Liam Lawson", team: "Racing Bulls", points: 24, wins: 0, nationality: "New Zealand" },
  { position: 11, name: "Oliver Bearman", team: "Haas", points: 18, wins: 0, nationality: "United Kingdom" },
  { position: 12, name: "Franco Colapinto", team: "Alpine", points: 15, wins: 0, nationality: "Argentina" },
  { position: 13, name: "Arvid Lindblad", team: "Racing Bulls", points: 11, wins: 0, nationality: "United Kingdom" },
  { position: 14, name: "Carlos Sainz", team: "Williams", points: 6, wins: 0, nationality: "Spain" },
  { position: 15, name: "Alexander Albon", team: "Williams", points: 5, wins: 0, nationality: "Thailand" },
  { position: 16, name: "Esteban Ocon", team: "Haas", points: 3, wins: 0, nationality: "France" },
  { position: 17, name: "Gabriel Bortoleto", team: "Audi", points: 2, wins: 0, nationality: "Brazil" },
  { position: 18, name: "Fernando Alonso", team: "Aston Martin", points: 1, wins: 0, nationality: "Spain" },
  { position: 19, name: "Nico Hülkenberg", team: "Audi", points: 0, wins: 0, nationality: "Germany" },
  { position: 20, name: "Valtteri Bottas", team: "Cadillac", points: 0, wins: 0, nationality: "Finland" },
  { position: 21, name: "Sergio Pérez", team: "Cadillac", points: 0, wins: 0, nationality: "Mexico" },
  { position: 22, name: "Lance Stroll", team: "Aston Martin", points: 0, wins: 0, nationality: "Canada" },
].map((r) => ({ ...r, teamColor: TEAM_COLOR[r.team], positionChange: 0 }));

const f1ConstructorRows = [
  { position: 1, name: "Mercedes", points: 244, wins: 6 },
  { position: 2, name: "Ferrari", points: 165, wins: 0 },
  { position: 3, name: "McLaren", points: 116, wins: 0 },
  { position: 4, name: "Red Bull Racing", points: 69, wins: 0 },
  { position: 5, name: "Alpine", points: 50, wins: 0 },
  { position: 6, name: "Racing Bulls", points: 35, wins: 0 },
  { position: 7, name: "Haas", points: 21, wins: 0 },
  { position: 8, name: "Williams", points: 11, wins: 0 },
  { position: 9, name: "Audi", points: 2, wins: 0 },
  { position: 10, name: "Aston Martin", points: 1, wins: 0 },
  { position: 11, name: "Cadillac", points: 0, wins: 0 },
].map((r) => ({ ...r, teamColor: TEAM_COLOR[r.name], positionChange: 0 }));

export const seedStandings: StandingsTable[] = [
  { series: "f1", kind: "drivers", season: 2026, updatedAt: iso(now - 2 * H), rows: f1DriverRows },
  { series: "f1", kind: "constructors", season: 2026, updatedAt: iso(now - 2 * H), rows: f1ConstructorRows },
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
    completedAt: "2026-06-07T15:00:00.000Z",
    rows: [
      { position: 1, driver: "Kimi Antonelli", team: "Mercedes", time: "1:41:52.118", points: 25 },
      { position: 2, driver: "Lewis Hamilton", team: "Ferrari", time: "+4.226s", points: 18 },
      { position: 3, driver: "Pierre Gasly", team: "Alpine", time: "+9.873s", points: 15 },
      { position: 4, driver: "George Russell", team: "Mercedes", time: "+12.541s", points: 12 },
      { position: 5, driver: "Charles Leclerc", team: "Ferrari", time: "+15.092s", points: 10 },
    ],
  },
];
