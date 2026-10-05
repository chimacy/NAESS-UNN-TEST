import { supabaseBrowser } from "./supabase/client";
let cache: { id: string; name: string } | null = null;
export async function logAction(action: string, entity: string, summary: string, entityId?: string) {
  const sb = supabaseBrowser();
  if (!cache) {
    const { data: { user } } = await sb.auth.getUser(); if (!user) return;
    const { data: p } = await sb.from("profiles").select("full_name").eq("id", user.id).single();
    cache = { id: user.id, name: p?.full_name ?? user.email ?? "Admin" };
  }
  await sb.from("activity_logs").insert({ user_id: cache.id, user_name: cache.name, action, entity, entity_id: entityId, summary: `${cache.name} ${summary}` });
}
