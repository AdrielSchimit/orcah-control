import { Badge, PageHeader, ReadOnlyNotice, SmallSeries, StatCard } from "@/components/ui";
import { money } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/metrics";

export default async function DashboardPage() {
  await requireSession();
  const metrics = await getDashboardMetrics();

  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral read-only do ORÇAH: operação, assinaturas e valores." />
      <ReadOnlyNotice />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Empresas" value={metrics.companyCount} />
        <StatCard label="Usuários" value={metrics.userCount} />
        <StatCard label="Orçamentos" value={metrics.budgetCount} />
        <StatCard label="Assinaturas" value={metrics.subscriptionCount} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold">Assinaturas</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="warn">trial {metrics.subscriptionSummary.trialing}</Badge>
            <Badge tone="ok">ativas {metrics.subscriptionSummary.active}</Badge>
            <Badge tone="bad">vencidas {metrics.subscriptionSummary.past_due}</Badge>
            <Badge tone="neutral">canceladas {metrics.subscriptionSummary.canceled}</Badge>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold">Valor</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="Total orçado" value={money(metrics.totalBudgeted)} />
            <StatCard label="Total aprovado" value={money(metrics.totalApproved)} />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold">Usuários cadastrados - 7 dias</h2>
          <SmallSeries points={metrics.users7} />
        </div>
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold">Usuários cadastrados - 30 dias</h2>
          <SmallSeries points={metrics.users30} />
        </div>
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold">Empresas criadas - 30 dias</h2>
          <SmallSeries points={metrics.companies30} />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-line bg-card p-5 shadow-card">
        <h2 className="text-lg font-semibold">Orçamentos por status</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(metrics.budgetSummary).map(([status, count]) => (
            <Badge key={status}>{status}: {count}</Badge>
          ))}
        </div>
      </section>
    </>
  );
}
