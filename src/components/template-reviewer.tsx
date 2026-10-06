"use client";

import { useEffect, useMemo, useState } from "react";
import type { TemplateReviewItem } from "@/lib/template-review";

type ViewMode = "capa" | "orcamento" | "formato";
type ReviewState = {
  capa: boolean;
  orcamento: boolean;
  formato: boolean;
  notes: string;
};
type ReviewMap = Record<string, ReviewState>;

const STORAGE_KEY = "orcah-control-template-qa-v1";
const emptyReview = (): ReviewState => ({ capa: false, orcamento: false, formato: false, notes: "" });

const coverPlacements = [
  { x: 1160, y: 48, size: 180, angle: -14, opacity: 0.42 },
  { x: 1410, y: 65, size: 145, angle: 14, opacity: 0.32 },
  { x: 1310, y: 300, size: 180, angle: 10, opacity: 0.38 },
  { x: -55, y: 365, size: 150, angle: -18, opacity: 0.2 },
] as const;

function CoverPreview({ item, compact = false }: { item: TemplateReviewItem; compact?: boolean }) {
  return (
    <div
      className={compact ? "relative aspect-[3/1] w-full overflow-hidden" : "relative aspect-[3/1] w-full overflow-hidden rounded-2xl border border-line/70"}
      style={{ backgroundColor: item.coverTheme.background, color: item.coverTheme.accent }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1500 500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {item.coverTheme.icons.map((icon, index) => {
          const placement = coverPlacements[index % coverPlacements.length];
          return (
            <g
              key={`${icon.name}-${index}`}
              opacity={placement.opacity}
              transform={`translate(${placement.x} ${placement.y}) scale(${placement.size / 100}) rotate(${placement.angle} 50 50)`}
            >
              {icon.paths.map((d, pathIndex) => <path key={pathIndex} d={d} />)}
            </g>
          );
        })}
        <g opacity="0.18" strokeWidth="2">
          {item.coverTheme.pattern.map((d, index) => <path key={index} d={d} />)}
        </g>
      </svg>
    </div>
  );
}

function BudgetPreview({ item }: { item: TemplateReviewItem }) {
  const examples = item.exemplos.length
    ? item.exemplos.slice(0, 4)
    : [{ name: "Serviço principal", unit: item.unidadePadrao }];

  return (
    <div className="overflow-hidden rounded-2xl border border-line/80 bg-slate-100 p-3 sm:p-5">
      <div className="mx-auto max-w-[560px] rounded-[1.4rem] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:p-7">
        <div className="flex items-start justify-between gap-5 border-b border-line pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">ORÇAH · QA</p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">{item.preview.titulo}</h3>
            <p className="mt-1 text-xs text-ink-soft">{item.nome} · {item.familiaNome}</p>
          </div>
          <div className="rounded-xl bg-ink px-3 py-2 text-right text-white">
            <p className="text-[9px] uppercase tracking-[0.12em] text-white/55">Padrão</p>
            <p className="mt-1 text-sm font-bold">{item.unidadePadrao}</p>
          </div>
        </div>

        {item.preview.linhas.length ? (
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">Contexto do serviço</p>
            <div className="mt-2 space-y-1.5">
              {item.preview.linhas.map((line) => <p key={line} className="text-xs leading-5 text-ink">{line}</p>)}
            </div>
          </div>
        ) : null}

        <div className="mt-5">
          <div className="grid grid-cols-[minmax(0,1fr)_60px_56px] gap-2 border-b border-line pb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-ink-soft sm:grid-cols-[minmax(0,1fr)_72px_70px_85px]">
            <span>Serviço</span><span>Qtd.</span><span>Un.</span><span className="hidden text-right sm:block">Valor</span>
          </div>
          <div className="divide-y divide-line/70">
            {examples.map((example, index) => (
              <div key={`${example.name}-${index}`} className="grid grid-cols-[minmax(0,1fr)_60px_56px] gap-2 py-3 text-xs sm:grid-cols-[minmax(0,1fr)_72px_70px_85px]">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{example.name}</p>
                  {example.groupName ? <p className="mt-0.5 truncate text-[10px] text-ink-soft">{example.groupName}</p> : null}
                </div>
                <span className="text-ink-soft">{item.unidadePadrao === "m²" ? "12" : "1"}</span>
                <span className="font-semibold text-ink">{example.unit || item.unidadePadrao}</span>
                <span className="hidden text-right font-medium text-ink-soft sm:block">R$ —</span>
              </div>
            ))}
          </div>
        </div>

        {item.preview.medidas.length || item.preview.linhasExtras.length ? (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">Detalhes do modelo</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[...item.preview.linhasExtras, ...item.preview.medidas].map((line) => (
                <span key={line} className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[10px] text-ink-soft">{line}</span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">Amostra</p>
            <p className="mt-1 text-xs font-medium text-ink">Prévia de QA sem valores reais.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">Unidade padrão</p>
            <p className="mt-1 text-lg font-semibold text-ink">{item.unidadePadrao}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormattingPreview({ item }: { item: TemplateReviewItem }) {
  const formFlags = [
    ["Área em m²", item.form?.itemAreaM2 || item.form?.itemLayout === "area-m2"],
    ["Medidas", item.form?.itemMeasures || item.form?.itemSizeWH || item.form?.itemSizeLW || item.form?.itemSizeWHD],
    ["Material", item.form?.itemMaterial],
    ["Observação por item", item.form?.itemNotes],
    ["Endereço obrigatório", item.form?.addressRequired],
    ["Deslocamento", item.form?.showTravelFee],
    ["Prazo", item.form?.showPrazo],
  ].filter((entry) => Boolean(entry[1]));

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-line/80 bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Unidades</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.unidades.map((unit) => (
            <span key={unit} className={unit === item.unidadePadrao ? "rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white" : "rounded-full border border-line bg-slate-50 px-3 py-1.5 text-xs font-semibold text-ink-soft"}>
              {unit}{unit === item.unidadePadrao ? " · padrão" : ""}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line/80 bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Comportamento do formulário</p>
        {formFlags.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {formFlags.map(([label]) => (
              <span key={String(label)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">{String(label)}</span>
            ))}
          </div>
        ) : <p className="mt-3 text-sm text-ink-soft">Lista padrão de serviços, sem comportamento extra.</p>}
      </section>

      <section className="rounded-2xl border border-line/80 bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Campos do ramo</p>
        <div className="mt-3 divide-y divide-line/70">
          {item.campos.map((field) => (
            <div key={field.campo} className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-5">
              <div>
                <p className="text-sm font-semibold text-ink">{field.campo}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {field.obrigatorio
                    ? <span className="text-[10px] font-bold uppercase tracking-wide text-rose-600">obrigatório</span>
                    : <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft/60">opcional</span>}
                  {field.unidade ? <span className="text-[10px] font-bold uppercase tracking-wide text-gold">{field.unidade}</span> : null}
                </div>
              </div>
              <p className="text-sm leading-5 text-ink-soft">{field.regra}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line/80 bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Regras de QA</p>
        <div className="mt-3 space-y-2">
          {item.regras.map((rule) => (
            <div key={rule} className="flex gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-ink">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
        {item.excecao ? <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><strong>Exceção:</strong> {item.excecao}</div> : null}
      </section>
    </div>
  );
}

function CheckMark({ checked }: { checked: boolean }) {
  return (
    <span className={checked ? "grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white shadow-sm" : "grid h-7 w-7 place-items-center rounded-full border border-slate-300 bg-white text-transparent shadow-sm"}>
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function RamoCard({
  item,
  selected,
  review,
  onSelect,
  onToggleDone,
}: {
  item: TemplateReviewItem;
  selected: boolean;
  review: ReviewState;
  onSelect: () => void;
  onToggleDone: () => void;
}) {
  const done = review.capa && review.orcamento && review.formato;
  return (
    <div className={selected ? "group overflow-hidden rounded-2xl border border-gold bg-white shadow-[0_0_0_3px_rgba(247,181,33,0.12)]" : "group overflow-hidden rounded-2xl border border-line/80 bg-white shadow-card transition hover:-translate-y-0.5 hover:border-slate-300"}>
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <CoverPreview item={item} compact />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{item.nome}</p>
              <p className="mt-1 truncate text-xs text-ink-soft">{item.familiaNome}</p>
            </div>
            <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[10px] font-bold text-amber-800">{item.unidadePadrao}</span>
          </div>
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-ink-soft">{item.regras[0]}</p>
        </div>
      </button>
      <div className="flex items-center justify-between border-t border-line/70 px-4 py-3">
        <span className={done ? "text-xs font-semibold text-emerald-700" : "text-xs font-medium text-ink-soft"}>
          {done ? "Revisado" : `${Number(review.capa) + Number(review.orcamento) + Number(review.formato)}/3 checks`}
        </span>
        <button type="button" onClick={onToggleDone} aria-label={done ? `Reabrir revisão de ${item.nome}` : `Marcar ${item.nome} como revisado`}>
          <CheckMark checked={done} />
        </button>
      </div>
    </div>
  );
}

export function TemplateReviewer({
  items,
  catalog,
}: {
  items: TemplateReviewItem[];
  catalog: { covers: number; icons: number; renderer: string; themes: string };
}) {
  const initial = items.find((item) => item.slug === "pintor") ?? items[0];
  const [selectedSlug, setSelectedSlug] = useState(initial?.slug ?? "");
  const [mode, setMode] = useState<ViewMode>("capa");
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("");
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setReviews(JSON.parse(raw) as ReviewMap);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [hydrated, reviews]);

  const families = useMemo(
    () => Array.from(new Set(items.map((item) => item.familiaNome))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [items],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return items.filter((item) => {
      const matchesFamily = !family || item.familiaNome === family;
      const matchesQuery =
        !normalized ||
        item.nome.toLocaleLowerCase("pt-BR").includes(normalized) ||
        item.slug.toLocaleLowerCase("pt-BR").includes(normalized) ||
        item.familiaNome.toLocaleLowerCase("pt-BR").includes(normalized);
      return matchesFamily && matchesQuery;
    });
  }, [family, items, query]);

  const selected = items.find((item) => item.slug === selectedSlug) ?? initial;
  const reviewFor = (slug: string) => reviews[slug] ?? emptyReview();
  const selectedReview = selected ? reviewFor(selected.slug) : emptyReview();

  const completed = items.filter((item) => {
    const review = reviewFor(item.slug);
    return review.capa && review.orcamento && review.formato;
  }).length;

  function setReview(slug: string, patch: Partial<ReviewState>) {
    setReviews((current) => ({
      ...current,
      [slug]: { ...(current[slug] ?? emptyReview()), ...patch },
    }));
  }

  function toggleAll(slug: string) {
    const current = reviewFor(slug);
    const next = !(current.capa && current.orcamento && current.formato);
    setReview(slug, { capa: next, orcamento: next, formato: next });
  }

  if (!selected) {
    return <div className="rounded-2xl border border-line bg-white p-6 text-sm text-ink-soft">Nenhum ramo disponível.</div>;
  }

  return (
    <div>
      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-soft">Ramos monitorados</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-soft">Ícones do catálogo</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{catalog.icons}</p>
        </div>
        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-soft">Revisados</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{completed}<span className="text-sm font-medium text-ink-soft">/{items.length}</span></p>
        </div>
        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-soft">Ramo em revisão</p>
          <p className="mt-2 truncate text-lg font-semibold tracking-[-0.02em] text-ink">{selected.nome}</p>
        </div>
      </section>

      <div className="mb-5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${items.length ? (completed / items.length) * 100 : 0}%` }} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(430px,0.92fr)]">
        <div className="order-2 min-w-0 xl:order-1">
          <div className="mb-4 grid gap-2 rounded-2xl border border-line/80 bg-white p-2.5 shadow-card sm:grid-cols-[minmax(0,1fr)_220px]">
            <label className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-soft/50">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              </span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ramo, slug ou família..." className="min-h-11 w-full rounded-xl bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-gold/40" />
            </label>
            <select value={family} onChange={(event) => setFamily(event.target.value)} className="min-h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink outline-none focus:border-gold">
              <option value="">Todas as famílias</option>
              {families.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">{filtered.length} ramo(s)</p>
            <p className="text-xs text-ink-soft">Check = capa + orçamento + formatação</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((item) => (
              <RamoCard
                key={item.slug}
                item={item}
                selected={item.slug === selected.slug}
                review={reviewFor(item.slug)}
                onSelect={() => {
                  setSelectedSlug(item.slug);
                  if (window.innerWidth < 1280) {
                    window.setTimeout(() => document.getElementById("model-inspector")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
                  }
                }}
                onToggleDone={() => toggleAll(item.slug)}
              />
            ))}
          </div>
        </div>

        <aside id="model-inspector" className="order-1 min-w-0 scroll-mt-24 xl:order-2">
          <div className="xl:sticky xl:top-8">
            <div className="overflow-hidden rounded-2xl border border-line/80 bg-white shadow-card">
              <div className="border-b border-line/80 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{selected.familiaNome}</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-ink">{selected.nome}</h2>
                    <p className="mt-1 font-mono text-xs text-ink-soft">{selected.slug}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-soft">Unidade padrão</p>
                    <p className="mt-1 text-lg font-semibold text-ink">{selected.unidadePadrao}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
                  {([["capa", "Capa"], ["orcamento", "Orçamento"], ["formato", "Formatação"]] as const).map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setMode(value)} className={mode === value ? "rounded-lg bg-white px-2 py-2.5 text-xs font-semibold text-ink shadow-sm" : "rounded-lg px-2 py-2.5 text-xs font-semibold text-ink-soft transition hover:text-ink"}>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {([
                    ["capa", "Capa OK"],
                    ["orcamento", "Orçamento OK"],
                    ["formato", "Formatação OK"],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setReview(selected.slug, { [key]: !selectedReview[key] })}
                      className={selectedReview[key] ? "flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700" : "flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-xs font-semibold text-ink-soft hover:border-slate-300"}
                    >
                      <CheckMark checked={selectedReview[key]} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-paper/60 p-4 sm:p-5">
                {mode === "capa" ? (
                  <div className="space-y-4">
                    <CoverPreview item={selected} />
                    <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-card">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Tema real do César</p>
                          <p className="mt-1 text-sm text-ink">Renderizado pelo mesmo componente usado na aplicação.</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">SVG inline</span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">Ícones</p>
                          <p className="mt-2 text-xs leading-5 text-ink">{selected.coverTheme.icons.map((icon) => icon.name).join(" · ")}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">Paleta</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full border border-line" style={{ backgroundColor: selected.coverTheme.background }} />
                            <span className="h-6 w-6 rounded-full border border-line" style={{ backgroundColor: selected.coverTheme.accent }} />
                            <span className="font-mono text-[10px] text-ink-soft">{selected.coverTheme.pattern.length} patterns</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {mode === "orcamento" ? <BudgetPreview item={selected} /> : null}
                {mode === "formato" ? <FormattingPreview item={selected} /> : null}

                <div className="mt-4 rounded-2xl border border-line/80 bg-white p-4 shadow-card">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Notas da revisão</span>
                    <textarea
                      value={selectedReview.notes}
                      onChange={(event) => setReview(selected.slug, { notes: event.target.value })}
                      placeholder="Ex.: pincel ficou estranho no mobile; trocar unidade padrão; conferir texto do placeholder..."
                      className="mt-3 min-h-24 w-full resize-y rounded-xl border border-line bg-slate-50 px-3 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink-soft/55 focus:border-gold focus:bg-white"
                    />
                  </label>
                  <p className="mt-2 text-[10px] text-ink-soft/70">Checks e notas ficam salvos neste navegador.</p>
                </div>
              </div>
            </div>

            <p className="mt-3 px-1 text-xs leading-5 text-ink-soft">
              Fonte: {catalog.renderer} + {catalog.themes}. O painel não altera dados dos clientes.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
