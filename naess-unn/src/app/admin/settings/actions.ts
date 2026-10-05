"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
const HEX = /^#[0-9a-fA-F]{6}$/;
const IMG = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];
export type State = { ok?: boolean; error?: string } | null;
export async function saveSettings(_: State, fd: FormData): Promise<State> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const { data: cur } = await sb.from("site_settings").select("key,value");
  const get = (k: string) => (cur?.find(r => r.key === k)?.value ?? {}) as Record<string, any>;
  const colors = ["primary", "secondary", "accent", "background", "text"];
  for (const k of colors) if (!HEX.test(String(fd.get(k)))) return { error: `Invalid color for ${k}. Use a value like #14532d.` };
  const name = String(fd.get("name") ?? "").trim(), short = String(fd.get("short_name") ?? "").trim();
  if (!name || !short) return { error: "Association name and short name are required." };
  const general: Record<string, any> = { ...get("general"), name, short_name: short, description: String(fd.get("description") ?? "").slice(0, 500) };
  for (const f of ["logo", "favicon"] as const) {
    const file = fd.get(f) as File | null;
    if (file && file.size > 0) {
      if (!IMG.includes(file.type) || file.size > 2 * 1024 * 1024) return { error: `${f} must be an image under 2 MB.` };
      const path = `branding/${f}-${Date.now()}.${file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png"}`;
      const up = await sb.storage.from("media").upload(path, file, { contentType: file.type });
      if (up.error) return { error: `Upload failed: ${up.error.message}` };
      general[f === "logo" ? "logo_url" : "favicon_url"] = sb.storage.from("media").getPublicUrl(path).data.publicUrl;
    }
  }
  const branding = Object.fromEntries(colors.map(k => [k, String(fd.get(k))]));
  const seo = { ...get("seo"), title: String(fd.get("seo_title") ?? ""), description: String(fd.get("seo_description") ?? ""), keywords: String(fd.get("seo_keywords") ?? "") };
  const t = (k: string) => String(fd.get(k) ?? "").trim();
  const contact = { email: t("c_email"), phone: t("c_phone"), address: t("c_address"), whatsapp: t("c_whatsapp"), description: t("c_description") };
  const footer = { description: t("f_description"), copyright: t("f_copyright"), visible: fd.get("f_visible") === "on" };
  const { error } = await sb.from("site_settings").upsert([{ key: "contact", value: contact }, { key: "footer", value: footer },
    { key: "general", value: general }, { key: "branding", value: branding }, { key: "seo", value: seo }]);
  if (error) return { error: "You do not have permission to change settings, or the save failed." };
  const { data: p } = await sb.from("profiles").select("full_name").eq("id", user.id).single();
  await sb.from("activity_logs").insert({ user_id: user.id, user_name: p?.full_name, action: "updated", entity: "site_settings", summary: `${p?.full_name ?? "Admin"} updated site settings` });
  revalidatePath("/", "layout");
  return { ok: true };
}
