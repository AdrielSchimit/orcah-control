import { Badge, DataTable, DateValue, LinkCell, PageHeader, ReadOnlyNotice, SearchForm, Td, Th } from "@/components/ui";
import { money } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { listBudgets } from "@/lib/queries";

export default async function BudgetsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireSession();
  const params = await searchParams;
  const budgets = await listBudgets(params.q, params.status);
  return (
    <>
      <PageHeader title="Orçamentos" description="Orçamentos do ORÇAH com status, valores e vínculo com empresa/cliente." />
      <ReadOnlyNotice />
      <SearchForm
        placeholder="Buscar por número, cliente ou empresa"
        status={{
          name: "status",
          options: [
            { label: "Todos", value: "" },
            { label: "draft", value: "draft" },
            { label: "sent", value: "sent" },
            { label: "approved", value: "approved" },
            { label: "rejected", value: "rejected" },
            { label: "waiting", value: "waiting" },
          ],
        }}
      />
      <DataTable>
        <thead><tr><Th>Número</Th><Th>Empresa</Th><Th>Cliente</Th><Th>Status</Th><Th>Subtotal</Th><Th>Desconto</Th><Th>Total</Th><Th>Criado</Th><Th>Atualizado</Th></tr></thead>
        <tbody className="divide-y divide-line">
          {budgets.map((budget) => (
            <tr key={budget.id}>
              <Td><LinkCell href={`/orcamentos/${budget.id}`}>{budget.number}</LinkCell></Td>
              <Td><LinkCell href={`/empresas/${budget.company.id}`}>{budget.company.name}</LinkCell></Td>
              <Td>{budget.customer.name}</Td>
              <Td><Badge>{budget.status}</Badge></Td>
              <Td>{money(budget.subtotal)}</Td>
              <Td>{money(budget.discount)}</Td>
              <Td>{money(budget.total)}</Td>
              <Td><DateValue value={budget.createdAt} /></Td>
              <Td><DateValue value={budget.updatedAt} /></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
