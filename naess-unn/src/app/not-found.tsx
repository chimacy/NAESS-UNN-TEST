import Link from "next/link";
import SiteShell from "@/components/SiteShell";
export default function NF() { return <SiteShell><div className="mx-auto max-w-xl px-5 py-24 text-center"><p className="text-6xl font-bold text-primary">404</p><h1 className="mt-4 text-2xl font-bold">Page not found</h1><p className="mt-2 text-stone-600">The page you are looking for may have moved or no longer exists.</p><Link href="/" className="btn mt-6">Back to home</Link></div></SiteShell>; }
