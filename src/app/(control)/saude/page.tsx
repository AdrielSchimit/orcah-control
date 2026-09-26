import { Badge, MetaLine, PageHeader, ReadOnlyNotice } from "@/components/ui";
import { asaasEnvironment } from "@/lib/asaas";
import { requireSession } from "@/lib/auth";
import { checkHealth, type HealthReport } from "@/lib/health";

export default async function HealthPage() {
  await requireSession();
  // chama o check direto: buscar /api/health pela URL do deploy esbarra na proteção da Vercel
  let data: HealthReport | null = null;
  try {
    data = await checkHealth();
  } catch {
    data = null;
  }

  return (
    <>
      <PageHeader title="Saúde" description="Checks leves para banco, aplicação e Asaas." />
      <ReadOnlyNotice />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="font-semibold">Supabase / Banco</h2>
          <div className="mt-3">
            <MetaLine label="Banco" value={<Badge tone={data?.database.ok ? "ok" : "bad"}>{data?.database.ok ? "Respondendo" : "Falha"}</Badge>} />
            <MetaLine label="Latência" value={data?.database.ok ? `${data.database.latencyMs}ms` : "-"} />
          </div>
        </div>
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="font-semibold">Asaas</h2>
          <div className="mt-3">
            <MetaLine label="Status" value={<Badge tone={!data?.asaas.configured ? "warn" : data.asaas.ok ? "ok" : "bad"}>{!data?.asaas.configured ? "Não configurado" : data.asaas.ok ? "Online" : "Falha"}</Badge>} />
            <MetaLine label="Ambiente" value={asaasEnvironment()} />
          </div>
        </div>
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="font-semibold">Aplicação</h2>
          <div className="mt-3">
            <MetaLine label="Build" value={<Badge tone="ok">OK</Badge>} />
            <MetaLine label="Aplicação" value={<Badge tone={data ? "ok" : "bad"}>{data ? "Online" : "Falha"}</Badge>} />
          </div>
        </div>
      </section>
    </>
  );
}
