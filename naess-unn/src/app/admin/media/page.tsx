"use client";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/upload";
import { logAction } from "@/lib/log";
const USE: [string, string][] = [["news", "cover_image"], ["events", "image_url"], ["gallery_albums", "cover_image"], ["gallery_items", "image_url"], ["documents", "file_url"], ["executives", "photo_url"], ["history_entries", "image_url"], ["homepage_sections", "image_url"], ["pages", "image_url"]];
export default function Media() {
  const sb = supabaseBrowser(); const [rows, setRows] = useState<any[]>([]); const [q, setQ] = useState(""); const [kind, setKind] = useState(""); const [page, setPage] = useState(0); const [n, setN] = useState(0);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    let query = sb.from("media").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(page * 24, page * 24 + 23);
    if (q) query = query.ilike("filename", `%${q}%`); if (kind === "image") query = query.like("mime_type", "image/%"); if (kind === "doc") query = query.not("mime_type", "like", "image/%");
    const { data, count } = await query; setRows(data ?? []); setN(count ?? 0);
  }, [q, kind, page]); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  async function up(e: React.ChangeEvent<HTMLInputElement>) {
    setBusy(true); setMsg("");
    for (const f of Array.from(e.target.files ?? [])) { try { await uploadFile(f, "library"); } catch (x: any) { setMsg(`${f.name}: ${x.message}`); } }
    e.target.value = ""; setBusy(false); load();
  }
  async function del(m: any) { if (!confirm("Delete this file? Pages using it will show a broken image.")) return; await sb.storage.from("media").remove([m.path]); const { error } = await sb.from("media").delete().eq("id", m.id); if (error) setMsg("Only Content Admins can delete."); else { logAction("deleted", "media", `deleted media ${m.filename}`, m.id); load(); } }
  async function replace(m: any, f?: File) { if (!f) return; if (f.type !== m.mime_type) return setMsg("Replacement must be the same file type."); const { error } = await sb.storage.from("media").upload(m.path, f, { upsert: true, contentType: f.type }); setMsg(error ? error.message : "Replaced. Refresh the website to see it."); }
  async function usage(m: any) { const found: string[] = []; for (const [t, c] of USE) { const { count } = await sb.from(t).select("*", { count: "exact", head: true }).eq(c, m.url); if (count) found.push(`${t} (${count})`); } setMsg(found.length ? `Used in: ${found.join(", ")}` : "Not used anywhere (rich-text bodies are not checked)."); }
  return (<div><h1 className="mb-4 text-2xl font-bold text-primary">Media Library</h1>
    <div className="mb-4 flex flex-wrap gap-3"><label className="btn cursor-pointer">{busy ? "Uploading…" : "Upload files"}<input type="file" multiple className="sr-only" disabled={busy} onChange={up} /></label>
      <input aria-label="Search media" placeholder="Search…" className="input max-w-xs" value={q} onChange={(e) => { setPage(0); setQ(e.target.value); }} />
      <select aria-label="Filter" className="input w-auto" value={kind} onChange={(e) => { setPage(0); setKind(e.target.value); }}><option value="">All</option><option value="image">Images</option><option value="doc">Documents</option></select></div>
    {msg && <p role="status" className="mb-3 text-sm">{msg}</p>}
    {!rows.length ? <p className="rounded border border-dashed p-8 text-center text-stone-500">No media yet.</p> : <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">{rows.map((m) => <li key={m.id} className="rounded border bg-white p-2 text-xs">
      {m.mime_type?.startsWith("image/") ? <img src={m.url} alt={m.alt_text ?? ""} loading="lazy" className="h-28 w-full rounded object-cover" /> : <div className="flex h-28 items-center justify-center rounded bg-stone-100">File</div>}
      <p className="mt-1 truncate">{m.filename}</p><div className="mt-1 flex flex-wrap gap-1">
        <button className="rounded border px-2 py-1" onClick={() => { navigator.clipboard.writeText(m.url); setMsg("URL copied."); }}>Copy URL</button><button className="rounded border px-2 py-1" onClick={() => usage(m)}>Usage</button>
        <label className="cursor-pointer rounded border px-2 py-1">Replace<input type="file" className="sr-only" onChange={(e) => replace(m, e.target.files?.[0])} /></label><button className="rounded border border-red-300 px-2 py-1 text-red-700" onClick={() => del(m)}>Delete</button></div></li>)}</ul>}
    {n > 24 && <div className="mt-4 flex gap-3"><button className="rounded border px-3 py-2" disabled={!page} onClick={() => setPage(page - 1)}>Previous</button><button className="rounded border px-3 py-2" disabled={(page + 1) * 24 >= n} onClick={() => setPage(page + 1)}>Next</button></div>}</div>);
}
