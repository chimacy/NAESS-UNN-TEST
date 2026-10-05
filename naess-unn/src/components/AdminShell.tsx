"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
const groups: { t: string; super?: boolean; l: [string, string][] }[] = [
  { t: "", l: [["/admin", "Dashboard"]] },
  { t: "Content", l: [["/admin/news", "News"], ["/admin/events", "Events"], ["/admin/albums", "Gallery"], ["/admin/documents", "Documents"], ["/admin/news-categories", "News categories"], ["/admin/document-categories", "Document categories"]] },
  { t: "Association", l: [["/admin/pages", "About, Mission & Vision"], ["/admin/history", "History"], ["/admin/executives", "Executive Council"], ["/admin/administrations", "Past Executives / Sessions"], ["/admin/positions", "Positions"]] },
  { t: "Website", l: [["/admin/homepage", "Homepage"], ["/admin/navigation", "Navigation"], ["/admin/social", "Social links"], ["/admin/settings", "Footer, Contact & Settings"]] },
  { t: "Media", l: [["/admin/media", "Media Library"]] },
  { t: "System", super: true, l: [["/admin/users", "Admin Users"], ["/admin/activity", "Activity Log"]] },
];
export default function AdminShell({ name, role, children }: { name: string; role: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false); const path = usePathname(); const router = useRouter();
  return (
    <div className="min-h-screen md:flex">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-primary px-4 py-3 text-white md:hidden"><span className="font-semibold">NAESS Admin</span>
        <button aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="p-2">{open ? <X /> : <Menu />}</button></header>
      <aside className={`${open ? "flex" : "hidden"} flex-col bg-primary text-white md:flex md:min-h-screen md:w-64 md:shrink-0`}>
        <div className="hidden p-5 text-lg font-bold md:block">NAESS Admin</div>
        <nav className="flex-1 space-y-3 overflow-y-auto p-3">
          {groups.filter((g) => !g.super || role === "super_admin").map((g) => (
            <div key={g.t}>{g.t && <p className="px-3 pb-1 text-xs uppercase tracking-wide text-white/60">{g.t}</p>}
              {g.l.map(([h, l]) => <Link key={h} href={h} onClick={() => setOpen(false)} aria-current={path === h ? "page" : undefined} className={`block rounded px-3 py-2.5 text-sm ${path === h ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}>{l}</Link>)}</div>))}
          <Link href="/" target="_blank" className="block px-3 py-2.5 text-sm underline">View website ↗</Link>
        </nav>
        <div className="border-t border-white/20 p-4 text-sm"><p className="truncate font-medium">{name}</p><p className="mb-3 capitalize text-white/70">{role.replace("_", " ")}</p>
          <button className="flex items-center gap-2" onClick={async () => { await supabaseBrowser().auth.signOut(); router.push("/login"); router.refresh(); }}><LogOut size={16} />Sign out</button></div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>);
}
