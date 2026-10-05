"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function Login() {
  const router = useRouter();
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const f = new FormData(e.currentTarget);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    if (error) { setErr("Invalid email or password."); setBusy(false); return; }
    router.push("/admin"); router.refresh();
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <h1 className="mb-6 text-2xl font-bold text-primary">Admin sign in</h1>
      <form onSubmit={submit} className="space-y-4">
        <div><label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="input" /></div>
        <div><label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="input" /></div>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
