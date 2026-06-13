"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  ChevronLeft,
  Maximize,
  Minimize,
  MonitorPlay,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type HlsType from "hls.js";
import { useClientValue } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { LivePill } from "@/components/LiveBadge";

export type PlayerKind = "hls" | "mp4" | "iframe" | "youtube";

const ICON_BTN =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-200 transition-colors hover:bg-white/[0.14] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race";

function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
  );
  return m?.[1] ?? null;
}

function fmtTime(value: number): string {
  const s = !isFinite(value) || value < 0 ? 0 : value;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

/**
 * The custom Rerace player. HLS (hls.js / native Safari) and MP4 get full
 * custom controls; YouTube renders a branded click-to-activate
 * youtube-nocookie embed; other iframes embed as-is. An optional `overlay`
 * node (stream/language/onboard panel) slides over the video and is reachable
 * from the control bar and an edge tab — fullscreen included.
 */
export function ReracePlayer({
  url,
  kind,
  title,
  poster,
  autoPlay = false,
  live = false,
  videoId,
  overlay,
  className,
}: {
  url: string;
  kind: PlayerKind;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  live?: boolean;
  videoId?: string;
  overlay?: ReactNode;
  className?: string;
}) {
  const isVideo = kind === "hls" || kind === "mp4";
  const ytId = kind === "youtube" ? (videoId ?? youtubeId(url)) : null;
  const mode: PlayerKind = kind === "youtube" && !ytId ? "iframe" : kind;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HlsType | null>(null);
  const seekRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState<[number, number][]>([]);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const pipSupported = useClientValue(() => Boolean(document.pictureInPictureEnabled), false);
  const [levels, setLevels] = useState<{ index: number; height: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [ytActive, setYtActive] = useState(autoPlay);

  const playingRef = useRef(false);
  const settingsRef = useRef(false);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    settingsRef.current = settingsOpen;
  }, [settingsOpen]);

  const isLive = live || duration === Infinity;

  /* ---------------- media attach (hls.js / native / mp4) ---------------- */

  useEffect(() => {
    if (!isVideo) return;
    const video = videoRef.current;
    if (!video) return;
    setLevels([]);
    setCurrentLevel(-1);

    if (kind === "mp4" || video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    let hls: HlsType | null = null;
    let cancelled = false;
    import("hls.js").then(({ default: Hls }) => {
      if (cancelled || !videoRef.current) return;
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!hls) return;
          setLevels(
            hls.levels
              .map((l, index) => ({ index, height: l.height }))
              .filter((l) => l.height > 0)
              .sort((a, b) => b.height - a.height)
          );
        });
      } else {
        videoRef.current.src = url;
      }
    });
    return () => {
      cancelled = true;
      hls?.destroy();
      hlsRef.current = null;
    };
  }, [url, kind, isVideo]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.volume = volume;
      v.muted = muted;
    }
  }, [volume, muted, isVideo]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  /* ----------------------- control visibility ----------------------- */

  const bumpControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playingRef.current && !settingsRef.current) setControlsVisible(false);
    }, 2500);
  }, []);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    []
  );

  /* ----------------------------- actions ---------------------------- */

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => undefined);
    else v.pause();
  }, []);

  const skip = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration);
  }, []);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    else if (el.requestFullscreen) void el.requestFullscreen().catch(() => undefined);
  }, []);

  const togglePip = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {
      // PiP unavailable for this stream
    }
  }, []);

  const setQuality = useCallback((index: number) => {
    setCurrentLevel(index);
    if (hlsRef.current) hlsRef.current.currentLevel = index;
    setSettingsOpen(false);
  }, []);

  const updateBuffered = useCallback(() => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration) || v.duration <= 0) {
      setBuffered([]);
      return;
    }
    const segs: [number, number][] = [];
    for (let i = 0; i < v.buffered.length; i++) {
      segs.push([v.buffered.start(i) / v.duration, v.buffered.end(i) / v.duration]);
    }
    setBuffered(segs);
  }, []);

  const seekToClientX = useCallback((clientX: number) => {
    const bar = seekRef.current;
    const v = videoRef.current;
    if (!bar || !v || !isFinite(v.duration) || v.duration <= 0) return;
    const rect = bar.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    v.currentTime = frac * v.duration;
    setCurrentTime(v.currentTime);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isVideo) return;
    const key = e.key.toLowerCase();
    const interactive = (e.target as HTMLElement).closest("button, input, a");
    if (interactive && (key === " " || key === "k" || key.startsWith("arrow"))) return;
    if (key === " " || key === "k") {
      e.preventDefault();
      togglePlay();
    } else if (key === "arrowleft" && !isLive) {
      e.preventDefault();
      skip(-10);
    } else if (key === "arrowright" && !isLive) {
      e.preventDefault();
      skip(10);
    } else if (key === "arrowup") {
      e.preventDefault();
      setMuted(false);
      setVolume((v) => Math.min(1, Number((v + 0.1).toFixed(2))));
    } else if (key === "arrowdown") {
      e.preventDefault();
      setVolume((v) => Math.max(0, Number((v - 0.1).toFixed(2))));
    } else if (key === "f") {
      e.preventDefault();
      toggleFullscreen();
    } else if (key === "m") {
      e.preventDefault();
      toggleMute();
    }
    bumpControls();
  };

  const showControls = controlsVisible || !playing || settingsOpen;
  const progressPct = isFinite(duration) && duration > 0 ? (currentTime / duration) * 100 : 0;
  const ytPoster = poster || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "/img/series/general.svg");

  return (
    <div
      ref={containerRef}
      tabIndex={isVideo ? 0 : undefined}
      onKeyDown={isVideo ? onKeyDown : undefined}
      onMouseMove={isVideo ? bumpControls : undefined}
      onTouchStart={isVideo ? bumpControls : undefined}
      onMouseLeave={
        isVideo
          ? () => {
              if (playingRef.current && !settingsRef.current) setControlsVisible(false);
            }
          : undefined
      }
      className={cn(
        "group/player relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08] bg-black focus-visible:outline-2 focus-visible:outline-race",
        isVideo && playing && !showControls && "cursor-none",
        className
      )}
    >
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            playsInline
            autoPlay={autoPlay}
            poster={poster}
            title={title}
            onClick={togglePlay}
            onDoubleClick={toggleFullscreen}
            onPlay={() => {
              setPlaying(true);
              bumpControls();
            }}
            onPause={() => {
              setPlaying(false);
              setControlsVisible(true);
            }}
            onTimeUpdate={(e) => {
              setCurrentTime(e.currentTarget.currentTime);
            }}
            onDurationChange={(e) => setDuration(e.currentTarget.duration)}
            onProgress={updateBuffered}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => setBuffering(false)}
            onCanPlay={() => setBuffering(false)}
            className="h-full w-full"
          />

          {buffering && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-race" />
            </div>
          )}

          {!playing && !buffering && (
            <button
              onClick={togglePlay}
              aria-label="Play"
              className="absolute inset-0 z-10 flex items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-race"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-race/90 shadow-glow-red transition-all hover:scale-105 hover:bg-race-bright sm:h-20 sm:w-20">
                <Play className="ml-1 h-7 w-7 fill-white text-white sm:h-8 sm:w-8" />
              </span>
            </button>
          )}

          {/* ---------------------- control bar ---------------------- */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-3 pt-12 transition-opacity duration-300 sm:px-4",
              showControls ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            {isLive ? (
              <div className="live-bar mb-2.5" />
            ) : (
              <div
                ref={seekRef}
                role="slider"
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={Math.floor(isFinite(duration) ? duration : 0)}
                aria-valuenow={Math.floor(currentTime)}
                onPointerDown={(e) => {
                  draggingRef.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  seekToClientX(e.clientX);
                  bumpControls();
                }}
                onPointerMove={(e) => {
                  if (draggingRef.current) seekToClientX(e.clientX);
                }}
                onPointerUp={() => {
                  draggingRef.current = false;
                }}
                onPointerCancel={() => {
                  draggingRef.current = false;
                }}
                className="group/seek relative mb-2.5 h-4 cursor-pointer touch-none"
              >
                <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/[0.15]">
                  {buffered.map(([start, end], i) => (
                    <div
                      key={i}
                      className="absolute inset-y-0 bg-white/[0.22]"
                      style={{ left: `${start * 100}%`, width: `${(end - start) * 100}%` }}
                    />
                  ))}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-race"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-race-bright opacity-0 shadow-glow-red transition-opacity group-hover/seek:opacity-100"
                  style={{ left: `${progressPct}%` }}
                />
              </div>
            )}

            <div className="glass flex items-center gap-1 rounded-full px-2 py-1.5 sm:gap-1.5">
              <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className={ICON_BTN}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
              </button>

              {!isLive && (
                <>
                  <button
                    onClick={() => skip(-10)}
                    aria-label="Back 10 seconds"
                    className={cn(ICON_BTN, "hidden sm:inline-flex")}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => skip(10)}
                    aria-label="Forward 10 seconds"
                    className={cn(ICON_BTN, "hidden sm:inline-flex")}
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                </>
              )}

              <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className={ICON_BTN}>
                {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  setMuted(v === 0);
                }}
                aria-label="Volume"
                className="hidden w-20 accent-race sm:block"
              />

              <div className="ml-1.5 mr-1 flex items-center">
                {isLive ? (
                  <LivePill />
                ) : (
                  <span className="whitespace-nowrap text-xs tabular-nums text-zinc-300">
                    {fmtTime(currentTime)} <span className="text-zinc-500">/ {fmtTime(duration)}</span>
                  </span>
                )}
              </div>

              <div className="flex-1" />

              {overlay != null && (
                <button
                  onClick={() => setOverlayOpen((o) => !o)}
                  aria-label="Stream sources"
                  className={cn(ICON_BTN, overlayOpen && "bg-white/[0.14] text-race-bright")}
                >
                  <MonitorPlay className="h-4 w-4" />
                </button>
              )}

              {levels.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setSettingsOpen((o) => !o)}
                    aria-label="Quality settings"
                    aria-expanded={settingsOpen}
                    className={cn(ICON_BTN, settingsOpen && "bg-white/[0.14] text-race-bright")}
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  {settingsOpen && (
                    <div className="glass-strong absolute bottom-11 right-0 z-30 w-36 rounded-2xl p-1.5">
                      <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Quality
                      </p>
                      {[{ index: -1, height: 0 }, ...levels].map((l) => (
                        <button
                          key={l.index}
                          onClick={() => setQuality(l.index)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                            currentLevel === l.index
                              ? "bg-race/20 text-race-bright"
                              : "text-zinc-200 hover:bg-white/[0.08]"
                          )}
                        >
                          {l.index === -1 ? "Auto" : `${l.height}p`}
                          {currentLevel === l.index && <Check className="h-3.5 w-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {pipSupported && (
                <button
                  onClick={togglePip}
                  aria-label="Picture in picture"
                  className={cn(ICON_BTN, "hidden sm:inline-flex")}
                >
                  <PictureInPicture2 className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                className={ICON_BTN}
              >
                {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </>
      ) : mode === "youtube" && ytId ? (
        ytActive ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&autoplay=1&playsinline=1`}
            title={title ?? "Video"}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            className="h-full w-full"
          />
        ) : (
          <button
            onClick={() => setYtActive(true)}
            aria-label={`Play ${title ?? "video"}`}
            className="group/yt absolute inset-0 block w-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-race"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ytPoster} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="img-overlay" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-race/90 shadow-glow-red transition-all group-hover/yt:scale-105 group-hover/yt:bg-race-bright sm:h-20 sm:w-20">
                <Play className="ml-1 h-7 w-7 fill-white text-white sm:h-8 sm:w-8" />
              </span>
            </span>
            {title && (
              <span className="absolute inset-x-0 bottom-0 z-10 block truncate px-5 pb-4 text-left text-sm font-semibold text-white">
                {title}
              </span>
            )}
          </button>
        )
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

      {/* Subtle wordmark watermark */}
      <span className="font-display pointer-events-none absolute right-4 top-3 z-20 select-none text-[10px] uppercase tracking-[0.32em] text-white/25">
        Rerace
      </span>

      {/* ------------- slide-over panel (streams / languages) ------------- */}
      {overlay != null && (
        <>
          {!overlayOpen && (
            <button
              onClick={() => setOverlayOpen(true)}
              aria-label="Open stream panel"
              className="absolute right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-2xl border border-r-0 border-white/[0.12] bg-black/55 px-1.5 py-3 opacity-70 backdrop-blur-xl transition-all hover:border-race/50 hover:opacity-100"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-zinc-300" />
              <span className="font-display text-[9px] uppercase tracking-[0.25em] text-zinc-300 [writing-mode:vertical-rl]">
                Streams
              </span>
            </button>
          )}
          <div
            className={cn(
              "absolute inset-y-0 right-0 z-40 w-full max-w-[380px] transition-transform duration-300",
              overlayOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
            )}
            aria-hidden={!overlayOpen}
            inert={!overlayOpen}
          >
            <div className="flex h-full flex-col border-l border-white/[0.12] bg-black/75 backdrop-blur-2xl">
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <span className="font-display text-[10px] uppercase tracking-[0.28em] text-race-bright">
                  Streams
                </span>
                <button
                  onClick={() => setOverlayOpen(false)}
                  aria-label="Close stream panel"
                  className={ICON_BTN}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{overlay}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
