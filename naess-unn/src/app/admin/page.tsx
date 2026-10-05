import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
export default async function Dashboard() {
  const sb = await supabaseServer();
  const c = async (t: string, f?: (q: any) => any) => { let q = sb.from(t).select("*", { count: "exact", head: true }); if (f) q = f(q); const { count } = await q; return count ?? 0; };
  const today = new Date().toISOString().slice(0, 10);
  const curId = (await sb.from("administrations").select("id").eq("is_current", true)).data?.[0]?.id ?? "00000000-0000-0000-0000-000000000000";
  const stats = [["Total news", await c("news")], ["Published news", await c("news", (q) => q.eq("status", "published"))], ["Upcoming events", await c("events", (q) => q.eq("status", "published").gte("event_date", today))],
    ["Albums", await c("gallery_albums")], ["Documents", await c("documents")], ["Current executives", await c("executives", (q) => q.eq("status", "published").in("administration_id", [curId]))],
    ["Past administrations", await c("administrations", (q) => q.eq("is_current", false))]] as const;
  const { data: log } = await sb.from("activity_logs").select("id,summary,created_at").order("created_at", { ascending: false }).limit(8);
  const quick: [string, string][] = [["New article", "/admin/news"], ["New event", "/admin/events"], ["New album", "/admin/albums"], ["Add executive", "/admin/executives"], ["Add history entry", "/admin/history"], ["Upload document", "/admin/documents"]];
  return (<div><h1 className="mb-6 text-2xl font-bold text-primary">Dashboard</h1>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(([l, n]) => <div key={l} className="rounded-lg border border-stone-200 bg-white p-4"><p className="text-3xl font-bold text-primary">{n}</p><p className="text-sm text-stone-600">{l}</p></div>)}</div>
    <h2 className="mb-3 mt-8 font-semibold">Quick actions</h2><div className="flex flex-wrap gap-2">{quick.map(([l, h]) => <Link key={h} href={h} className="rounded border bg-white px-4 py-3 text-sm hover:bg-stone-50">{l}</Link>)}</div>
    {!!log?.length && <><h2 className="mb-3 mt-8 font-semibold">Recent activity</h2><ul className="space-y-1 text-sm">{log.map((l) => <li key={l.id} className="rounded border bg-white p-3">{l.summary} <span className="text-stone-400">· {new Date(l.created_at).toLocaleString()}</span></li>)}</ul></>}</div>);
}
