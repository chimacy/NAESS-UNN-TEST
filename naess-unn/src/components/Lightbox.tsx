"use client";
import { useEffect, useState } from "react";
type Img = { id: string; image_url: string; caption: string | null; alt_text: string | null };
export default function Lightbox({ items }: { items: Img[] }) {
  const [i, setI] = useState<number | null>(null);
  useEffect(() => { if (i === null) return; const k = (e: KeyboardEvent) => { if (e.key === "Escape") setI(null); if (e.key === "ArrowRight") setI((x) => (x! + 1) % items.length); if (e.key === "ArrowLeft") setI((x) => (x! - 1 + items.length) % items.length); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [i, items.length]);
  return (<><ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{items.map((m, k) => <li key={m.id}><button onClick={() => setI(k)} className="block w-full" aria-label={`Open image ${k + 1}`}><img src={m.image_url} alt={m.alt_text || m.caption || ""} loading="lazy" decoding="async" className="aspect-square w-full rounded object-cover" /></button></li>)}</ul>
    {i !== null && <div role="dialog" aria-modal="true" aria-label="Image viewer" className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white" onClick={() => setI(null)}>
      <div className="flex justify-between p-4"><span className="text-sm">{i + 1} / {items.length}</span><button aria-label="Close" className="px-3 text-2xl" onClick={() => setI(null)}>✕</button></div>
      <div className="flex min-h-0 flex-1 items-center justify-between gap-2 px-2" onClick={(e) => e.stopPropagation()}><button aria-label="Previous" className="p-3 text-3xl" onClick={() => setI((i - 1 + items.length) % items.length)}>‹</button><img src={items[i].image_url} alt={items[i].alt_text || items[i].caption || ""} className="max-h-full min-w-0 max-w-full object-contain" /><button aria-label="Next" className="p-3 text-3xl" onClick={() => setI((i + 1) % items.length)}>›</button></div>
      <p className="p-4 text-center text-sm">{items[i].caption}</p></div>}</>);
}
