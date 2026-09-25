import { notFound } from "next/navigation";
import { Badge, DataTable, DateValue, MetaLine, MoneyLine, PageHeader, ReadOnlyNotice, Td, Th } from "@/components/ui";
import { money } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { getCompanyDetails } from "@/lib/queries";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const details = await getCompanyDetails(Number(id));
  if (!details) notFound();
  const { company } = details;

  return (
    <>
      <PageHeader title={company.name} description={`Empresa #${company.id}, somente leitura.`} />
      <ReadOnlyNotice />
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="font-semibold">Dados</h2>
          <div className="mt-3">
            <MetaLine label="Responsável" value={company.user.name} />
            <MetaLine label="E-mail" value={company.email} />
            <MetaLine label="WhatsApp" value={company.whatsapp} />
            <MetaLine label="Cidade/UF" value={`${company.city?.name ?? "-"} / ${company.state.uf}`} />
            <MetaLine label="Ramo" value={company.customRamoName || company.businessCategory?.name} />
            <MetaLine label="Criada em" value={<DateValue value={company.createdAt} />} />
          </div>
        </div>
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="font-semibold">Operação</h2>
          <div className="mt-3">
            <MetaLine label="Clientes" value={details.customers} />
            <MetaLine label="Orçamentos" value={details.budgets} />
            <MoneyLine label="Total orçado" value={details.total} />
          </div>
        </div>
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="font-semibold">Assinatura</h2>
          <div className="mt-3">
            <MetaLine label="Status" value={<Badge>{company.subscription?.status ?? "sem assinatura"}</Badge>} />
            <MetaLine label="Plano" value={company.subscription?.plan} />
            <MetaLine label="Provider" value={company.subscription?.provider} />
            <MetaLine label="Valor" value={money(company.subscription?.amount)} />
          </div>
        </div>
      </section>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Últimos orçamentos</h2>
        <DataTable>
          <thead><tr><Th>Número</Th><Th>Cliente</Th><Th>Status</Th><Th>Total</Th><Th>Criado</Th></tr></thead>
          <tbody className="divide-y divide-line">
            {details.recentBudgets.map((budget) => (
              <tr key={budget.id}>
                <Td>{budget.number}</Td>
                <Td>{budget.customer.name}</Td>
                <Td><Badge>{budget.status}</Badge></Td>
                <Td>{money(budget.total)}</Td>
                <Td><DateValue value={budget.createdAt} /></Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </>
  );
}
