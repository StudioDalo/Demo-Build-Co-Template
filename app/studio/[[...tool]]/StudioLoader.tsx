"use client";

import dynamic from "next/dynamic";

/** The Studio bundle (and its global CSS) only loads when Sanity is configured and this renders. */
const Studio = dynamic(() => import("./Studio").then((m) => m.Studio), { ssr: false, loading: () => <p style={{ padding: 24 }}>Loading editor…</p> });

export function StudioLoader() {
  return <Studio />;
}
