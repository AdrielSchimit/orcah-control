import { Badge, PageHeader, ReadOnlyNotice, SmallSeries, StatCard } from "@/components/ui";
import { money } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/metrics";

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line/80 bg-card p-5 shadow-card sm:p-6">
      <div>
        <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-5 text-ink-soft">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MoneyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line/80 bg-slate-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft/75">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-ink sm:text-[1.7rem]">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  await requireSession();
  const metrics = await getDashboardMetrics();

  return (
    <>
      <PageHeader title="Dashboard" description="Acompanhe o pulso do ORÇAH em um único lugar: operação, clientes, orçamentos e assinaturas." />
      <ReadOnlyNotice />

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard label="Empresas" value={metrics.companyCount} hint="cadastros ativos na base" />
        <StatCard label="Usuários" value={metrics.userCount} hint="contas registradas" />
        <StatCard label="Orçamentos" value={metrics.budgetCount} hint="documentos gerados" />
        <StatCard label="Assinaturas" value={metrics.subscriptionCount} hint="registros de cobrança" />
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Assinaturas" description="Distribuição atual por situação.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-4">
              <p className="text-sm font-medium text-amber-800">Em trial</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-amber-950">{metrics.subscriptionSummary.trialing}</p>
            </div>
            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-4">
              <p className="text-sm font-medium text-emerald-800">Ativas</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-emerald-950">{metrics.subscriptionSummary.active}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="bad">vencidas {metrics.subscriptionSummary.past_due}</Badge>
            <Badge tone="neutral">canceladas {metrics.subscriptionSummary.canceled}</Badge>
          </div>
        </Panel>

        <Panel title="Volume financeiro" description="Valores consolidados dos orçamentos registrados.">
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyMetric label="Total orçado" value={money(metrics.totalBudgeted)} />
            <MoneyMetric label="Total aprovado" value={money(metrics.totalApproved)} />
          </div>
        </Panel>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-3">
        <Panel title="Usuários · 7 dias" description="Novos cadastros na última semana.">
          <SmallSeries points={metrics.users7} />
        </Panel>
        <Panel title="Usuários · 30 dias" description="Ritmo de aquisição no mês.">
          <SmallSeries points={metrics.users30} />
        </Panel>
        <Panel title="Empresas · 30 dias" description="Novas empresas criadas no período.">
          <SmallSeries points={metrics.companies30} />
        </Panel>
      </section>

      <div className="mt-5">
        <Panel title="Orçamentos por status" description="Distribuição atual da carteira de orçamentos.">
          <div className="flex flex-wrap gap-2">
            {Object.entries(metrics.budgetSummary).map(([status, count]) => (
              <Badge key={status} tone={status === "approved" ? "ok" : status === "rejected" ? "bad" : status === "sent" ? "blue" : "neutral"}>
                {status}: {count}
              </Badge>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
