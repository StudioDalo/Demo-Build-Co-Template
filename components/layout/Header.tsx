"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import clsx from "clsx";
import type { SiteSettings } from "@/lib/content/types";
import { telHref } from "@/lib/phone";
import { Logo } from "@/components/ui/Logo";

export function SiteLogo({ logo, className }: { logo: SiteSettings["logo"]; className?: string }) {
  if (logo?.url && !logo.url.startsWith("/brand/")) {
    return <Image src={logo.url} alt={logo.alt} width={logo.width ?? 300} height={logo.height ?? 190} className={clsx("h-auto", className)} priority />;
  }
  return <Logo className={className} />;
}

export function Header({ s }: { s: Pick<SiteSettings, "logo" | "nav" | "headerCta" | "phones" | "businessName"> }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const primary = s.phones[0];

  return (
    <header className="sticky top-0 z-50 bg-ink text-white" data-section="header">
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="shrink-0" title={`${s.businessName} home`}>
          <SiteLogo logo={s.logo} className="w-[80px] lg:w-[112px]" />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[15px] font-semibold">
            {s.nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={clsx("py-2 transition-colors hover:text-accent", pathname.startsWith(l.href) && "text-accent")} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          {primary && (
            <a href={telHref(primary.number)} className="hidden items-center gap-2 font-bold whitespace-nowrap hover:text-accent md:flex" data-track-location="header">
              <Phone className="size-5 text-accent" aria-hidden /> {primary.number}
            </a>
          )}
          <Link href={s.headerCta.href} className="btn-primary hidden min-h-11 px-4 py-2 sm:inline-flex" data-track="cta_click" data-track-location="header">
            {s.headerCta.label}
          </Link>
          {primary && (
            <a href={telHref(primary.number)} className="grid size-11 place-items-center rounded-xl bg-white/10 md:hidden" aria-label={`Call ${primary.number}`} data-track-location="header">
              <Phone className="size-5 text-accent" aria-hidden />
            </a>
          )}
          <button type="button" className="grid size-11 place-items-center rounded-xl bg-white/10 lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>
      <div id="mobile-menu" hidden={!open} className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-ink lg:hidden">
        <nav aria-label="Mobile" className="container-x py-6">
          <ul className="space-y-1 text-2xl font-bold">
            {[...s.nav, { label: "How we work", href: "/how-we-work" }, { label: "FAQs", href: "/faqs" }, { label: "Contact", href: "/contact" }].map((l) => (
              <li key={l.href}><Link href={l.href} className="block py-3">{l.label}</Link></li>
            ))}
          </ul>
          <Link href={s.headerCta.href} className="btn-primary mt-6 w-full" data-track="cta_click" data-track-location="header">{s.headerCta.label}</Link>
          <div className="mt-6 space-y-2">
            {s.phones.map((p) => (
              <a key={p.number} href={telHref(p.number)} className="flex items-center gap-3 text-lg font-bold"><Phone className="size-5 text-accent" aria-hidden /> {p.number}</a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
