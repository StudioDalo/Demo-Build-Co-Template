import Link from "next/link";
import clsx from "clsx";
import type { LeadScore } from "@/lib/leads/score";
import { logout } from "./actions";
import { siteConfig } from "@/config";

export function ScoreBadge({ score }: { score: LeadScore | null }) {
  if (!score) return <span className="text-xs text-muted">–</span>;
  return (
    <span className={clsx("rounded-full px-2.5 py-1 text-xs font-bold uppercase", score === "hot" && "bg-red-600 text-white", score === "warm" && "bg-accent text-ink", score === "cold" && "bg-stone text-ink")}>
      {score}
    </span>
  );
}

export function AdminBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/admin" className="font-display text-lg font-extrabold">{siteConfig.brand.shortName} <span className="text-accent">Leads</span></Link>
        <div className="flex items-center gap-3">
          {children}
          <Link href="/studio" className="text-sm font-semibold hover:text-accent">Edit website</Link>
          <form action={logout}><button className="text-sm font-semibold hover:text-accent">Sign out</button></form>
        </div>
      </div>
    </header>
  );
}
