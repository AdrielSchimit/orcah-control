import { Badge, DataTable, DateValue, LinkCell, PageHeader, ReadOnlyNotice, Td, Th } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { listEvents } from "@/lib/queries";

export default async function EventsPage() {
  await requireSession();
  const events = await listEvents();
  return (
    <>
      <PageHeader title="Eventos" description="Eventos de orçamentos registrados pelo ORÇAH." />
      <ReadOnlyNotice />
      <DataTable>
        <thead><tr><Th>Tipo</Th><Th>Orçamento</Th><Th>Empresa</Th><Th>Data</Th></tr></thead>
        <tbody className="divide-y divide-line">
          {events.map((event) => (
            <tr key={event.id}>
              <Td><Badge>{event.event}</Badge></Td>
              <Td><LinkCell href={`/orcamentos/${event.budget.id}`}>{event.budget.number}</LinkCell></Td>
              <Td><LinkCell href={`/empresas/${event.budget.company.id}`}>{event.budget.company.name}</LinkCell></Td>
              <Td><DateValue value={event.createdAt} /></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
