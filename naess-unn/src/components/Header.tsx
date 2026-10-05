"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
type Item = { id: string; label: string; url: string; children: { id: string; label: string; url: string }[] };
export default function Header({ name, logo, items }: { name: string; logo: string | null; items: Item[] }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:p-3">Skip to content</a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-3 font-bold text-primary">{logo && <img src={logo} alt="" className="h-10 w-auto" />}<span className="text-lg">{name}</span></Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {items.map((i) => <div key={i.id} className="group relative"><Link href={i.url} className="block rounded px-3 py-2 text-sm font-medium hover:text-secondary">{i.label}{i.children.length > 0 && " ▾"}</Link>
            {i.children.length > 0 && <ul className="absolute left-0 hidden min-w-48 rounded border bg-white py-1 shadow group-focus-within:block group-hover:block">{i.children.map((c) => <li key={c.id}><Link href={c.url} className="block px-4 py-2 text-sm hover:bg-stone-50">{c.label}</Link></li>)}</ul>}</div>)}
          <Link href="/search" aria-label="Search" className="p-2"><Search size={18} /></Link>
        </nav>
        <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="p-2 lg:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav aria-label="Mobile" className="max-h-[80vh] overflow-y-auto border-t bg-white px-5 py-3 lg:hidden">
        {items.map((i) => <div key={i.id}><Link href={i.url} onClick={() => setOpen(false)} className="block py-3 font-medium">{i.label}</Link>{i.children.map((c) => <Link key={c.id} href={c.url} onClick={() => setOpen(false)} className="block py-2 pl-5 text-sm text-stone-600">{c.label}</Link>)}</div>)}
        <Link href="/search" onClick={() => setOpen(false)} className="block py-3 font-medium">Search</Link></nav>}
    </header>);
}
