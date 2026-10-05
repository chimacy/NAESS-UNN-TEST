import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { clean, fmt, stripHtml } from "@/lib/util";
import { NewsCard, EventCard, AlbumCard, ExecCard } from "./Cards";
const Sec = ({ s, children, tint }: any) => <section className={`py-12 sm:py-16 ${tint ? "bg-stone-100" : ""}`}><div className="mx-auto max-w-6xl px-5">{(s.title || s.body) && <div className={`mb-8 max-w-2xl ${s.alignment === "center" ? "mx-auto text-center" : ""}`}>{s.title && <h2 className="text-2xl font-bold text-primary sm:text-3xl">{s.title}</h2>}{s.body && <p className="mt-2 text-stone-600">{s.body}</p>}</div>}{children}{s.button_label && <div className={`mt-8 ${s.alignment === "center" ? "text-center" : ""}`}><Link href={s.button_url || "#"} className="btn">{s.button_label}</Link></div>}</div></section>;
export default async function HomeSections() {
  const sb = await supabaseServer(); const set = await getSettings(); const today = new Date().toISOString().slice(0, 10);
  const { data: secs } = await sb.from("homepage_sections").select("*").eq("visible", true).order("sort_order");
  const { data: cur } = await sb.from("administrations").select("id").eq("is_current", true).eq("status", "published").limit(1);
  const out: React.ReactNode[] = [];
  for (const s of secs ?? []) {
    const cfg = s.config ?? {}; const n = cfg.count ?? 3; const c = s.alignment === "center";
    if (s.key === "hero") {
      const { data: ev } = cfg.show_event ? await sb.from("events").select("title,slug,event_date").eq("status", "published").eq("featured", true).gte("event_date", today).order("event_date").limit(1) : { data: null };
      out.push(<section key={s.id} className={`relative ${s.image_url ? "" : "bg-primary"} text-white`} style={s.image_url ? { backgroundImage: `url(${s.image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
        {s.image_url && cfg.overlay !== false && <div className="absolute inset-0 bg-primary/80" />}
        <div className={`relative mx-auto max-w-6xl px-5 py-16 sm:py-24 ${c ? "text-center" : ""}`}>{set.general.logo_url && <img src={set.general.logo_url} alt={set.general.short_name} className={`mb-6 h-20 w-auto sm:h-24 ${c ? "mx-auto" : ""}`} />}
          {s.subtitle && <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/80">{s.subtitle}</p>}<h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl" style={c ? { margin: "0 auto" } : undefined}>{s.title}</h1>
          {s.body && <p className={`mt-4 max-w-2xl text-lg text-white/90 ${c ? "mx-auto" : ""}`}>{s.body}</p>}
          <div className={`mt-8 flex flex-wrap gap-3 ${c ? "justify-center" : ""}`}>{s.button_label && <Link href={s.button_url || "#"} className="inline-flex min-h-[44px] items-center rounded bg-white px-5 font-semibold text-primary">{s.button_label}</Link>}{s.secondary_button_label && <Link href={s.secondary_button_url || "#"} className="inline-flex min-h-[44px] items-center rounded border border-white px-5 font-semibold">{s.secondary_button_label}</Link>}</div>
          {ev?.[0] && <Link href={`/events/${ev[0].slug}`} className="mt-8 inline-block rounded border border-white/40 bg-white/10 px-4 py-3 text-sm">Next event: <strong>{ev[0].title}</strong> · {fmt(ev[0].event_date)}</Link>}</div></section>);
    } else if (s.key === "about") {
      const { data: p } = await sb.from("pages").select("content").eq("slug", "about").eq("status", "published").maybeSingle();
      out.push(<section key={s.id} className="py-12 sm:py-16"><div className={`mx-auto grid max-w-6xl items-center gap-8 px-5 ${s.image_url ? "md:grid-cols-2" : ""}`}><div><h2 className="text-2xl font-bold text-primary sm:text-3xl">{s.title}</h2><p className="mt-3 text-stone-700">{s.body || stripHtml(p?.content).slice(0, 300)}</p>{s.button_label && <Link href={s.button_url || "/about"} className="btn mt-6">{s.button_label}</Link>}</div>{s.image_url && <img src={s.image_url} alt="" loading="lazy" className="w-full rounded-lg object-cover" />}</div></section>);
    } else if (s.key === "mission_vision") {
      const { data: ps } = await sb.from("pages").select("slug,title,content").in("slug", ["mission", "vision"]).eq("status", "published");
      if (ps?.length) out.push(<Sec key={s.id} s={s} tint><div className="grid gap-6 md:grid-cols-2">{["mission", "vision"].map((k) => ps.find((p) => p.slug === k)).filter(Boolean).map((p: any) => <div key={p.slug} className="rounded-lg border bg-white p-6"><h3 className="font-semibold text-primary">{p.title}</h3><div className="prose-naess" dangerouslySetInnerHTML={{ __html: clean(p.content) }} /></div>)}</div></Sec>);
    } else if (s.key === "leadership" && cur?.[0]) {
      const { data } = await sb.from("executives").select("*, positions(name)").eq("administration_id", cur[0].id).eq("status", "published").order("sort_order").limit(cfg.count ?? 4);
      if (data?.length) out.push(<Sec key={s.id} s={s}><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{data.map((x) => <ExecCard key={x.id} x={x} />)}</div></Sec>);
    } else if (s.key === "news") {
      const { data } = await sb.from("news").select("*, news_categories(name)").eq("status", "published").lte("published_at", new Date().toISOString()).order("featured", { ascending: false }).order("published_at", { ascending: false }).limit(n);
      if (data?.length) out.push(<Sec key={s.id} s={s} tint><div className="grid gap-5 md:grid-cols-3">{data.map((x) => <NewsCard key={x.id} n={x} />)}</div></Sec>);
    } else if (s.key === "events") {
      const { data } = await sb.from("events").select("*").eq("status", "published").neq("event_status", "cancelled").gte("event_date", today).order("event_date").limit(n);
      if (data?.length) out.push(<Sec key={s.id} s={s}><div className="grid gap-5 md:grid-cols-3">{data.map((x) => <EventCard key={x.id} e={x} />)}</div></Sec>);
    } else if (s.key === "memories") {
      const { data } = await sb.from("gallery_albums").select("*").eq("status", "published").order("featured", { ascending: false }).order("album_date", { ascending: false }).limit(n);
      if (data?.length) out.push(<Sec key={s.id} s={s} tint><div className="grid gap-5 md:grid-cols-3">{data.map((x) => <AlbumCard key={x.id} a={x} />)}</div></Sec>);
    } else if (s.key === "history") {
      const { data } = await sb.from("history_entries").select("*").eq("status", "published").order("sort_order").limit(cfg.count ?? 4);
      if (data?.length) out.push(<Sec key={s.id} s={s}><ol className="grid gap-4 md:grid-cols-2">{data.map((h) => <li key={h.id} className="rounded-lg border bg-white p-5"><p className="text-sm font-bold text-accent">{h.year}</p><h3 className="font-semibold text-primary">{h.title}</h3></li>)}</ol></Sec>);
    } else if (s.key === "stats" && cfg.items?.length) {
      out.push(<section key={s.id} className="bg-primary py-12 text-white"><div className="mx-auto max-w-6xl px-5">{s.title && <h2 className="mb-8 text-center text-2xl font-bold">{s.title}</h2>}<dl className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">{cfg.items.map((i: any, k: number) => <div key={k}><dd className="text-4xl font-bold">{i.value}</dd><dt className="mt-1 text-sm text-white/80">{i.label}</dt></div>)}</dl></div></section>);
    } else if (s.key === "cta") {
      out.push(<section key={s.id} className="py-12 sm:py-16"><div className="mx-auto max-w-3xl rounded-lg border bg-white px-6 py-10 text-center"><h2 className="text-2xl font-bold text-primary">{s.title}</h2>{s.body && <p className="mt-2 text-stone-600">{s.body}</p>}<div className="mt-6 flex flex-wrap justify-center gap-3">{s.button_label && <Link href={s.button_url || "#"} className="btn">{s.button_label}</Link>}{s.secondary_button_label && <Link href={s.secondary_button_url || "#"} className="rounded border px-5 py-2.5 font-semibold">{s.secondary_button_label}</Link>}</div></div></section>);
    }
  }
  return <>{out}</>;
}
