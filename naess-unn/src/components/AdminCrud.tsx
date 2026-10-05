"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { RESOURCES, slugify, type Field } from "@/lib/crud";
import { uploadFile } from "@/lib/upload";
import { logAction } from "@/lib/log";
import RichText from "./RichText";
const PAGE = 15;
const toLocal = (v?: string) => { if (!v) return ""; const d = new Date(v); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); };
export default function AdminCrud({ name }: { name: string }) {
  const res = RESOURCES[name]; const sb = supabaseBrowser();
  const [rows, setRows] = useState<any[]>([]); const [count, setCount] = useState(0); const [page, setPage] = useState(0); const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true); const [err, setErr] = useState(""); const [msg, setMsg] = useState("");
  const [form, setForm] = useState<any | null>(null); const [busy, setBusy] = useState(false); const [rels, setRels] = useState<Record<string, any[]>>({});
  const size = res.sortable ? 100 : PAGE;
  const load = useCallback(async () => {
    setLoading(true); setErr("");
    let query = sb.from(res.table).select("*", { count: "exact" }).order(res.order[0], { ascending: res.order[1] }).range(page * size, page * size + size - 1);
    if (q) query = query.ilike(res.search, `%${q}%`);
    const { data, count: n, error } = await query;
    if (error) setErr("Could not load: " + error.message); else { setRows(data ?? []); setCount(n ?? 0); }
    setLoading(false);
  }, [page, q, res, size]); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    res.fields.filter((f) => f.rel).forEach(async (f) => { const { data } = await sb.from(f.rel!.table).select(`id,${f.rel!.label}`).limit(500); setRels((r) => ({ ...r, [f.rel!.table]: data ?? [] })); });
  }, [res]); // eslint-disable-line
  const relName = (f: Field, id: string) => rels[f.rel!.table]?.find((r) => r.id === id)?.[f.rel!.label] ?? "—";
  function open(row?: any) {
    const f: any = {};
    res.fields.forEach((fd) => { const v = row?.[fd.name]; f[fd.name] = fd.type === "tags" ? (v ?? []).join(", ") : fd.type === "json" ? (v == null ? "" : JSON.stringify(v, null, 1)) : fd.type === "datetime" ? toLocal(v) : fd.type === "bool" ? (row ? !!v : fd.name === "visible") : v ?? (fd.type === "select" ? fd.options![0] : ""); });
    if (row) { f.__id = row.id; f.file_name = row.file_name; f.mime_type = row.mime_type; f.size_bytes = row.size_bytes; }
    setForm(f); setMsg(""); setErr("");
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const fail = (m: string) => { setErr(m); setBusy(false); };
    const p: any = {};
    for (const f of res.fields) {
      if (f.readonly) continue;
      let v = form[f.name];
      if (f.required && (v === undefined || v === "" || v === null)) return fail(`${f.label} is required.`);
      if (f.type === "slug" && !v) v = slugify(form[f.slugFrom!] || "");
      if (f.type === "tags") v = String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
      else if (f.type === "json") { try { v = v ? JSON.parse(v) : f.name === "config" ? {} : []; } catch { return fail(`${f.label} is not valid JSON.`); } }
      else if (f.type === "datetime") v = v ? new Date(v).toISOString() : null;
      else if (f.type === "number") v = v === "" || v == null ? 0 : Number(v);
      else if (v === "") v = null;
      p[f.name] = v;
    }
    if (res.table === "documents") Object.assign(p, { file_name: form.file_name, mime_type: form.mime_type, size_bytes: form.size_bytes });
    if (res.table === "news" && p.status === "published" && !p.published_at) p.published_at = new Date().toISOString();
    if (res.touch) p.updated_at = new Date().toISOString();
    if (res.exclusive && p[res.exclusive]) await sb.from(res.table).update({ [res.exclusive]: false }).eq(res.exclusive, true);
    const r = form.__id ? await sb.from(res.table).update(p).eq("id", form.__id) : await sb.from(res.table).insert(p);
    if (r.error) return fail(r.error.code === "23505" ? "That slug or name is already used. Change it and try again." : r.error.code === "42501" ? "You do not have permission to do this." : r.error.message);
    await logAction(form.__id ? "updated" : "created", res.table, `${form.__id ? "updated" : "created"} ${res.singular}: ${p[res.search] ?? ""}`, form.__id);
    setBusy(false); setForm(null); setMsg("Saved."); load();
  }
  async function del(row: any) {
    if (!confirm(`Delete this ${res.singular}? This cannot be undone.`)) return;
    const { error } = await sb.from(res.table).delete().eq("id", row.id);
    if (error) return setErr(error.code === "42501" ? "Only Content Admins and Super Admins can delete." : error.message);
    await logAction("deleted", res.table, `deleted ${res.singular}: ${row[res.search] ?? ""}`, row.id); setMsg("Deleted."); load();
  }
  async function toggle(row: any) { const { error } = await sb.from(res.table).update({ [res.toggle!]: !row[res.toggle!] }).eq("id", row.id); if (error) setErr("No permission to change this."); else { logAction("updated", res.table, `toggled ${res.toggle} on ${row[res.search] ?? ""}`, row.id); load(); } }
  async function move(i: number, d: number) {
    const a = [...rows]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]];
    const rs = await Promise.all(a.map((r, k) => sb.from(res.table).update({ sort_order: k + 1 }).eq("id", r.id)));
    const error = rs.find((y) => y.error);
    if (error) setErr("No permission to reorder."); else load();
  }
  const cell = (f: Field, row: any) => { const v = row[f.name]; if (f.type === "bool") return v ? "Yes" : "No"; if (f.type === "relation") return relName(f, v); if (f.type === "datetime" || f.type === "date") return v ? new Date(v).toLocaleDateString() : "—"; if (f.type === "image") return v ? <img src={v} alt="" className="h-10 w-10 rounded object-cover" /> : "—"; return String(v ?? "—"); };
  const set = (n: string, v: any) => setForm((f: any) => ({ ...f, [n]: v }));
  const cls = "input";
  function input(f: Field) {
    const v = form[f.name]; const id = "f-" + f.name;
    switch (f.type) {
      case "rich": return <RichText key={form.__id ?? "new"} value={v} onChange={(h) => set(f.name, h)} />;
      case "textarea": return <textarea id={id} rows={4} className={cls} value={v} onChange={(e) => set(f.name, e.target.value)} />;
      case "json": return <textarea id={id} rows={5} className={cls + " font-mono text-sm"} value={v} onChange={(e) => set(f.name, e.target.value)} />;
      case "bool": return <input id={id} type="checkbox" className="h-5 w-5" checked={v} onChange={(e) => set(f.name, e.target.checked)} />;
      case "select": return <select id={id} className={cls} value={v} onChange={(e) => set(f.name, e.target.value)}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>;
      case "relation": return <select id={id} className={cls} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)}><option value="">— None —</option>{(rels[f.rel!.table] ?? []).filter((r) => r.id !== form.__id).map((r) => <option key={r.id} value={r.id}>{r[f.rel!.label]}</option>)}</select>;
      case "image": case "file": return <Upl f={f} v={v} onDone={(r: any) => setForm((x: any) => ({ ...x, [f.name]: r?.url ?? "", ...(f.type === "file" ? { file_name: r?.name, mime_type: r?.type, size_bytes: r?.size } : {}) }))} />;
      case "slug": return <input id={id} className={cls} value={v} placeholder="Generated from the title if left empty" onChange={(e) => set(f.name, slugify(e.target.value))} />;
      default: return <input id={id} readOnly={f.readonly} type={f.type === "number" ? "number" : f.type === "datetime" ? "datetime-local" : f.type === "date" ? "date" : f.type === "time" ? "time" : "text"} className={cls + (f.readonly ? " bg-stone-100" : "")} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} />;
    }
  }
  if (form) return (
    <form onSubmit={save} className="max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-primary">{form.__id ? "Edit" : "New"} {res.singular}</h1>
      {res.fields.map((f) => <div key={f.name}><label htmlFor={"f-" + f.name} className="mb-1 block text-sm font-medium">{f.label}{f.required && " *"}</label>{input(f)}{f.hint && <p className="mt-1 text-xs text-stone-500">{f.hint}</p>}</div>)}
      {err && <p role="alert" className="text-red-700">{err}</p>}
      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t bg-surface p-4 sm:mx-0"><button className="btn" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button><button type="button" className="rounded border px-4" onClick={() => setForm(null)}>Cancel</button></div>
    </form>);
  const pages = Math.ceil(count / size);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold text-primary">{res.title}</h1>{!res.noCreate && <button className="btn" onClick={() => open()}>+ New {res.singular}</button>}</div>
      <input aria-label="Search" placeholder="Search…" className="input mb-4 max-w-sm" value={q} onChange={(e) => { setPage(0); setQ(e.target.value); }} />
      <div aria-live="polite">{msg && <p className="mb-3 text-green-800">{msg}</p>}{err && <p role="alert" className="mb-3 text-red-700">{err}</p>}</div>
      {loading ? <p className="text-stone-500">Loading…</p> : rows.length === 0 ? <p className="rounded border border-dashed p-8 text-center text-stone-500">Nothing here yet.</p> : (
        <ul className="space-y-2">{rows.map((r, i) => (
          <li key={r.id} className="rounded-lg border border-stone-200 bg-white p-3">
            <div className="grid gap-x-4 gap-y-1 sm:grid-cols-4">{res.cols.map((c) => { const f = res.fields.find((x) => x.name === c) ?? { name: c, label: c, type: "text" as const }; return <div key={c} className="min-w-0 truncate text-sm"><span className="text-xs uppercase text-stone-400">{f.label} </span><br />{cell(f as Field, r)}</div>; })}</div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <button className="rounded border px-3 py-2" onClick={() => open(r)}>Edit</button>
              {res.preview && r.slug && <Link className="rounded border px-3 py-2" href={res.preview + r.slug} target="_blank">Preview</Link>}
              {res.extra && <Link className="rounded border px-3 py-2" href={res.extra.href + r.id}>{res.extra.label}</Link>}
              {res.toggle && <label className="flex items-center gap-2 px-2"><input type="checkbox" className="h-5 w-5" checked={!!r[res.toggle]} onChange={() => toggle(r)} />Visible</label>}
              {res.sortable && <><button aria-label="Move up" className="rounded border px-3 py-2" onClick={() => move(i, -1)}>↑</button><button aria-label="Move down" className="rounded border px-3 py-2" onClick={() => move(i, 1)}>↓</button></>}
              {!res.noDelete && <button className="ml-auto rounded border border-red-300 px-3 py-2 text-red-700" onClick={() => del(r)}>Delete</button>}
            </div></li>))}</ul>)}
      {pages > 1 && <div className="mt-4 flex items-center gap-3"><button className="rounded border px-3 py-2" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span className="text-sm">Page {page + 1} of {pages}</span><button className="rounded border px-3 py-2" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Next</button></div>}
    </div>);
}
function Upl({ f, v, onDone }: any) {
  const [b, setB] = useState(false); const [e, setE] = useState("");
  return (<div>{v && f.type === "image" && <img src={v} alt="Preview" className="mb-2 h-28 rounded border object-cover" />}{v && f.type === "file" && <p className="mb-2 break-all text-sm"><a href={v} target="_blank" className="underline">Current file</a></p>}
    <input aria-label={f.label} type="file" accept={f.type === "image" ? "image/*" : ".pdf,.doc,.docx,.xls,.xlsx"} disabled={b} onChange={async (ev) => { const file = ev.target.files?.[0]; if (!file) return; setB(true); setE(""); try { onDone(await uploadFile(file, f.type === "image" ? "images" : "documents", f.type === "image" ? "image" : "doc")); } catch (x: any) { setE(x.message); } setB(false); }} />
    {b && <p className="text-sm">Uploading…</p>}{e && <p role="alert" className="text-sm text-red-700">{e}</p>}{v && <button type="button" className="ml-2 text-sm text-red-700" onClick={() => onDone(null)}>Remove</button>}</div>);
}
