import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Wrap, Empty } from "@/components/Cards";
export const metadata = { title: "Search" };
const TYPES = [["news", "News"], ["events", "Events"], ["documents", "Documents"], ["history", "History"], ["executives", "Executives"]];
export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const { q = "", type = "" } = await searchParams; const term = q.trim().slice(0, 100); const sb = await supabaseServer(); const res: { t: string; title: string; href: string; sub?: string }[] = [];
  if (term) {
    const f = { type: "websearch" as const, config: "english" }; const want = (t: string) => !type || type === t;
    if (want("news")) (await sb.from("news").select("title,slug,excerpt").eq("status", "published").lte("published_at", new Date().toISOString()).textSearch("fts", term, f).limit(20)).data?.forEach((r) => res.push({ t: "News", title: r.title, href: `/news/${r.slug}`, sub: r.excerpt }));
    if (want("events")) (await sb.from("events").select("title,slug,venue").eq("status", "published").textSearch("fts", term, f).limit(20)).data?.forEach((r) => res.push({ t: "Event", title: r.title, href: `/events/${r.slug}`, sub: r.venue }));
    if (want("documents")) (await sb.from("documents").select("title,slug,description").eq("status", "published").textSearch("fts", term, f).limit(20)).data?.forEach((r) => res.push({ t: "Document", title: r.title, href: `/documents/${r.slug}`, sub: r.description }));
    if (want("history")) (await sb.from("history_entries").select("title,year").eq("status", "published").textSearch("fts", term, f).limit(20)).data?.forEach((r) => res.push({ t: "History", title: r.title, href: "/history", sub: r.year }));
    if (want("executives")) (await sb.from("executives").select("full_name,positions(name)").eq("status", "published").textSearch("fts", term, f).limit(20)).data?.forEach((r: any) => res.push({ t: "Executive", title: r.full_name, href: "/executives", sub: r.positions?.name }));
  }
  return <Wrap title="Search"><form role="search" className="flex max-w-xl gap-2"><label htmlFor="q" className="sr-only">Search</label><input id="q" name="q" defaultValue={term} placeholder="Search news, events, documents…" className="input" />{type && <input type="hidden" name="type" value={type} />}<button className="btn">Search</button></form>
    <nav className="mt-4 flex flex-wrap gap-2"><Link href={`/search?q=${encodeURIComponent(term)}`} className={`rounded-full border px-4 py-1.5 text-sm ${!type ? "bg-primary text-white" : ""}`}>All</Link>{TYPES.map(([k, l]) => <Link key={k} href={`/search?q=${encodeURIComponent(term)}&type=${k}`} className={`rounded-full border px-4 py-1.5 text-sm ${type === k ? "bg-primary text-white" : ""}`}>{l}</Link>)}</nav>
    <div className="mt-6">{!term ? <Empty t="Type something to search." /> : !res.length ? <Empty t={`No results for “${term}”.`} /> : <ul className="space-y-3">{res.map((r, i) => <li key={i} className="rounded-lg border bg-white p-4"><p className="text-xs uppercase text-accent">{r.t}</p><Link href={r.href} className="font-semibold text-primary hover:underline">{r.title}</Link>{r.sub && <p className="text-sm text-stone-600">{r.sub}</p>}</li>)}</ul>}</div></Wrap>;
}
