"use client";

import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import type { TikTokItem } from "@/lib/content/types";
import { Media } from "@/components/ui/Media";

function TikTokLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 1 1-2-2.7V9.2a6.3 6.3 0 1 0 5.4 6.2V8.6a8.2 8.2 0 0 0 4.8 1.5V6.8l-1-.1Z" />
    </svg>
  );
}

/** Muted looping preview that only loads/plays while on screen. */
function PreviewVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!v.src) v.src = src;
        void v.play().catch(() => undefined);
      } else v.pause();
    }, { threshold: 0.4 });
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  return <video ref={ref} muted loop playsInline preload="none" aria-hidden className="absolute inset-0 size-full object-cover" />;
}

/**
 * Each tile is a link to the exact TikTok post URL the owner pasted in Studio.
 * Opens in a new tab with rel="noopener noreferrer". Nothing is scraped from TikTok.
 */
export function TikTokGallery({ items, viewLabel }: { items: TikTokItem[]; viewLabel: string }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" data-testid="tiktok-gallery">
      {items.map((t) => (
        <li key={t.id}>
          <a
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block focus-visible:outline-offset-4"
            data-testid="tiktok-item"
            data-tiktok-title={t.title}
            data-tiktok-type={t.projectType}
          >
            <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-ink">
              {t.videoUrl ? (
                <>
                  {t.thumbnail?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.thumbnail.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                  )}
                  <PreviewVideo src={t.videoUrl} />
                </>
              ) : (
                <Media image={t.thumbnail} className="absolute inset-0" rounded={false} sizes="(min-width: 1024px) 25vw, 50vw" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg transition-transform group-hover:scale-110">
                <Play className="ml-1 size-6 fill-current" aria-hidden />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                {t.projectType && <p className="text-xs font-bold tracking-wide text-accent uppercase">{t.projectType}</p>}
                <p className="mt-1 line-clamp-2 text-sm font-bold sm:text-base">{t.title}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-ink">
                  <TikTokLogo className="size-3.5" /> {viewLabel}
                  <span className="sr-only"> (opens in a new tab)</span>
                </p>
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
