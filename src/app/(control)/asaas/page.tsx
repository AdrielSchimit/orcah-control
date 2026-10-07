import { Badge, DataTable, DateValue, LinkCell, PageHeader, ReadOnlyNotice, Td, Th } from "@/components/ui";
import { companyIdFromExternalReference, asaasConfigured, asaasEnvironment, listAsaasCustomers, listAsaasPayments, listAsaasSubscriptions, sanitizeAsaasCustomer } from "@/lib/asaas";
import { money } from "@/lib/format";
import { controlApi } from "@/lib/control-api";
import { requireSession } from "@/lib/auth";

export default async function AsaasPage() {
  await requireSession();
  const environment = asaasEnvironment();
  const configured = asaasConfigured();
  let customers: ReturnType<typeof sanitizeAsaasCustomer>[] = [];
  let subscriptions: Awaited<ReturnType<typeof listAsaasSubscriptions>> = [];
  let payments: Awaited<ReturnType<typeof listAsaasPayments>> = [];
  let error = "";

  if (configured) {
    try {
      const [customerRows, subscriptionRows, paymentRows] = await Promise.all([
        listAsaasCustomers(),
        listAsaasSubscriptions(),
        listAsaasPayments(),
      ]);
      customers = customerRows.map(sanitizeAsaasCustomer);
      subscriptions = subscriptionRows;
      payments = paymentRows;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Falha ao ler o Asaas.";
    }
  }

  const companyIds = customers
    .map((customer) => companyIdFromExternalReference(customer.externalReference))
    .filter((id): id is number => Boolean(id));
  const companies = companyIds.length
    ? (await controlApi<{ rows: { id: number; name: string }[] }>("companies", { ids: companyIds })).rows
    : [];
  const companyById = new Map(companies.map((company) => [company.id, company]));

  return (
    <>
      <PageHeader title="Asaas" description="Leitura segura de clientes, assinaturas e pagamentos recentes. Nenhum POST/PUT/DELETE é feito." />
      <ReadOnlyNotice />
      <section className="mb-6 rounded-xl border border-line bg-card p-6 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-soft">ASAAS</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-3xl font-semibold">AMBIENTE:</span>
          <Badge tone={environment === "PRODUCAO" ? "bad" : environment === "SANDBOX" ? "blue" : "warn"}>
            {environment}
          </Badge>
        </div>
        {!configured ? <p className="mt-3 text-sm text-ink-soft">ASAAS_API_URL/ASAAS_API_KEY não configurados.</p> : null}
        {error ? <p className="mt-3 text-sm font-semibold text-bad">{error}</p> : null}
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Clientes Asaas</h2>
        <DataTable>
          <thead><tr><Th>ID Asaas</Th><Th>Nome</Th><Th>E-mail</Th><Th>CPF/CNPJ</Th><Th>Empresa ORÇAH</Th><Th>Origem</Th><Th>Criado</Th></tr></thead>
          <tbody className="divide-y divide-line">
            {customers.map((customer) => {
              const companyId = companyIdFromExternalReference(customer.externalReference);
              const company = companyId ? companyById.get(companyId) : null;
              return (
                <tr key={customer.id}>
                  <Td>{customer.id}</Td>
                  <Td>{customer.name}</Td>
                  <Td>{customer.email}</Td>
                  <Td>{customer.cpfCnpj}</Td>
                  <Td>{company ? <LinkCell href={`/empresas/${company.id}`}>{company.name} (#{company.id})</LinkCell> : "Sem vínculo identificado com ORÇAH"}</Td>
                  <Td>{company ? "ORÇAH" : "-"}</Td>
                  <Td>{customer.dateCreated || "-"}</Td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Assinaturas Asaas</h2>
        <DataTable>
          <thead><tr><Th>ID</Th><Th>Customer</Th><Th>Status</Th><Th>Billing</Th><Th>Valor</Th><Th>Próxima cobrança</Th></tr></thead>
          <tbody className="divide-y divide-line">
            {subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <Td>{subscription.id}</Td>
                <Td>{subscription.customer ?? "-"}</Td>
                <Td><Badge>{subscription.status ?? "-"}</Badge></Td>
                <Td>{subscription.billingType ?? "-"}</Td>
                <Td>{money(subscription.value)}</Td>
                <Td>{subscription.nextDueDate ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Pagamentos recentes</h2>
        <DataTable>
          <thead><tr><Th>ID</Th><Th>Status</Th><Th>Valor</Th><Th>Tipo</Th><Th>Vencimento</Th><Th>Cliente</Th></tr></thead>
          <tbody className="divide-y divide-line">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <Td>{payment.id}</Td>
                <Td><Badge>{payment.status ?? "-"}</Badge></Td>
                <Td>{money(payment.value)}</Td>
                <Td>{payment.billingType ?? "-"}</Td>
                <Td><DateValue value={payment.dueDate} /></Td>
                <Td>{payment.customer ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </>
  );
}
