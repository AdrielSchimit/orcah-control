"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-white p-6 shadow-card">
      <p className="text-sm font-semibold text-bad">Não foi possível carregar esta área.</p>
      <p className="mt-2 text-sm text-ink-soft">Tente novamente. Se persistir, confira as variáveis de ambiente do Control.</p>
      <button onClick={reset} className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
        Tentar novamente
      </button>
    </div>
  );
}
