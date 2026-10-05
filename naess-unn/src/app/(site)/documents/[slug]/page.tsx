import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { fmt } from "@/lib/util";
import { Wrap, Draft } from "@/components/Cards";
const get = async (slug: string) => { const sb = await supabaseServer(); const { data } = await sb.from("documents").select("*, document_categories(name)").eq("slug", slug).maybeSingle(); return data; };
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const d = await get((await params).slug); return d ? { title: d.seo_title || d.title, description: d.seo_description || d.description || undefined } : {}; }
export default async function Doc({ params }: { params: Promise<{ slug: string }> }) {
  const d = await get((await params).slug); if (!d) notFound();
  return <><Draft s={d.status} /><Wrap title={d.title} intro={d.description ?? undefined}><p className="text-sm text-stone-500">{d.document_categories?.name} · Uploaded {fmt(d.created_at)}{d.size_bytes ? ` · ${(d.size_bytes / 1048576).toFixed(1)} MB` : ""}</p><a href={d.file_url} target="_blank" rel="noopener noreferrer" className="btn mt-6">Download document</a>
    {d.mime_type === "application/pdf" && <iframe src={d.file_url} title={d.title} className="mt-6 h-[70vh] w-full rounded border" />}</Wrap></>;
}
