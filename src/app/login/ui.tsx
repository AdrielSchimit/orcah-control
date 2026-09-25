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
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
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
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">E-mail</span>
        <input name="email" type="email" required className="min-h-12 w-full rounded-md border border-line px-3" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Senha</span>
        <input name="password" type="password" required className="min-h-12 w-full rounded-md border border-line px-3" />
      </label>
      {error ? <p className="text-sm font-medium text-bad">{error}</p> : null}
      <button disabled={loading} className="min-h-12 w-full rounded-md bg-gold px-4 font-semibold text-ink disabled:opacity-60">
        {loading ? "Entrando..." : "Entrar no Control"}
      </button>
    </form>
  );
}
