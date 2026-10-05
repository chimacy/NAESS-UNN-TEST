import { supabaseServer } from "@/lib/supabase/server";
import { clean } from "@/lib/util";
import { Wrap, Empty } from "@/components/Cards";
export const metadata = { title: "History" };
export default async function History() {
  const sb = await supabaseServer();
  const { data } = await sb.from("history_entries").select("*").eq("status", "published").order("sort_order");
  return <Wrap title="Our History" intro="The story of NAESS UNN, milestone by milestone.">{!data?.length ? <Empty t="No history entries yet." /> :
    <ol className="relative ml-3 border-l-2 border-primary/30 pl-6 sm:ml-6 sm:pl-10">{data.map((h) => <li key={h.id} className="relative pb-12"><span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-surface bg-primary sm:-left-[49px]" /><p className="text-sm font-bold text-accent">{h.year}</p><h2 className="text-xl font-bold text-primary">{h.title}</h2>
      {h.image_url && <img src={h.image_url} alt="" loading="lazy" className="mt-3 max-h-80 rounded-lg object-cover" />}<div className="prose-naess" dangerouslySetInnerHTML={{ __html: clean(h.description) }} />
      {Array.isArray(h.gallery) && h.gallery.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{h.gallery.map((u: string) => <img key={u} src={u} alt="" loading="lazy" className="aspect-square rounded object-cover" />)}</div>}</li>)}</ol>}</Wrap>;
}
