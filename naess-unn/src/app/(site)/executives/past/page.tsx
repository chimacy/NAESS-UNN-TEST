import { supabaseServer } from "@/lib/supabase/server";
import { Wrap, Empty } from "@/components/Cards";
export const metadata = { title: "Past Executives" };
export default async function Past() {
  const sb = await supabaseServer();
  const { data: as } = await sb.from("administrations").select("*").eq("is_current", false).eq("status", "published").order("session", { ascending: false });
  const { data: ex } = await sb.from("executives").select("*, positions(name)").eq("status", "published").in("administration_id", (as ?? []).map((a) => a.id)).order("sort_order");
  return <Wrap title="Past Executives" intro="A record of NAESS UNN leadership through the years.">{!as?.length ? <Empty t="No past administrations have been added yet." /> :
    <div className="space-y-8">{as.map((a) => <section key={a.id} className="rounded-lg border bg-white p-5"><h2 className="text-xl font-bold text-primary">{a.title || a.session}</h2>{a.description && <p className="text-sm text-stone-600">{a.description}</p>}
      <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">{(ex ?? []).filter((x) => x.administration_id === a.id).map((x) => <div key={x.id} className="flex gap-3 border-b py-2"><dt className="w-40 shrink-0 text-sm font-medium text-accent">{x.positions?.name ?? "Member"}</dt><dd>{x.full_name}</dd></div>)}</dl></section>)}</div>}</Wrap>;
}
