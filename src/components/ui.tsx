import Link from "next/link";
import { formatDate, money } from "@/lib/format";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6 border-b border-line/80 pb-5 sm:mb-7 sm:pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          ORÇAH Control
        </span>
        <span className="text-xs font-medium text-ink-soft/70">Monitoramento operacional</span>
      </div>
      <h1 className="mt-4 text-[1.75rem] font-semibold tracking-[-0.035em] text-ink sm:text-3xl lg:text-[2rem]">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft sm:text-[15px]">{description}</p> : null}
    </header>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line/80 bg-card p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-slate-300">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gold opacity-80" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        <span className="h-2 w-2 rounded-full bg-gold/70 ring-4 ring-gold-soft" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-ink">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-5 text-ink-soft/80">{hint}</p> : null}
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
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : tone === "bad"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : tone === "blue"
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-slate-50 text-slate-600";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

export function ReadOnlyNotice() {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-sm text-amber-950 sm:items-center">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-amber-600 shadow-sm sm:mt-0">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      </span>
      <div className="min-w-0">
        <span className="font-semibold">Modo somente leitura.</span>
        <span className="ml-1 text-amber-900/75">Nenhuma ação altera usuários, empresas, cobrança ou Asaas.</span>
      </div>
    </div>
  );
}

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line/80 bg-card shadow-card">
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="min-w-[760px] w-full text-sm [&_tbody_tr]:border-t [&_tbody_tr]:border-line/70 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-slate-50/70 [&_thead]:bg-slate-50/80">
          {children}
        </table>
      </div>
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft/75">
      {children}
    </th>
  );
}

export function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-5 py-4 align-middle text-[13px] text-ink">{children}</td>;
}

export function SearchForm({
  placeholder,
  status,
}: {
  placeholder: string;
  status?: { name: string; options: { label: string; value: string }[] };
}) {
  return (
    <form className="mb-4 grid gap-2 rounded-2xl border border-line/80 bg-card p-2.5 shadow-card sm:grid-cols-[minmax(0,1fr)_auto_auto]">
      <label className="relative block min-w-0">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-soft/50">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          name="q"
          placeholder={placeholder}
          className="min-h-11 w-full rounded-xl border border-transparent bg-slate-50 pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/55 hover:bg-slate-100 focus:border-gold/60 focus:bg-white"
        />
      </label>
      {status ? (
        <select name={status.name} className="min-h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink outline-none transition hover:border-slate-300 focus:border-gold">
          {status.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : <span className="hidden sm:block" />}
      <button className="min-h-11 rounded-xl bg-ink px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-ink-panel active:translate-y-px">
        Filtrar
      </button>
    </form>
  );
}

export function SmallSeries({ points }: { points: { label: string; count: number }[] }) {
  const max = Math.max(1, ...points.map((point) => point.count));
  return (
    <div className="mt-5">
      <div className="flex h-32 items-end gap-1.5 border-b border-line/80 pb-2">
        {points.map((point) => (
          <div key={point.label} className="group relative flex h-full min-w-0 flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-gold/85 transition group-hover:bg-gold"
              style={{ height: `${Math.max(7, (point.count / max) * 108)}px` }}
              title={`${point.label}: ${point.count}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-medium text-ink-soft/55">
        <span>{points[0]?.label ?? ""}</span>
        <span>{points.at(-1)?.label ?? ""}</span>
      </div>
    </div>
  );
}

export function LinkCell({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-ink decoration-gold decoration-2 underline-offset-4 transition hover:text-slate-600 hover:underline">
      {children}
    </Link>
  );
}

export function MetaLine({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <p className="flex flex-col gap-1 border-b border-line/70 py-3 text-sm last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <span className="text-ink-soft">{label}</span>
      <span className="break-words font-medium text-ink sm:max-w-[65%] sm:text-right">{value || "-"}</span>
    </p>
  );
}

export function MoneyLine({ label, value }: { label: string; value: unknown }) {
  return <MetaLine label={label} value={money(value as never)} />;
}

export function DateValue({ value }: { value: Date | string | null | undefined }) {
  return <>{formatDate(value)}</>;
}
