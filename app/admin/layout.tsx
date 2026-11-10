import type { Metadata } from "next";
import { siteConfig } from "@/config";

export const metadata: Metadata = { title: `Leads dashboard | ${siteConfig.brand.appName}`, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-sand">{children}</div>;
}
