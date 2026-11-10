import { sanityConfigured } from "@/lib/sanity/env";
import { StudioLoader } from "./StudioLoader";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 font-sans" data-testid="studio-setup">
        <h1 className="text-3xl font-extrabold">Connect Sanity to edit the website</h1>
        <p className="mt-4 text-lg">The content editor isn&apos;t connected yet. The website is currently showing its built-in starter content.</p>
        <ol className="mt-6 list-decimal space-y-2 pl-6">
          <li>Create a free project at sanity.io/manage.</li>
          <li>Add <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and <code>NEXT_PUBLIC_SANITY_DATASET</code> to the Vercel environment variables.</li>
          <li>Add this site&apos;s address as a CORS origin in Sanity (with credentials).</li>
          <li>Run <code>npm run seed:sanity</code> once to copy the starter content in.</li>
        </ol>
        <p className="mt-6">Full steps are in <code>docs/HANDOVER-CHECKLIST.md</code>.</p>
      </main>
    );
  }
  return <StudioLoader />;
}
