"use client";

import { FormEvent, useState } from "react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string; next?: string };
    if (!response.ok) {
      setError(data.error ?? "Não foi possível entrar.");
      setLoading(false);
      return;
    }
    window.location.assign(data.next ?? "/dashboard");
  }

  return (
    <form onSubmit={submit} autoComplete="on" className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Usuário</span>
        <input
          name="email"
          type="text"
          autoComplete="username"
          required
          placeholder="Seu usuário administrativo"
          className="min-h-12 w-full rounded-md border border-line px-3"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Senha</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-12 w-full rounded-md border border-line px-3"
        />
      </label>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line/80 bg-slate-50 px-3 py-3">
        <input
          name="remember"
          type="checkbox"
          value="on"
          defaultChecked
          className="h-4 w-4 accent-amber-500"
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">Manter conectado</span>
          <span className="block text-xs text-ink-soft">Mantém sua sessão neste navegador por até 30 dias.</span>
        </span>
      </label>

      {error ? <p className="text-sm font-medium text-bad">{error}</p> : null}
      <button disabled={loading} className="min-h-12 w-full rounded-md bg-gold px-4 font-semibold text-ink disabled:opacity-60">
        {loading ? "Entrando..." : "Entrar no Control"}
      </button>
      <p className="text-center text-xs text-ink-soft">Acesso restrito à administração do ORÇAH.</p>
    </form>
  );
}
