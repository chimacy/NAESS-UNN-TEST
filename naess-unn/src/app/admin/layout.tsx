import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminShell from "@/components/AdminShell";
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await sb.from("profiles").select("full_name,role,active").eq("id", user.id).single();
  if (!p || !p.active) return <main className="p-8"><h1 className="text-xl font-bold">No access</h1><p className="mt-2">Your account has no admin role yet. Ask a Super Admin.</p></main>;
  return <AdminShell name={p.full_name ?? user.email ?? ""} role={p.role}>{children}</AdminShell>;
}
