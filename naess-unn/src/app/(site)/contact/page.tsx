import { getSettings } from "@/lib/settings";
import { supabaseServer } from "@/lib/supabase/server";
import { Wrap } from "@/components/Cards";
export const metadata = { title: "Contact" };
export default async function Contact() {
  const s = (await getSettings()).contact; const sb = await supabaseServer(); const { data: soc } = await sb.from("social_links").select("*").eq("visible", true).order("sort_order");
  const rows: [string, string, string?][] = [["Email", s.email, `mailto:${s.email}`], ["Phone", s.phone, `tel:${s.phone}`], ["Office address", s.address], ["WhatsApp / community", s.whatsapp, s.whatsapp]];
  const any = rows.some((r) => r[1]) || soc?.length;
  return <Wrap title="Contact Us" intro={s.description}>{!any ? <p className="rounded-lg border border-dashed p-10 text-center text-stone-500">Contact details have not been added yet.</p> :
    <dl className="grid max-w-2xl gap-4">{rows.filter((r) => r[1]).map(([k, v, h]) => <div key={k} className="rounded-lg border bg-white p-4"><dt className="text-xs uppercase text-stone-500">{k}</dt><dd className="mt-1">{h ? <a href={h} className="text-secondary underline">{v}</a> : v}</dd></div>)}
      {!!soc?.length && <div className="rounded-lg border bg-white p-4"><dt className="text-xs uppercase text-stone-500">Social media</dt><dd className="mt-1 flex flex-wrap gap-4">{soc.map((l) => <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="text-secondary underline">{l.label || l.platform}</a>)}</dd></div>}</dl>}</Wrap>;
}
