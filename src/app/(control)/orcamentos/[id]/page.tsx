import { notFound } from "next/navigation";
import { Badge, DataTable, DateValue, MetaLine, MoneyLine, PageHeader, ReadOnlyNotice, Td, Th } from "@/components/ui";
import { money } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { getBudgetDetails } from "@/lib/queries";

export default async function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const budget = await getBudgetDetails(Number(id));
  if (!budget) notFound();
  return (
    <>
      <PageHeader title={`Orçamento ${budget.number}`} description={`Empresa ${budget.company.name}, cliente ${budget.customer.name}.`} />
      <ReadOnlyNotice />
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="font-semibold">Resumo</h2>
          <div className="mt-3">
            <MetaLine label="Status" value={<Badge>{budget.status}</Badge>} />
            <MetaLine label="Empresa" value={budget.company.name} />
            <MetaLine label="Cliente" value={budget.customer.name} />
            <MetaLine label="Criado" value={<DateValue value={budget.createdAt} />} />
            <MetaLine label="Atualizado" value={<DateValue value={budget.updatedAt} />} />
          </div>
        </div>
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="font-semibold">Valores</h2>
          <div className="mt-3">
            <MoneyLine label="Subtotal" value={budget.subtotal} />
            <MoneyLine label="Desconto" value={budget.discount} />
            <MoneyLine label="Total" value={budget.total} />
          </div>
        </div>
        <div className="rounded-lg border border-line bg-card p-5 shadow-card">
          <h2 className="font-semibold">Pagamento</h2>
          <div className="mt-3">
            <MetaLine label="Forma" value={budget.paymentMethod} />
            <MetaLine label="Condição" value={budget.paymentCondition} />
            <MoneyLine label="Entrada" value={budget.downPaymentAmount} />
          </div>
        </div>
      </section>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Itens</h2>
        <DataTable>
          <thead><tr><Th>Descrição</Th><Th>Qtd</Th><Th>Unidade</Th><Th>Unitário</Th><Th>Subtotal</Th></tr></thead>
          <tbody className="divide-y divide-line">
            {budget.items.map((item) => (
              <tr key={item.id}>
                <Td>{item.description}</Td>
                <Td>{String(item.quantity)}</Td>
                <Td>{item.unit}</Td>
                <Td>{money(item.unitPrice)}</Td>
                <Td>{money(item.subtotal)}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Eventos</h2>
        <DataTable>
          <thead><tr><Th>Tipo</Th><Th>Data</Th><Th>IP</Th></tr></thead>
          <tbody className="divide-y divide-line">
            {budget.events.map((event) => (
              <tr key={event.id}>
                <Td><Badge>{event.event}</Badge></Td>
                <Td><DateValue value={event.createdAt} /></Td>
                <Td>{event.ipAddress ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </>
  );
}
