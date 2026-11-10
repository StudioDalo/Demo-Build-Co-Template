"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { ChecklistForm } from "@/components/forms/ChecklistForm";
import { storageKey } from "@/config";

const KEY = storageKey("exit-shown", "-");
const SKIP = ["/get-a-quote", "/planning-checklist", "/leave-a-review"];

/**
 * "Not ready?" lead-magnet prompt. Desktop: mouse leaves through the top of the window.
 * Mobile: after scrolling 60% of a page. Shown at most once per session.
 */
export function ExitPrompt({ heading, text, cta, enabled }: { heading: string; text: string; cta: string; enabled: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || SKIP.some((p) => pathname.startsWith(p))) return;
    let shown = false;
    try {
      shown = sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (shown) return;
    const show = () => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      setOpen(true);
      cleanup();
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) show();
    };
    const onScroll = () => {
      if (window.innerWidth >= 768) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.6) show();
    };
    // Don't nag immediately
    const timer = window.setTimeout(() => {
      document.addEventListener("mouseout", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
    }, 4000);
    function cleanup() {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", onLeave);
      window.removeEventListener("scroll", onScroll);
    }
    return cleanup;
  }, [enabled, pathname]);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.querySelector<HTMLElement>("input")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-3 sm:items-center" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="exit-heading" data-testid="exit-prompt" className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={() => setOpen(false)} className="absolute top-3 right-3 grid size-10 place-items-center rounded-full hover:bg-sand" aria-label="Close">
          <X className="size-5" aria-hidden />
        </button>
        <p className="eyebrow text-muted">Free PDF</p>
        <h2 id="exit-heading" className="mt-1 text-2xl font-extrabold">{heading}</h2>
        <p className="mt-2 text-muted">{text}</p>
        <div className="mt-5"><ChecklistForm cta={cta} location="exit-prompt" /></div>
      </div>
    </div>
  );
}
