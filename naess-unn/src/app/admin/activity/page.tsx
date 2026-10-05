import { supabaseServer } from "@/lib/supabase/server";
export default async function Page() {
  const sb = await supabaseServer();
  const { data, error } = await sb.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200);
  return (<div><h1 className="mb-4 text-2xl font-bold text-primary">Activity Log</h1>{error && <p className="text-red-700">Only Super Admins can view this.</p>}
    {!data?.length ? <p className="rounded border border-dashed p-8 text-center text-stone-500">No activity yet.</p> : <ul className="space-y-2">{data.map((l) => <li key={l.id} className="rounded border bg-white p-3 text-sm">{l.summary}<br /><span className="text-xs text-stone-400">{new Date(l.created_at).toLocaleString()}</span></li>)}</ul>}</div>);
}
