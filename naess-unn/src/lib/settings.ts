import { supabaseServer } from "./supabase/server";
export const DEFAULTS = {
  general: { name: "National Association of Ebonyi State Students, University of Nigeria, Nsukka", short_name: "NAESS UNN", description: "", logo_url: null as string | null, favicon_url: null as string | null },
  branding: { primary: "#14532d", secondary: "#166534", accent: "#b45309", background: "#fafaf7", text: "#1c1917" },
  contact: { email: "", phone: "", address: "", whatsapp: "", description: "" },
  footer: { description: "", copyright: "", visible: true },
  seo: { title: "NAESS UNN", description: "", keywords: "", og_image: null as string | null },
};
export async function getSettings() {
  const sb = await supabaseServer();
  const { data } = await sb.from("site_settings").select("key,value");
  const s: any = { ...DEFAULTS };
  data?.forEach((r) => { s[r.key] = { ...(DEFAULTS as any)[r.key], ...r.value }; });
  return s as typeof DEFAULTS;
}
