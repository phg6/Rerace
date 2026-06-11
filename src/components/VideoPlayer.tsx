"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Universal player: HLS (via hls.js, native on Safari) or iframe embeds.
 * Wrapped in a rounded glass frame; fills its parent width at 16:9.
 */
export function VideoPlayer({
  url,
  kind,
  title,
  poster,
  className,
  autoPlay = false,
}: {
  url: string;
  kind: "hls" | "iframe";
  title?: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (kind !== "hls") return;
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }

    let hls: import("hls.js").default | null = null;
    let cancelled = false;
    import("hls.js").then(({ default: Hls }) => {
      if (cancelled || !videoRef.current) return;
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
      } else {
        videoRef.current.src = url;
      }
    });
    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [url, kind]);

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08] bg-black",
        className
      )}
    >
      {kind === "hls" ? (
        <video
          ref={videoRef}
          controls
          playsInline
          autoPlay={autoPlay}
          poster={poster}
          title={title}
          className="h-full w-full"
        />
      ) : (
        <iframe
          src={url}
          title={title ?? "Stream"}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          className="h-full w-full"
        />
      )}
    </div>
  );
}
