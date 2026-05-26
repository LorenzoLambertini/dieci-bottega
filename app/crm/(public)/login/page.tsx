"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/crm/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // Direct fetch — bypassa SDK per diagnostica
      try {
        const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "apikey": key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(`[debug] ${data.error_description ?? data.msg ?? JSON.stringify(data)}`);
          return;
        }
        // Login ok — set session via SDK
        const supabase = createClient();
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        router.push(redirect);
        router.refresh();
      } catch (e) {
        setError(`[debug] fetch error: ${e instanceof Error ? e.message : String(e)}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="ciao@diecibottega.it"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#E63B2E]/60 focus:bg-white/[0.06] transition-colors"
        />
      </div>

      <div>
        <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#E63B2E]/60 focus:bg-white/[0.06] transition-colors"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="text-[#E63B2E] text-sm bg-[#E63B2E]/10 border border-[#E63B2E]/20 rounded-lg px-3.5 py-2.5"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg py-2.5 transition-colors mt-2"
      >
        {isPending ? "Accesso in corso…" : "Accedi"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4">
      {/* Grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E63B2E] flex items-center justify-center">
              <span className="text-white font-black text-sm tracking-tight">
                10
              </span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Dieci Bottega
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-8">
          <h1 className="text-white font-bold text-xl mb-1">Accedi al CRM</h1>
          <p className="text-white/40 text-sm mb-8">Solo per il team interno.</p>

          <Suspense fallback={<div className="h-40 animate-pulse bg-white/[0.04] rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} Dieci Bottega · Uso interno
        </p>
      </div>
    </div>
  );
}
