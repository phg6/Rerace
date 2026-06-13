import type { RaceEvent, EventSession } from "../types";

/**
 * 2026 F1 season calendar — the single source of truth for auto-generated
 * F1 events. Admin never creates F1 events by hand: buildSeasonEvents()
 * generates them with ids "f1-2026-r{round}"; a CMS event with the same
 * eventId overrides/extends the generated one (that's how streams attach).
 *
 * 22 rounds (Bahrain and Saudi Arabia were cancelled and rounds renumbered).
 * Quirks: Azerbaijan races on Saturday Sep 26; Las Vegas races Saturday
 * local time (Nov 22 in UTC); Madrid's new "Madring" holds the Spanish GP
 * title while Barcelona's race is the Barcelona-Catalunya GP.
 */

export interface CalendarRound {
  round: number;
  name: string;
  circuit: string;
  country: string;
  /** race day in UTC, YYYY-MM-DD */
  raceDateUtc: string;
  sprint: boolean;
  /** race start hour in UTC (defaults to 13:00) */
  raceHourUtc?: number;
}

export const F1_SEASON = 2026;

export const F1_CALENDAR_2026: CalendarRound[] = [
  { round: 1, name: "Australian Grand Prix", circuit: "Albert Park Circuit", country: "Australia", raceDateUtc: "2026-03-08", sprint: false, raceHourUtc: 4 },
  { round: 2, name: "Chinese Grand Prix", circuit: "Shanghai International Circuit", country: "China", raceDateUtc: "2026-03-15", sprint: true, raceHourUtc: 7 },
  { round: 3, name: "Japanese Grand Prix", circuit: "Suzuka International Racing Course", country: "Japan", raceDateUtc: "2026-03-29", sprint: false, raceHourUtc: 5 },
  { round: 4, name: "Miami Grand Prix", circuit: "Miami International Autodrome", country: "United States", raceDateUtc: "2026-05-03", sprint: true, raceHourUtc: 20 },
  { round: 5, name: "Canadian Grand Prix", circuit: "Circuit Gilles Villeneuve", country: "Canada", raceDateUtc: "2026-05-24", sprint: true, raceHourUtc: 18 },
  { round: 6, name: "Monaco Grand Prix", circuit: "Circuit de Monaco", country: "Monaco", raceDateUtc: "2026-06-07", sprint: false },
  { round: 7, name: "Barcelona-Catalunya Grand Prix", circuit: "Circuit de Barcelona-Catalunya", country: "Spain", raceDateUtc: "2026-06-14", sprint: false },
  { round: 8, name: "Austrian Grand Prix", circuit: "Red Bull Ring", country: "Austria", raceDateUtc: "2026-06-28", sprint: false },
  { round: 9, name: "British Grand Prix", circuit: "Silverstone Circuit", country: "United Kingdom", raceDateUtc: "2026-07-05", sprint: true, raceHourUtc: 14 },
  { round: 10, name: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", country: "Belgium", raceDateUtc: "2026-07-19", sprint: false },
  { round: 11, name: "Hungarian Grand Prix", circuit: "Hungaroring", country: "Hungary", raceDateUtc: "2026-07-26", sprint: false },
  { round: 12, name: "Dutch Grand Prix", circuit: "Circuit Zandvoort", country: "Netherlands", raceDateUtc: "2026-08-23", sprint: true },
  { round: 13, name: "Italian Grand Prix", circuit: "Autodromo Nazionale Monza", country: "Italy", raceDateUtc: "2026-09-06", sprint: false },
  { round: 14, name: "Spanish Grand Prix", circuit: "Madring (Madrid street circuit, IFEMA)", country: "Spain", raceDateUtc: "2026-09-13", sprint: false },
  { round: 15, name: "Azerbaijan Grand Prix", circuit: "Baku City Circuit", country: "Azerbaijan", raceDateUtc: "2026-09-26", sprint: false, raceHourUtc: 11 },
  { round: 16, name: "Singapore Grand Prix", circuit: "Marina Bay Street Circuit", country: "Singapore", raceDateUtc: "2026-10-11", sprint: true, raceHourUtc: 12 },
  { round: 17, name: "United States Grand Prix", circuit: "Circuit of the Americas", country: "United States", raceDateUtc: "2026-10-25", sprint: false, raceHourUtc: 19 },
  { round: 18, name: "Mexico City Grand Prix", circuit: "Autódromo Hermanos Rodríguez", country: "Mexico", raceDateUtc: "2026-11-01", sprint: false, raceHourUtc: 20 },
  { round: 19, name: "São Paulo Grand Prix", circuit: "Autódromo José Carlos Pace (Interlagos)", country: "Brazil", raceDateUtc: "2026-11-08", sprint: false, raceHourUtc: 17 },
  { round: 20, name: "Las Vegas Grand Prix", circuit: "Las Vegas Strip Circuit", country: "United States", raceDateUtc: "2026-11-22", sprint: false, raceHourUtc: 4 },
  { round: 21, name: "Qatar Grand Prix", circuit: "Lusail International Circuit", country: "Qatar", raceDateUtc: "2026-11-29", sprint: false, raceHourUtc: 16 },
  { round: 22, name: "Abu Dhabi Grand Prix", circuit: "Yas Marina Circuit", country: "United Arab Emirates", raceDateUtc: "2026-12-06", sprint: false },
];

const H = 3600_000;
const D = 24 * H;
const iso = (t: number) => new Date(t).toISOString();

export function f1EventId(round: number): string {
  return `f1-${F1_SEASON}-r${round}`;
}

/** Race start (UTC ms) for a calendar round. */
export function roundRaceStartMs(round: CalendarRound): number {
  return Date.parse(`${round.raceDateUtc}T00:00:00Z`) + (round.raceHourUtc ?? 13) * H;
}

function roundSessions(round: CalendarRound): EventSession[] {
  const race = roundRaceStartMs(round);
  if (round.sprint) {
    return [
      { key: "fp1", name: "Practice 1", startsAt: iso(race - 50.5 * H), endsAt: iso(race - 49.5 * H) },
      { key: "sprint-quali", name: "Sprint Qualifying", startsAt: iso(race - 46.5 * H), endsAt: iso(race - 45.5 * H) },
      { key: "sprint", name: "Sprint", startsAt: iso(race - 27 * H), endsAt: iso(race - 26 * H) },
      { key: "quali", name: "Qualifying", startsAt: iso(race - 23 * H), endsAt: iso(race - 22 * H) },
      { key: "race", name: "Race", startsAt: iso(race), endsAt: iso(race + 2 * H) },
    ];
  }
  return [
    { key: "fp1", name: "Practice 1", startsAt: iso(race - 50 * H), endsAt: iso(race - 49 * H) },
    { key: "fp2", name: "Practice 2", startsAt: iso(race - 46.5 * H), endsAt: iso(race - 45.5 * H) },
    { key: "fp3", name: "Practice 3", startsAt: iso(race - 26.5 * H), endsAt: iso(race - 25.5 * H) },
    { key: "quali", name: "Qualifying", startsAt: iso(race - 23 * H), endsAt: iso(race - 22 * H) },
    { key: "race", name: "Race", startsAt: iso(race), endsAt: iso(race + 2 * H) },
  ];
}

export function roundToEvent(round: CalendarRound): RaceEvent {
  return {
    id: f1EventId(round.round),
    title: `Formula 1 ${round.name}`,
    series: "f1",
    circuit: round.circuit,
    country: round.country,
    image: "/img/series/f1.svg",
    description: `Round ${round.round} of the ${F1_SEASON} FIA Formula One World Championship — ${round.circuit}, ${round.country}.${round.sprint ? " Sprint weekend." : ""}`,
    sessions: roundSessions(round),
    streams: [],
  };
}

/**
 * Auto-generated F1 events for the current window: races within the last
 * 3 days plus the next `upcoming` rounds (default 6). Pass { all: true }
 * for the full season (e.g. schedule page).
 */
export function buildSeasonEvents(opts?: { all?: boolean; upcoming?: number; now?: number }): RaceEvent[] {
  const now = opts?.now ?? Date.now();
  const upcoming = opts?.upcoming ?? 6;
  if (opts?.all) return F1_CALENDAR_2026.map(roundToEvent);
  let upcomingCount = 0;
  const out: RaceEvent[] = [];
  for (const round of F1_CALENDAR_2026) {
    const race = roundRaceStartMs(round);
    if (race < now) {
      if (race >= now - 3 * D) out.push(roundToEvent(round));
      continue;
    }
    if (upcomingCount < upcoming) {
      out.push(roundToEvent(round));
      upcomingCount++;
    }
  }
  return out;
}
