import Image from "next/image";
import clsx from "clsx";
import { ImageIcon } from "lucide-react";
import type { ImageRef } from "@/lib/content/types";
import { hidePlaceholders } from "@/lib/site";

/**
 * Renders a CMS image, or (if none uploaded yet) a clearly labelled branded placeholder.
 * The parent controls size/aspect via className.
 */
export function Media({ image, className, sizes = "(min-width: 1024px) 33vw, 100vw", priority, rounded = true }: {
  image?: ImageRef;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
}) {
  if (!image?.url || image.placeholder) {
    // On the live domain: no "[Editable placeholder]" label, just the plain branded panel (decorative)
    if (hidePlaceholders()) {
      return <div aria-hidden className={clsx(!className?.includes("absolute") && "relative", "bg-ink bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--accent)_16%,transparent)_0_14px,transparent_14px_36px)]", rounded && "rounded-2xl", className)} />;
    }
    return (
      <div
        role="img"
        aria-label={image?.alt ?? "Placeholder image"}
        data-placeholder="true"
        className={clsx(
          !className?.includes("absolute") && "relative",
          "flex items-center justify-center overflow-hidden bg-ink text-center text-white",
          "bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--accent)_16%,transparent)_0_14px,transparent_14px_36px)]",
          rounded && "rounded-2xl",
          className,
        )}
      >
        <div className="flex flex-col items-center gap-2 px-4">
          <ImageIcon className="size-7 text-accent" aria-hidden />
          <span className="text-xs font-bold tracking-wider text-accent uppercase">[Editable placeholder]</span>
          <span className="text-sm font-semibold">{image?.placeholderLabel ?? "Upload a photo in Studio"}</span>
        </div>
      </div>
    );
  }
  return (
    <div className={clsx(!className?.includes("absolute") && "relative", "overflow-hidden bg-stone", rounded && "rounded-2xl", className)}>
      <Image src={image.url} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
