import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { clean, fmt, readingTime, siteUrl, stripHtml } from "@/lib/util";
import { NewsCard, Draft } from "@/components/Cards";
const get = async (slug: string) => { const sb = await supabaseServer(); const { data } = await sb.from("news").select("*, news_categories(name)").eq("slug", slug).maybeSingle(); return { sb, n: data }; };
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { n } = await get((await params).slug); if (!n) return {};
  return { title: n.seo_title || n.title, description: n.seo_description || n.excerpt || stripHtml(n.content).slice(0, 160), alternates: n.canonical_url ? { canonical: n.canonical_url } : undefined, openGraph: { images: [n.og_image || n.cover_image].filter(Boolean) } };
}
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { sb, n } = await get((await params).slug); if (!n) notFound();
  const { data: rel } = await sb.from("news").select("*, news_categories(name)").eq("status", "published").neq("id", n.id).eq("category_id", n.category_id ?? "00000000-0000-0000-0000-000000000000").order("published_at", { ascending: false }).limit(3);
  const url = `${siteUrl()}/news/${n.slug}`; const t = encodeURIComponent(n.title);
  return <><Draft s={n.status} /><article className="mx-auto max-w-3xl px-5 py-10"><p className="text-sm text-accent">{n.news_categories?.name}</p><h1 className="mt-1 text-3xl font-bold text-primary sm:text-4xl">{n.title}</h1>
    <p className="mt-3 text-sm text-stone-500">{fmt(n.published_at)}{n.author && ` · By ${n.author}`} · {readingTime(n.content)} min read</p>
    {n.cover_image && <img src={n.cover_image} alt="" className="mt-6 w-full rounded-lg" />}<div className="prose-naess mt-6" dangerouslySetInnerHTML={{ __html: clean(n.content) }} />
    {n.tags?.length > 0 && <p className="mt-6 text-sm text-stone-500">Tags: {n.tags.join(", ")}</p>}
    <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-4 text-sm"><span>Share:</span>{[["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`], ["X", `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${t}`], ["WhatsApp", `https://wa.me/?text=${t}%20${encodeURIComponent(url)}`]].map(([l, h]) => <a key={l} href={h} target="_blank" rel="noopener noreferrer" className="rounded border px-3 py-2">{l}</a>)}</div></article>
    {!!rel?.length && <section className="mx-auto max-w-6xl px-5 pb-10"><h2 className="mb-4 text-xl font-bold text-primary">Related news</h2><div className="grid gap-5 md:grid-cols-3">{rel.map((r) => <NewsCard key={r.id} n={r} />)}</div></section>}</>;
}
