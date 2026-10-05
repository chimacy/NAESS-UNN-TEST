import "./globals.css";
import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s.seo.title || s.general.short_name, description: s.seo.description, keywords: s.seo.keywords,
    icons: s.general.favicon_url ? { icon: s.general.favicon_url } : undefined,
    openGraph: { title: s.seo.title, description: s.seo.description, images: s.seo.og_image ? [s.seo.og_image] : [] },
  };
}
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const b = (await getSettings()).branding;
  const css = `:root{--c-primary:${b.primary};--c-secondary:${b.secondary};--c-accent:${b.accent};--c-bg:${b.background};--c-text:${b.text}}`;
  return (<html lang="en"><head><style dangerouslySetInnerHTML={{ __html: css }} /></head><body className="font-sans antialiased">{children}</body></html>);
}
