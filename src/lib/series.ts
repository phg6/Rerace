import type { SeriesKey } from "./types";

export interface SeriesMeta {
  key: SeriesKey;
  name: string;
  shortName: string;
  /** subtle accent used on tags/badges only — Rerace red stays primary */
  color: string;
  poster: string; // abstract fallback poster in /public/img
}

export const SERIES: Record<SeriesKey, SeriesMeta> = {
  f1: { key: "f1", name: "Formula 1", shortName: "F1", color: "#e10600", poster: "/img/series/f1.svg" },
  f2: { key: "f2", name: "Formula 2", shortName: "F2", color: "#0090d0", poster: "/img/series/f2.svg" },
  f3: { key: "f3", name: "Formula 3", shortName: "F3", color: "#d90478", poster: "/img/series/f3.svg" },
  motogp: { key: "motogp", name: "MotoGP", shortName: "MotoGP", color: "#ff8000", poster: "/img/series/motogp.svg" },
  nascar: { key: "nascar", name: "NASCAR", shortName: "NASCAR", color: "#ffd659", poster: "/img/series/nascar.svg" },
  indycar: { key: "indycar", name: "IndyCar", shortName: "IndyCar", color: "#0066cc", poster: "/img/series/indycar.svg" },
  wec: { key: "wec", name: "WEC / Endurance", shortName: "WEC", color: "#00a19a", poster: "/img/series/wec.svg" },
  wrc: { key: "wrc", name: "World Rally Championship", shortName: "WRC", color: "#ffcc00", poster: "/img/series/wrc.svg" },
  supercup: { key: "supercup", name: "Porsche Supercup", shortName: "Supercup", color: "#d5001c", poster: "/img/series/supercup.svg" },
  general: { key: "general", name: "Motorsport", shortName: "Motorsport", color: "#a1a1aa", poster: "/img/series/general.svg" },
};

export const SERIES_LIST = Object.values(SERIES).filter((s) => s.key !== "general");

export function seriesMeta(key: string | undefined | null): SeriesMeta {
  return SERIES[(key ?? "general") as SeriesKey] ?? SERIES.general;
}
