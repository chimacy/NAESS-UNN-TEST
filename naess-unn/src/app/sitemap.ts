import type { MetadataRoute } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/util";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = await supabaseServer(); const b = siteUrl();
  const out: MetadataRoute.Sitemap = ["", "/about", "/history", "/executives", "/executives/past", "/news", "/events", "/gallery", "/documents", "/contact", "/search"].map((p) => ({ url: b + p }));
  for (const [t, p] of [["news", "news"], ["events", "events"], ["gallery_albums", "gallery"], ["documents", "documents"]] as const) { const { data } = await sb.from(t).select("slug").eq("status", "published"); data?.forEach((r: any) => out.push({ url: `${b}/${p}/${r.slug}` })); }
  return out;
}
