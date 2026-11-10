import clsx from "clsx";

/**
 * DEMO brand marks: a simple neutral wordmark for the fictional "Demo Build Co".
 * Replace with the client's logo (or upload a logo in Studio → Site settings, which the header uses instead).
 */
export function Logo({ className, tone = "light", title = "Demo Build Co (demo logo)" }: { className?: string; tone?: "light" | "dark"; title?: string }) {
  const c = tone === "light" ? "#ffffff" : "#1f2933";
  return (
    <svg viewBox="0 0 300 190" className={clsx("h-auto", className)} role="img" aria-label={title} fill="none">
      <title>{title}</title>
      {/* simple house outline */}
      <path d="M100 82 L150 40 L200 82" stroke={c} strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M114 72 V104 H186 V72" stroke={c} strokeWidth="9" strokeLinejoin="round" />
      <rect x="141" y="80" width="18" height="24" fill="#4FD1C5" />
      <text x="150" y="150" textAnchor="middle" fill={c} style={{ font: "800 40px var(--font-archivo), Arial, sans-serif", letterSpacing: "-0.5px" }}>
        Demo Build Co
      </text>
      <text x="150" y="180" textAnchor="middle" fill="#4FD1C5" style={{ font: "600 16px var(--font-inter), Arial, sans-serif", letterSpacing: "4px" }}>
        DEMO LOGO
      </text>
    </svg>
  );
}

/** Browser-tab icon (served at /icon.svg). */
export const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1f2933"/><path d="M14 32 L32 16 L50 32" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M19 28 V46 H45 V28" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><rect x="28" y="34" width="8" height="12" fill="#4FD1C5"/></svg>`;
