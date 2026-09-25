import Link from "next/link";
import { formatDate, money } from "@/lib/format";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">ORÇAH CONTROL</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink md:text-3xl">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{description}</p> : null}
    </header>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-line bg-card p-5 shadow-card">
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
      {hint ? <p className="mt-2 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "ok" | "warn" | "bad" | "blue";
  children: React.ReactNode;
}) {
  const className =
    tone === "ok"
      ? "bg-green-50 text-ok ring-green-200"
      : tone === "warn"
        ? "bg-yellow-50 text-warn ring-yellow-200"
        : tone === "bad"
          ? "bg-red-50 text-bad ring-red-200"
          : tone === "blue"
            ? "bg-blue-50 text-blue ring-blue-200"
            : "bg-slate-50 text-ink-soft ring-slate-200";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}>{children}</span>;
}

export function ReadOnlyNotice() {
  return (
    <div className="mb-5 rounded-lg border border-yellow-200 bg-gold-soft px-4 py-3 text-sm font-medium text-ink">
      Modo somente leitura. Nenhuma ação altera usuários, empresas, cobrança ou Asaas.
    </div>
  );
}

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-card shadow-card">
      <table className="min-w-full divide-y divide-line text-sm">{children}</table>
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">{children}</th>;
}

export function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-4 py-3 align-top text-ink">{children}</td>;
}

export function SearchForm({
  placeholder,
  status,
}: {
  placeholder: string;
  status?: { name: string; options: { label: string; value: string }[] };
}) {
  return (
    <form className="mb-4 flex flex-col gap-3 rounded-lg border border-line bg-card p-3 shadow-card md:flex-row">
      <input
        name="q"
        placeholder={placeholder}
        className="min-h-11 flex-1 rounded-md border border-line bg-white px-3 text-sm"
      />
      {status ? (
        <select name={status.name} className="min-h-11 rounded-md border border-line bg-white px-3 text-sm">
          {status.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
      <button className="min-h-11 rounded-md bg-ink px-4 text-sm font-semibold text-white">Filtrar</button>
    </form>
  );
}

export function SmallSeries({ points }: { points: { label: string; count: number }[] }) {
  const max = Math.max(1, ...points.map((point) => point.count));
  return (
    <div className="flex h-28 items-end gap-1">
      {points.map((point) => (
        <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-gold"
            style={{ height: `${Math.max(6, (point.count / max) * 88)}px` }}
            title={`${point.label}: ${point.count}`}
          />
          <span className="hidden text-[10px] text-ink-soft md:inline">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

export function LinkCell({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
      {children}
    </Link>
  );
}

export function MetaLine({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <p className="flex justify-between gap-4 border-b border-line py-2 text-sm last:border-0">
      <span className="text-ink-soft">{label}</span>
      <span className="text-right font-medium text-ink">{value || "-"}</span>
    </p>
  );
}

export function MoneyLine({ label, value }: { label: string; value: unknown }) {
  return <MetaLine label={label} value={money(value as never)} />;
}

export function DateValue({ value }: { value: Date | string | null | undefined }) {
  return <>{formatDate(value)}</>;
}
