import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Wrap, Empty, NewsCard, Pager } from "@/components/Cards";
export const metadata = { title: "News" };
export default async function News({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const sp = await searchParams; const page = Number(sp.page ?? 0); const sb = await supabaseServer();
  const { data: cats } = await sb.from("news_categories").select("*").order("sort_order");
  const cat = cats?.find((c) => c.slug === sp.category);
  let q = sb.from("news").select("*, news_categories(name)").eq("status", "published").lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }).range(page * 9, page * 9 + 9);
  if (cat) q = q.eq("category_id", cat.id);
  const { data } = await q; const more = (data?.length ?? 0) > 9;
  return <Wrap title="News & Announcements"><nav aria-label="Categories" className="mb-6 flex flex-wrap gap-2"><Link href="/news" className={`rounded-full border px-4 py-1.5 text-sm ${!cat ? "bg-primary text-white" : ""}`}>All</Link>{cats?.map((c) => <Link key={c.id} href={`/news?category=${c.slug}`} className={`rounded-full border px-4 py-1.5 text-sm ${cat?.id === c.id ? "bg-primary text-white" : ""}`}>{c.name}</Link>)}</nav>
    {!data?.length ? <Empty t="No news published yet." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.slice(0, 9).map((n) => <NewsCard key={n.id} n={n} />)}</div>}<Pager base={`/news${cat ? `?category=${cat.slug}` : ""}`} page={page} more={more} /></Wrap>;
}
