import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { siteConfig } from "@/config";

export default function NotFound() {
  return (
    <>
      <header className="bg-ink py-4"><div className="container-x"><Link href="/" title={`${siteConfig.brand.appName} home`}><Logo className="w-24" /></Link></div></header>
      <main className="container-x py-24 text-center">
      <p className="eyebrow text-muted">404</p>
      <h1 className="mt-2 text-4xl font-extrabold">We couldn&apos;t find that page</h1>
      <p className="mt-4 text-lg text-muted">It may have moved. Try one of these instead:</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-dark">Home</Link>
        <Link href="/services" className="btn-outline">Services</Link>
        <Link href="/get-a-quote" className="btn-primary">Get a Free Quote</Link>
      </div>
      </main>
    </>
  );
}
