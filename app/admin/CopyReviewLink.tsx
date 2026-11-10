"use client";

import { useState } from "react";
import { Copy, MessageCircle } from "lucide-react";

export function CopyReviewLink({ url, message, platform }: { url: string; message: string; platform: string }) {
  const [copied, setCopied] = useState(false);
  if (!url) {
    return <p className="mt-3 rounded-lg border-2 border-dashed border-accent bg-accent/10 p-3 text-sm font-semibold" data-testid="review-link-missing">Add your {platform} or Google review link in Studio → Site settings → Trust &amp; reviews → “Review link for customers”.</p>;
  }
  const msg = message.replace("{url}", url);
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <input readOnly value={url} className="input min-h-10 flex-1 py-2" aria-label="Review link" data-testid="review-link" />
      <button type="button" className="btn-dark min-h-10 py-2" onClick={async () => { await navigator.clipboard?.writeText(url).catch(() => undefined); setCopied(true); }}>
        <Copy className="size-4" aria-hidden /> {copied ? "Copied" : "Copy"}
      </button>
      <a className="btn-outline min-h-10 py-2" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" aria-hidden /> WhatsApp</a>
    </div>
  );
}
