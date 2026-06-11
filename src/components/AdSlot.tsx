import { getAdSlot } from "@/lib/data/content";
import { cn } from "@/lib/utils";

/**
 * CMS-managed ad placement (HilltopAds / AdMaven snippets or partner banners).
 * Renders nothing when the slot is inactive or unset, so layouts stay clean.
 * Known keys: mega-menu, news-feed, sidebar, between-rows, watch-below.
 */
export async function AdSlot({
  slotKey,
  className,
}: {
  slotKey: string;
  className?: string;
}) {
  const slot = await getAdSlot(slotKey).catch(() => null);
  if (!slot || !slot.active) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-[var(--radius-card)]", className)}>
      <span className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[9px] uppercase tracking-widest text-zinc-400">
        Ad
      </span>
      {slot.mode === "code" && slot.code ? (
        <div dangerouslySetInnerHTML={{ __html: slot.code }} />
      ) : slot.image ? (
        <a href={slot.link ?? "#"} target="_blank" rel="noopener sponsored">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slot.image} alt={slot.label ?? "Sponsored"} className="w-full" />
        </a>
      ) : null}
    </div>
  );
}
