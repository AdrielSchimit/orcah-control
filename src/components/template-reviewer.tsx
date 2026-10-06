"use client";

import { useMemo, useState } from "react";
import type { TemplateReviewItem } from "@/lib/template-review";

type ViewMode = "capa" | "orcamento" | "formato";

function AssetPreview({
  title,
  url,
  expectedPath,
  compact = false,
}: {
  title: string;
  url: string;
  expectedPath: string;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-line/80 bg-white shadow-card">
      <div className={compact ? "relative aspect-[16/10] bg-slate-100" : "relative aspect-[16/9] bg-slate-100"}>
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={title}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-5 text-center">
            <div>
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white text-ink-soft shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="8.5" cy="9" r="1.5" />
                  <path d="m21 15-5-5L5 20" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">Arte ainda não publicada</p>
              <p className="mt-1 text-xs leading-5 text-ink-soft">Quando o SVG entrar na main, aparece aqui automaticamente.</p>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-line/70 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <span className={failed ? "rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700" : "rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"}>
            {failed ? "Pendente" : "OK"}
          </span>
        </div>
        <code className="mt-2 block truncate rounded-lg bg-slate-50 px-2.5 py-2 font-mono text-[10px] text-ink-soft" title={expectedPath}>
          {expectedPath}
        </code>
      </div>
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
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">ORÇAH · amostra</p>
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
              {item.preview.linhas.map((line) => (
                <p key={line} className="text-xs leading-5 text-ink">{line}</p>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5">
          <div className="grid grid-cols-[minmax(0,1fr)_60px_56px] gap-2 border-b border-line pb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-ink-soft sm:grid-cols-[minmax(0,1fr)_72px_70px_85px]">
            <span>Serviço</span>
            <span>Qtd.</span>
            <span>Un.</span>
            <span className="hidden text-right sm:block">Valor</span>
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
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">Detalhes que entram no modelo</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[...item.preview.linhasExtras, ...item.preview.medidas].map((line) => (
                <span key={line} className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[10px] text-ink-soft">{line}</span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">Validação</p>
            <p className="mt-1 text-xs font-medium text-ink">Modelo visual de QA — sem valores reais</p>
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
              <span key={String(label)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                {String(label)}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">Sem comportamento especial além da lista padrão de serviços.</p>
        )}
      </section>

      <section className="rounded-2xl border border-line/80 bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Campos do ramo</p>
        <div className="mt-3 divide-y divide-line/70">
          {item.campos.map((field) => (
            <div key={field.campo} className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-5">
              <div>
                <p className="text-sm font-semibold text-ink">{field.campo}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {field.obrigatorio ? <span className="text-[10px] font-bold uppercase tracking-wide text-rose-600">obrigatório</span> : <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft/60">opcional</span>}
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
        {item.excecao ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <strong>Exceção:</strong> {item.excecao}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function RamoCard({
  item,
  selected,
  onSelect,
}: {
  item: TemplateReviewItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={selected ? "group overflow-hidden rounded-2xl border border-gold bg-white text-left shadow-[0_0_0_3px_rgba(247,181,33,0.12)] transition" : "group overflow-hidden rounded-2xl border border-line/80 bg-white text-left shadow-card transition hover:-translate-y-0.5 hover:border-slate-300"}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <CardImage url={item.capaUrl} name={item.nome} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-8">
          <p className="truncate text-sm font-semibold text-white">{item.nome}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-xs font-medium text-ink-soft">{item.familiaNome}</span>
          <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[10px] font-bold text-amber-800">{item.unidadePadrao}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-ink-soft">{item.regras[0]}</p>
      </div>
    </button>
  );
}

function CardImage({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_25%_25%,rgba(247,181,33,0.18),transparent_38%),linear-gradient(135deg,#f8fafc,#eef2f7)]">
        <div className="text-center">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-ink-soft shadow-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 19.5V8.7a2 2 0 0 1 .9-1.67l6-4a2 2 0 0 1 2.2 0l6 4A2 2 0 0 1 20 8.7v10.8" />
              <path d="M8 21v-8h8v8M2 21h20" />
            </svg>
          </div>
          <p className="mt-2 max-w-[150px] truncate text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft/65">{name}</p>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" onError={() => setFailed(true)} />
  );
}

export function TemplateReviewer({
  items,
  coverConvention,
  placeholderConvention,
}: {
  items: TemplateReviewItem[];
  coverConvention: string;
  placeholderConvention: string;
}) {
  const initial = items.find((item) => item.slug === "pintor") ?? items[0];
  const [selectedSlug, setSelectedSlug] = useState(initial?.slug ?? "");
  const [mode, setMode] = useState<ViewMode>("capa");
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("");

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

  if (!selected) {
    return <div className="rounded-2xl border border-line bg-white p-6 text-sm text-ink-soft">Nenhum ramo disponível.</div>;
  }

  return (
    <div>
      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-soft">Ramos monitorados</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-soft">Famílias de modelo</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{families.length}</p>
        </div>
        <div className="rounded-2xl border border-line/80 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-soft">Ramo em revisão</p>
          <p className="mt-2 truncate text-lg font-semibold tracking-[-0.02em] text-ink">{selected.nome}</p>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        <div className="order-2 min-w-0 xl:order-1">
          <div className="mb-4 grid gap-2 rounded-2xl border border-line/80 bg-white p-2.5 shadow-card sm:grid-cols-[minmax(0,1fr)_220px]">
            <label className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-soft/50">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar ramo, slug ou família..."
                className="min-h-11 w-full rounded-xl bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-gold/40"
              />
            </label>
            <select
              value={family}
              onChange={(event) => setFamily(event.target.value)}
              className="min-h-11 rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink outline-none focus:border-gold"
            >
              <option value="">Todas as famílias</option>
              {families.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">{filtered.length} ramo(s)</p>
            <p className="text-xs text-ink-soft">Clique para revisar</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((item) => (
              <RamoCard
                key={item.slug}
                item={item}
                selected={item.slug === selected.slug}
                onSelect={() => {
                  setSelectedSlug(item.slug);
                  if (window.innerWidth < 1280) {
                    window.setTimeout(() => document.getElementById("model-inspector")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
                  }
                }}
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
                  {([
                    ["capa", "Capas"],
                    ["orcamento", "Orçamento"],
                    ["formato", "Formatação"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMode(value)}
                      className={mode === value ? "rounded-lg bg-white px-2 py-2.5 text-xs font-semibold text-ink shadow-sm" : "rounded-lg px-2 py-2.5 text-xs font-semibold text-ink-soft transition hover:text-ink"}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-paper/60 p-4 sm:p-5">
                {mode === "capa" ? (
                  <div className="grid gap-4">
                    <AssetPreview
                      title="Capa"
                      url={selected.capaUrl}
                      expectedPath={coverConvention.replace("{slug}", selected.slug)}
                    />
                    <AssetPreview
                      title="Placeholder"
                      url={selected.placeholderUrl}
                      expectedPath={placeholderConvention.replace("{slug}", selected.slug)}
                    />
                  </div>
                ) : null}
                {mode === "orcamento" ? <BudgetPreview item={selected} /> : null}
                {mode === "formato" ? <FormattingPreview item={selected} /> : null}
              </div>
            </div>

            <p className="mt-3 px-1 text-xs leading-5 text-ink-soft">
              Esse painel é de revisão. Ele lê as regras reais do ORÇAH e não altera o orçamento dos clientes.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
