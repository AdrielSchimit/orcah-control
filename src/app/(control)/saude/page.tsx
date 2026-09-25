import { Badge, MetaLine, PageHeader, ReadOnlyNotice } from "@/components/ui";
import { asaasEnvironment } from "@/lib/asaas";
import { requireSession } from "@/lib/auth";

type HealthResponse = {
  app: string;
  database: { ok: boolean; latencyMs?: number; error?: string };
  asaas: { ok: boolean; configured: boolean; error?: string };
};

export default async function HealthPage() {
  await requireSession();
  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let data: HealthResponse | null = null;
  try {
    const response = await fetch(`${base}/api/health`, { cache: "no-store" });
    data = (await response.json()) as HealthResponse;
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
            <MetaLine label="Latência" value={data?.database.latencyMs != null ? `${data.database.latencyMs}ms` : "-"} />
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
