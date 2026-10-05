import Link from "next/link";
import Header from "./Header";
import { supabaseServer } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
export default async function SiteShell({ children }: { children: React.ReactNode }) {
  const sb = await supabaseServer(); const s = await getSettings();
  const { data: nav } = await sb.from("navigation_items").select("*").eq("visible", true).order("sort_order");
  const header = (nav ?? []).filter((n) => n.location === "header");
  const items = header.filter((n) => !n.parent_id).map((n) => ({ id: n.id, label: n.label, url: n.url, children: header.filter((c) => c.parent_id === n.id).map((c) => ({ id: c.id, label: c.label, url: c.url })) }));
  const fl = (nav ?? []).filter((n) => n.location === "footer"); const links = fl.length ? fl : items;
  const { data: social } = await sb.from("social_links").select("*").eq("visible", true).order("sort_order");
  return (<>
    <Header name={s.general.short_name} logo={s.general.logo_url} items={items} />
    <div id="main" className="min-h-[60vh]">{children}</div>
    {s.footer.visible && <footer className="mt-16 bg-primary text-white"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
      <div>{s.general.logo_url && <img src={s.general.logo_url} alt="" className="mb-3 h-12 w-auto" />}<p className="font-bold">{s.general.name}</p><p className="mt-2 text-sm text-white/80">{s.footer.description}</p></div>
      <div><h2 className="mb-3 font-semibold">Quick links</h2><ul className="space-y-2 text-sm">{links.map((l: any) => <li key={l.id}><Link href={l.url} className="hover:underline">{l.label}</Link></li>)}</ul></div>
      <div><h2 className="mb-3 font-semibold">Contact</h2><ul className="space-y-1 text-sm text-white/90">{s.contact.email && <li>{s.contact.email}</li>}{s.contact.phone && <li>{s.contact.phone}</li>}{s.contact.address && <li>{s.contact.address}</li>}</ul>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">{(social ?? []).map((l) => <li key={l.id}><a href={l.url} target="_blank" rel="noopener noreferrer" className="underline">{l.label || l.platform}</a></li>)}</ul></div></div>
      <p className="border-t border-white/20 py-4 text-center text-xs text-white/70">{s.footer.copyright || `© ${new Date().getFullYear()} ${s.general.short_name}`}</p></footer>}</>);
}
