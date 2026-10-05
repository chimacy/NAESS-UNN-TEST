import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Wrap, Empty, EventCard, Pager } from "@/components/Cards";
export const metadata = { title: "Events" };
export default async function Events({ searchParams }: { searchParams: Promise<{ show?: string; page?: string }> }) {
  const sp = await searchParams; const page = Number(sp.page ?? 0); const past = sp.show === "past"; const today = new Date().toISOString().slice(0, 10); const sb = await supabaseServer();
  let q = sb.from("events").select("*").eq("status", "published"); q = past ? q.lt("event_date", today).order("event_date", { ascending: false }) : q.gte("event_date", today).order("event_date");
  const { data } = await q.range(page * 9, page * 9 + 9);
  return <Wrap title="Events"><nav className="mb-6 flex gap-2"><Link href="/events" className={`rounded-full border px-4 py-1.5 text-sm ${!past ? "bg-primary text-white" : ""}`}>Upcoming</Link><Link href="/events?show=past" className={`rounded-full border px-4 py-1.5 text-sm ${past ? "bg-primary text-white" : ""}`}>Past events</Link></nav>
    {!data?.length ? <Empty t={past ? "No past events yet." : "No upcoming events at the moment."} /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.slice(0, 9).map((e) => <EventCard key={e.id} e={e} />)}</div>}<Pager base={`/events${past ? "?show=past" : ""}`} page={page} more={(data?.length ?? 0) > 9} /></Wrap>;
}
