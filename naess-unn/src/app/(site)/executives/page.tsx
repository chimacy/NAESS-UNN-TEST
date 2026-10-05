import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Wrap, Empty, ExecCard } from "@/components/Cards";
import { clean } from "@/lib/util";
export const metadata = { title: "Executive Council" };
export default async function Execs() {
  const sb = await supabaseServer();
  const { data: a } = await sb.from("administrations").select("*").eq("is_current", true).eq("status", "published").maybeSingle();
  const { data } = a ? await sb.from("executives").select("*, positions(name)").eq("administration_id", a.id).eq("status", "published").order("sort_order") : { data: [] };
  return <Wrap title={a?.title || "Executive Council"} intro={a?.description}>{!data?.length ? <Empty t="The current executive council has not been added yet." /> :
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{data.map((x) => <details key={x.id} className="group"><summary className="cursor-pointer list-none"><ExecCard x={x} /></summary>{x.bio && <div className="prose-naess mt-2 rounded border bg-white p-4 text-sm" dangerouslySetInnerHTML={{ __html: clean(x.bio) }} />}</details>)}</div>}
    <Link href="/executives/past" className="btn mt-10">View past executives</Link></Wrap>;
}
