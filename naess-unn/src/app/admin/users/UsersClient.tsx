"use client";
import { useActionState, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { logAction } from "@/lib/log";
import { createAdminUser } from "./actions";
export default function UsersClient() {
  const sb = supabaseBrowser(); const [rows, setRows] = useState<any[]>([]); const [err, setErr] = useState("");
  const [st, act, pending] = useActionState<any, FormData>(createAdminUser, null);
  const load = async () => { const { data, error } = await sb.from("profiles").select("*").order("created_at"); if (error) setErr("Only Super Admins can manage users."); else setRows(data ?? []); };
  useEffect(() => { load(); }, [st]); // eslint-disable-line
  const upd = async (r: any, patch: any) => { const { error } = await sb.from("profiles").update(patch).eq("id", r.id); if (error) setErr(error.message); else { await logAction("updated", "profiles", `changed access for ${r.full_name}`, r.id); load(); } };
  return (<div className="max-w-3xl"><h1 className="mb-4 text-2xl font-bold text-primary">Admin Users</h1>{err && <p className="text-red-700">{err}</p>}
    <ul className="mb-8 space-y-2">{rows.map((r) => <li key={r.id} className="flex flex-wrap items-center gap-3 rounded border bg-white p-3"><span className="min-w-0 flex-1 truncate">{r.full_name}</span>
      <select aria-label="Role" className="input w-auto" value={r.role} onChange={(e) => upd(r, { role: e.target.value })}><option value="super_admin">Super Admin</option><option value="content_admin">Content Admin</option><option value="editor">Editor</option></select>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={r.active} onChange={(e) => upd(r, { active: e.target.checked })} />Active</label></li>)}</ul>
    <form action={act} className="space-y-3 rounded border bg-white p-4"><h2 className="font-semibold">Add a new admin user</h2>
      <input name="name" aria-label="Full name" placeholder="Full name" className="input" /><input name="email" type="email" aria-label="Email" placeholder="Email" required className="input" />
      <input name="password" type="password" aria-label="Temporary password" placeholder="Temporary password (min 8 characters)" required minLength={8} className="input" />
      <select name="role" aria-label="Role" className="input" defaultValue="editor"><option value="editor">Editor</option><option value="content_admin">Content Admin</option><option value="super_admin">Super Admin</option></select>
      {st?.error && <p role="alert" className="text-red-700">{st.error}</p>}{st?.ok && <p className="text-green-800">User added.</p>}<button className="btn" disabled={pending}>{pending ? "Adding…" : "Add user"}</button></form></div>);
}
