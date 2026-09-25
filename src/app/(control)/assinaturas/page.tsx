import { Badge, DataTable, DateValue, LinkCell, PageHeader, ReadOnlyNotice, Td, Th } from "@/components/ui";
import { maskExternalId, money } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { listSubscriptions } from "@/lib/queries";

export default async function SubscriptionsPage() {
  await requireSession();
  const subscriptions = await listSubscriptions();
  return (
    <>
      <PageHeader title="Assinaturas" description="Assinaturas locais do ORÇAH e IDs externos mascarados." />
      <ReadOnlyNotice />
      <DataTable>
        <thead><tr><Th>Empresa</Th><Th>Plano</Th><Th>Status</Th><Th>Valor</Th><Th>Provider</Th><Th>Billing</Th><Th>Início</Th><Th>Fim</Th><Th>Sub ext.</Th><Th>Customer ext.</Th></tr></thead>
        <tbody className="divide-y divide-line">
          {subscriptions.map((subscription) => (
            <tr key={subscription.id}>
              <Td><LinkCell href={`/empresas/${subscription.company.id}`}>{subscription.company.name}</LinkCell></Td>
              <Td>{subscription.plan}</Td>
              <Td><Badge>{subscription.status}</Badge></Td>
              <Td>{money(subscription.amount)}</Td>
              <Td>{subscription.provider}</Td>
              <Td>{subscription.billingType ?? "-"}</Td>
              <Td><DateValue value={subscription.startsAt} /></Td>
              <Td><DateValue value={subscription.endsAt} /></Td>
              <Td>{maskExternalId(subscription.providerSubscriptionId)}</Td>
              <Td>{maskExternalId(subscription.providerCustomerId)}</Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
