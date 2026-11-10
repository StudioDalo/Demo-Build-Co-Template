"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Pause, Play } from "lucide-react";
import type { VideoRef } from "@/lib/content/types";
import { track } from "@/lib/track";

/**
 * The hero "window": 1 or 3 muted, looping videos with swipe + dots.
 * Videos only download when their slide is active and the hero is on screen;
 * the poster image shows until then (and permanently for reduced-motion users).
 */
export function HeroVideos({ videos }: { videos: VideoRef[] }) {
  const slides = videos.filter((v) => v.url || v.poster?.url).slice(0, 3);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  /** Don't compete with the first paint: videos start downloading once the page is idle. */
  const [idle, setIdle] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
    const markIdle = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
      if (ric) ric(() => setIdle(true), { timeout: 2500 });
      else window.setTimeout(() => setIdle(true), 1200);
    };
    if (document.readyState === "complete") markIdle();
    else window.addEventListener("load", markIdle, { once: true });
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Play only the active video while visible
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index && visible && !paused) void v.play().catch(() => undefined);
      else v.pause();
    });
  }, [index, visible, paused]);

  // Gentle auto-advance until the visitor interacts
  useEffect(() => {
    if (slides.length < 2 || interacted || paused || !visible) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), 8000);
    return () => window.clearTimeout(t);
  }, [index, slides.length, interacted, paused, visible]);

  const go = (i: number, action: "swipe" | "select" | "next" | "previous" = "select") => {
    track("hero_video_interaction", { action });
    setInteracted(true);
    setIndex((i + slides.length) % slides.length);
  };

  if (!slides.length) return null;
  return (
    <div
      ref={rootRef}
      className="relative"
      data-testid="hero-videos"
      aria-roledescription="carousel"
      aria-label="Recent builds"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), "swipe");
        touchX.current = null;
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1, "next");
        if (e.key === "ArrowLeft") go(index - 1, "previous");
      }}
    >
      {/* window frame */}
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black shadow-2xl ring-8 ring-white/10 sm:aspect-[4/5] sm:mx-auto sm:max-w-md lg:max-w-none">
        {slides.map((v, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}${v.title ? `: ${v.title}` : ""}`}
            aria-hidden={i !== index}
            data-active={i === index}
            className={clsx("absolute inset-0 transition-opacity duration-700", i === index ? "opacity-100" : "opacity-0")}
          >
            {v.poster?.url && (i === 0 || idle) && (
              <Image src={v.poster.url} alt="" fill priority={i === 0} sizes="(min-width: 1024px) 40vw, (min-width: 640px) 448px, 100vw" className="object-cover" />
            )}
            {v.url && (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                className="absolute inset-0 size-full object-cover"
                src={idle && visible && (i === index || interacted) ? v.url : undefined}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
              />
            )}
          </div>
        ))}
        {/* mullion: a subtle nod to the window in the logo */}
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-white/20 ring-inset" />
        {slides[index]?.title && (
          <p className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase backdrop-blur">{slides[index].title}</p>
        )}
        <button
          type="button"
          onClick={() => {
            track("hero_video_interaction", { action: paused ? "play" : "pause" });
            setInteracted(true);
            setPaused((p) => !p);
          }}
          className="absolute right-4 bottom-4 grid size-11 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
          aria-label={paused ? "Play video" : "Pause video"}
        >
          {paused ? <Play className="size-5" aria-hidden /> : <Pause className="size-5" aria-hidden />}
        </button>
      </div>
      {slides.length > 1 && (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Choose video">
          {slides.map((v, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show video ${i + 1}${v.title ? `: ${v.title}` : ""}`}
              onClick={() => go(i)}
              className="grid size-11 place-items-center"
            >
              <span className={clsx("block h-2.5 rounded-full transition-all", i === index ? "w-8 bg-accent" : "w-2.5 bg-white/40")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
