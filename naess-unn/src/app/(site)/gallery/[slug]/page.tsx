import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { fmt } from "@/lib/util";
import Lightbox from "@/components/Lightbox";
import { Wrap, Empty, Draft } from "@/components/Cards";
const get = async (slug: string) => { const sb = await supabaseServer(); const { data } = await sb.from("gallery_albums").select("*").eq("slug", slug).maybeSingle(); return { sb, a: data }; };
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { a } = await get((await params).slug); return a ? { title: a.seo_title || a.title, description: a.seo_description || a.description || undefined, openGraph: { images: [a.og_image || a.cover_image].filter(Boolean) } } : {}; }
export default async function Album({ params }: { params: Promise<{ slug: string }> }) {
  const { sb, a } = await get((await params).slug); if (!a) notFound();
  const { data } = await sb.from("gallery_items").select("*").eq("album_id", a.id).order("sort_order");
  return <><Draft s={a.status} /><Wrap title={a.title} intro={[a.description, fmt(a.album_date), a.location].filter(Boolean).join(" · ")}>{!data?.length ? <Empty t="This album has no images yet." /> : <Lightbox items={data} />}</Wrap></>;
}
