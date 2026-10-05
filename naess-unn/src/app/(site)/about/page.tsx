import { supabaseServer } from "@/lib/supabase/server";
import { clean } from "@/lib/util";
import { Wrap, Empty } from "@/components/Cards";
export const metadata = { title: "About" };
export default async function About() {
  const sb = await supabaseServer();
  const { data } = await sb.from("pages").select("*").eq("status", "published").order("sort_order");
  return <Wrap title="About NAESS">{!data?.length ? <Empty t="About content has not been added yet." /> : <div className="grid gap-10 md:grid-cols-[200px_1fr]"><nav aria-label="On this page" className="hidden md:block"><ul className="sticky top-24 space-y-2 text-sm">{data.map((p) => <li key={p.id}><a href={`#${p.slug}`} className="hover:underline">{p.title}</a></li>)}</ul></nav>
    <div className="space-y-12">{data.map((p) => <section key={p.id} id={p.slug}><h2 className="text-2xl font-bold text-primary">{p.title}</h2>{p.image_url && <img src={p.image_url} alt="" loading="lazy" className="mt-4 max-h-96 w-full rounded-lg object-cover" />}<div className="prose-naess" dangerouslySetInnerHTML={{ __html: clean(p.content) }} /></section>)}</div></div>}</Wrap>;
}
