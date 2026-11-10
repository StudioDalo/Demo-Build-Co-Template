"use client";

import { useId, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import type { BeforeAfter } from "@/lib/content/types";
import { Media } from "@/components/ui/Media";

/** Drag-handle comparison. A native range input drives it, so keyboard and screen readers work too. */
export function BeforeAfterSlider({ item }: { item: BeforeAfter }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const id = useId();

  const fromPointer = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <figure className="m-0">
      <div
        ref={ref}
        data-testid="ba-slider"
        className="relative aspect-[4/3] touch-pan-y overflow-hidden rounded-2xl bg-stone select-none"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        <Media image={item.after} className="absolute inset-0" rounded={false} sizes="(min-width: 1024px) 50vw, 100vw" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} data-testid="ba-before">
          <Media image={item.before} className="absolute inset-0" rounded={false} sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white uppercase">Before</span>
        <span className="absolute top-3 right-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink uppercase">After</span>
        <div className="pointer-events-none absolute inset-y-0 w-1 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg ring-4 ring-accent">
            <MoveHorizontal className="size-6" aria-hidden />
          </div>
        </div>
        <label htmlFor={id} className="sr-only">Compare before and after: {item.title}</label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-valuetext={`${Math.round(pos)}% before`}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
          data-testid="ba-range"
        />
      </div>
      <figcaption className="mt-3">
        <span className="font-bold">{item.title}</span>
        {item.caption && <span className="block text-sm text-muted">{item.caption}</span>}
      </figcaption>
    </figure>
  );
}
