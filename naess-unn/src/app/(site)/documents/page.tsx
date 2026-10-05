import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Wrap, Empty, Pager } from "@/components/Cards";
import { fmt } from "@/lib/util";
export const metadata = { title: "Documents" };
export default async function Docs({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const sp = await searchParams; const page = Number(sp.page ?? 0); const sb = await supabaseServer();
  const { data: cats } = await sb.from("document_categories").select("*").order("sort_order"); const cat = cats?.find((c) => c.slug === sp.category);
  let q = sb.from("documents").select("*, document_categories(name)").eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false }).range(page * 12, page * 12 + 12); if (cat) q = q.eq("category_id", cat.id);
  const { data } = await q;
  return <Wrap title="Documents" intro="Official NAESS UNN documents, reports and forms."><nav className="mb-6 flex flex-wrap gap-2"><Link href="/documents" className={`rounded-full border px-4 py-1.5 text-sm ${!cat ? "bg-primary text-white" : ""}`}>All</Link>{cats?.map((c) => <Link key={c.id} href={`/documents?category=${c.slug}`} className={`rounded-full border px-4 py-1.5 text-sm ${cat?.id === c.id ? "bg-primary text-white" : ""}`}>{c.name}</Link>)}</nav>
    {!data?.length ? <Empty t="No documents available yet." /> : <ul className="space-y-3">{data.slice(0, 12).map((d) => <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4"><div className="min-w-0"><Link href={`/documents/${d.slug}`} className="font-semibold text-primary hover:underline">{d.title}</Link><p className="text-xs text-stone-500">{d.document_categories?.name} · {fmt(d.created_at)}</p></div><a href={d.file_url} target="_blank" rel="noopener noreferrer" className="btn">Download</a></li>)}</ul>}<Pager base={`/documents${cat ? `?category=${cat.slug}` : ""}`} page={page} more={(data?.length ?? 0) > 12} /></Wrap>;
}
