"use client";
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/upload";
import { logAction } from "@/lib/log";
export default function AlbumImages({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const sb = supabaseBrowser(); const [album, setAlbum] = useState<any>(null); const [items, setItems] = useState<any[]>([]); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { setAlbum((await sb.from("gallery_albums").select("id,title").eq("id", id).single()).data); setItems((await sb.from("gallery_items").select("*").eq("album_id", id).order("sort_order")).data ?? []); }, [id]); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  async function up(e: React.ChangeEvent<HTMLInputElement>) {
    setBusy(true); setMsg(""); let o = items.length;
    for (const f of Array.from(e.target.files ?? [])) { try { const r = await uploadFile(f, "gallery", "image"); const { error } = await sb.from("gallery_items").insert({ album_id: id, image_url: r.url, sort_order: ++o }); if (error) setMsg(error.message); } catch (x: any) { setMsg(`${f.name}: ${x.message}`); } }
    await logAction("updated", "gallery_items", `added images to album ${album?.title}`, id); e.target.value = ""; setBusy(false); load();
  }
  const upd = (i: any, p: any) => sb.from("gallery_items").update(p).eq("id", i.id).then(({ error }) => error && setMsg(error.message));
  async function del(i: any) { if (!confirm("Remove this image from the album?")) return; await sb.from("gallery_items").delete().eq("id", i.id); load(); }
  async function move(k: number, d: number) { const a = [...items]; const j = k + d; if (j < 0 || j >= a.length) return; [a[k], a[j]] = [a[j], a[k]]; await Promise.all(a.map((r, x) => sb.from("gallery_items").update({ sort_order: x + 1 }).eq("id", r.id))); load(); }
  return (<div><Link href="/admin/albums" className="text-sm underline">← Back to albums</Link><h1 className="mb-4 mt-2 text-2xl font-bold text-primary">Images: {album?.title}</h1>
    <label className="btn mb-4 cursor-pointer">{busy ? "Uploading…" : "Upload images"}<input type="file" multiple accept="image/*" className="sr-only" disabled={busy} onChange={up} /></label>{msg && <p role="alert" className="mb-3 text-red-700">{msg}</p>}
    {!items.length ? <p className="rounded border border-dashed p-8 text-center text-stone-500">No images in this album yet.</p> : <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((i, k) => <li key={i.id} className="rounded border bg-white p-2">
      <img src={i.image_url} alt={i.alt_text ?? ""} loading="lazy" className="h-40 w-full rounded object-cover" />
      <input aria-label="Caption" placeholder="Caption" defaultValue={i.caption ?? ""} onBlur={(e) => upd(i, { caption: e.target.value })} className="input mt-2" /><input aria-label="Alt text" placeholder="Alt text (describe the image)" defaultValue={i.alt_text ?? ""} onBlur={(e) => upd(i, { alt_text: e.target.value })} className="input mt-2" />
      <div className="mt-2 flex flex-wrap gap-2 text-sm"><button className="rounded border px-3 py-2" onClick={() => move(k, -1)} aria-label="Move earlier">←</button><button className="rounded border px-3 py-2" onClick={() => move(k, 1)} aria-label="Move later">→</button>
        <button className="rounded border px-3 py-2" onClick={async () => { await sb.from("gallery_albums").update({ cover_image: i.image_url }).eq("id", id); setMsg("Cover updated."); }}>Set as cover</button><button className="ml-auto rounded border border-red-300 px-3 py-2 text-red-700" onClick={() => del(i)}>Remove</button></div></li>)}</ul>}</div>);
}
