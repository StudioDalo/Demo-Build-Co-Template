import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/site";
import { siteConfig } from "@/config";
import "./globals.css";

const inter = localFont({
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});
const archivo = localFont({
  src: "../node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2",
  variable: "--font-archivo",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: siteConfig.brand.appName,
  formatDetection: { telephone: false },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }] },
};

/** The client's design tokens as CSS variables (see app/globals.css). */
function themeVars(): React.CSSProperties {
  const t = siteConfig.theme;
  return {
    "--accent": t.accent, "--dark": t.dark, "--paper": t.paper, "--sand": t.sand, "--stone": t.stone, "--muted": t.muted,
    "--r-lg": t.radius.lg, "--r-xl": t.radius.xl, "--r-2xl": t.radius["2xl"],
  } as React.CSSProperties;
}

export const viewport: Viewport = { themeColor: siteConfig.theme.dark.toLowerCase(), width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.location.locale} className={`${inter.variable} ${archivo.variable}`} style={themeVars()}>
      <body>{children}</body>
    </html>
  );
}
