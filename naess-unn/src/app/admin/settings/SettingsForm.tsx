"use client";
import { useActionState } from "react";
import { saveSettings, type State } from "./actions";
export default function SettingsForm({ s }: { s: any }) {
  const [st, act, pending] = useActionState<State, FormData>(saveSettings, null);
  const F = ({ id, label, def, type = "text", hint }: any) => (
    <div><label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <input id={id} name={id} type={type} defaultValue={def ?? ""} className={type === "color" ? "h-11 w-24 rounded border" : "input"} />{hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}</div>);
  const Sec = ({ t, children }: any) => <section className="space-y-4 rounded-lg border border-stone-200 bg-white p-4 sm:p-6"><h2 className="font-semibold text-primary">{t}</h2>{children}</section>;
  return (
    <form action={act} className="max-w-2xl space-y-6">
      <Sec t="General">
        <F id="name" label="Association name" def={s.general.name} /><F id="short_name" label="Short name" def={s.general.short_name} />
        <F id="description" label="Short description" def={s.general.description} />
        <div><label htmlFor="logo" className="mb-1 block text-sm font-medium">Logo</label>{s.general.logo_url && <img src={s.general.logo_url} alt="Current logo" className="mb-2 h-16" />}<input id="logo" name="logo" type="file" accept="image/*" /></div>
        <div><label htmlFor="favicon" className="mb-1 block text-sm font-medium">Favicon</label>{s.general.favicon_url && <img src={s.general.favicon_url} alt="Current favicon" className="mb-2 h-8" />}<input id="favicon" name="favicon" type="file" accept="image/*" /></div>
      </Sec>
      <Sec t="Branding colors">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <F id="primary" label="Primary" type="color" def={s.branding.primary} /><F id="secondary" label="Secondary" type="color" def={s.branding.secondary} />
          <F id="accent" label="Accent" type="color" def={s.branding.accent} /><F id="background" label="Background" type="color" def={s.branding.background} /><F id="text" label="Text" type="color" def={s.branding.text} />
        </div>
      </Sec>
      <Sec t="SEO"><F id="seo_title" label="Site title" def={s.seo.title} /><F id="seo_description" label="Site description" def={s.seo.description} /><F id="seo_keywords" label="Default keywords" def={s.seo.keywords} /></Sec>
      <Sec t="Contact details"><F id="c_email" label="Email" def={s.contact.email} /><F id="c_phone" label="Phone" def={s.contact.phone} /><F id="c_address" label="Office address" def={s.contact.address} /><F id="c_whatsapp" label="WhatsApp / community link" def={s.contact.whatsapp} /><F id="c_description" label="Contact page description" def={s.contact.description} /></Sec>
      <Sec t="Footer"><F id="f_description" label="Footer description" def={s.footer.description} /><F id="f_copyright" label="Copyright text" def={s.footer.copyright} /><label className="flex items-center gap-2"><input type="checkbox" name="f_visible" defaultChecked={s.footer.visible} className="h-5 w-5" />Show footer</label><p className="text-xs text-stone-500">Footer links come from Navigation (location: footer) and Social links.</p></Sec>
      <div aria-live="polite">{st?.error && <p className="text-red-700">{st.error}</p>}{st?.ok && <p className="text-green-800">Settings saved.</p>}</div>
      <button className="btn" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
