"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function createAdminUser(_: any, fd: FormData) {
  const sb = await supabaseServer(); const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const { data: me } = await sb.from("profiles").select("role,active").eq("id", user.id).single();
  if (me?.role !== "super_admin" || !me.active) return { error: "Only Super Admins can add users." };
  const email = String(fd.get("email") || "").trim(), password = String(fd.get("password") || ""), name = String(fd.get("name") || "").trim(), role = String(fd.get("role"));
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !["super_admin", "content_admin", "editor"].includes(role)) return { error: "Enter a valid email, a password of at least 8 characters, and a role." };
  const a = supabaseAdmin();
  const { data, error } = await a.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name || email } });
  if (error || !data.user) return { error: error?.message ?? "Could not create user." };
  await a.from("profiles").upsert({ id: data.user.id, full_name: name || email, role, active: true });
  await sb.from("activity_logs").insert({ user_id: user.id, action: "created", entity: "profiles", summary: `Added admin user ${email} as ${role}` });
  revalidatePath("/admin/users"); return { ok: true };
}
