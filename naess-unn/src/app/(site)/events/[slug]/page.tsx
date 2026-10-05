import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { clean, fmt, stripHtml } from "@/lib/util";
import { Draft } from "@/components/Cards";
const get = async (slug: string) => { const sb = await supabaseServer(); const { data } = await sb.from("events").select("*").eq("slug", slug).maybeSingle(); return { sb, e: data }; };
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { e } = await get((await params).slug); if (!e) return {};
  return { title: e.seo_title || e.title, description: e.seo_description || stripHtml(e.description).slice(0, 160), alternates: e.canonical_url ? { canonical: e.canonical_url } : undefined, openGraph: { images: [e.og_image || e.image_url].filter(Boolean) } };
}
export default async function Event({ params }: { params: Promise<{ slug: string }> }) {
  const { sb, e } = await get((await params).slug); if (!e) notFound();
  const { data: links } = await sb.from("event_gallery").select("gallery_albums(title,slug,status)").eq("event_id", e.id);
  const albums = (links ?? []).map((l: any) => l.gallery_albums).filter((a: any) => a?.status === "published");
  const rows: [string, string | null][] = [["Date", fmt(e.event_date)], ["Time", [e.start_time?.slice(0, 5), e.end_time?.slice(0, 5)].filter(Boolean).join(" – ") || null], ["Venue", e.venue], ["Organizer", e.organizer], ["Status", e.event_status]];
  return <><Draft s={e.status} /><article className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-3xl font-bold text-primary sm:text-4xl">{e.title}</h1>{e.image_url && <img src={e.image_url} alt="" className="mt-6 w-full rounded-lg" />}
    <dl className="mt-6 grid gap-2 rounded-lg border bg-white p-4 sm:grid-cols-2">{rows.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-xs uppercase text-stone-500">{k}</dt><dd className="capitalize">{v}</dd></div>)}</dl>
    {e.registration_url && e.event_status !== "cancelled" && <a href={e.registration_url} target="_blank" rel="noopener noreferrer" className="btn mt-4">Register</a>}
    <div className="prose-naess mt-6" dangerouslySetInnerHTML={{ __html: clean(e.description) }} />{e.report && <><h2 className="mt-8 text-xl font-bold text-primary">Event report</h2><div className="prose-naess" dangerouslySetInnerHTML={{ __html: clean(e.report) }} /></>}
    {albums.length > 0 && <div className="mt-6"><h2 className="font-semibold">Gallery</h2>{albums.map((a: any) => <Link key={a.slug} href={`/gallery/${a.slug}`} className="mr-3 underline">{a.title}</Link>)}</div>}</article></>;
}
