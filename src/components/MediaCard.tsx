import Link from "next/link";
import { Clock, Lock, Play } from "lucide-react";
import { TiltCard } from "./TiltCard";
import { SeriesTag } from "./SeriesTag";
import { seriesMeta } from "@/lib/series";
import { formatDuration, cn } from "@/lib/utils";

export interface MediaCardProps {
  href: string;
  title: string;
  series: string;
  image?: string;
  /** small line under the title (e.g. "Qualifying · Round 8" or source) */
  meta?: string;
  /** revealed on hover (expand preview) */
  description?: string;
  durationMin?: number;
  year?: number;
  locked?: boolean;
  className?: string;
}

/** 16:9 media card: tilt + red glow + expand-preview on hover. */
export function MediaCard(props: MediaCardProps) {
  const img = props.image || seriesMeta(props.series).poster;
  return (
    <Link href={props.href} className={cn("block focus-visible:outline-none", props.className)}>
      <TiltCard className="h-full">
        <div className="relative aspect-video w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
          <div className="img-overlay" />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <SeriesTag series={props.series} />
            {props.locked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                <Lock className="h-3 w-3" /> Members
              </span>
            )}
          </div>
          {/* play affordance on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-race/90 shadow-glow-red">
              <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">{props.title}</h3>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-400">
            {props.meta && <span className="line-clamp-1">{props.meta}</span>}
            {props.year && <span>· {props.year}</span>}
            {props.durationMin ? (
              <span className="inline-flex shrink-0 items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(props.durationMin)}
              </span>
            ) : null}
          </div>
          {/* expand preview: revealed on hover */}
          {props.description && (
            <p className="mt-0 line-clamp-2 max-h-0 overflow-hidden text-xs leading-relaxed text-zinc-400 opacity-0 transition-all duration-300 group-hover:mt-2 group-hover:max-h-12 group-hover:opacity-100">
              {props.description}
            </p>
          )}
        </div>
      </TiltCard>
    </Link>
  );
}
