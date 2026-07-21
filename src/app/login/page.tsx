"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Invalid email or password");
      router.replace("/dashboard");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#0a0e17] p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <div><h1 className="text-2xl font-semibold">Nexus operator login</h1><p className="mt-2 text-sm text-slate-400">Local demonstration access</p></div>
        <label className="block text-sm">Email<input aria-label="Email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2" /></label>
        <label className="block text-sm">Password<input aria-label="Password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2" /></label>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-blue-600 px-4 py-2 font-medium disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
