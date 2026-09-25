import { Badge, DataTable, DateValue, LinkCell, PageHeader, ReadOnlyNotice, SearchForm, Td, Th } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { listCompanies } from "@/lib/queries";

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireSession();
  const params = await searchParams;
  const companies = await listCompanies(params.q, params.status);

  return (
    <>
      <PageHeader title="Empresas" description="Empresas cadastradas no ORÇAH, com dados principais e situação da assinatura." />
      <ReadOnlyNotice />
      <SearchForm
        placeholder="Buscar por nome, e-mail ou WhatsApp"
        status={{
          name: "status",
          options: [
            { label: "Todas", value: "" },
            { label: "Trial", value: "trial" },
            { label: "Ativa", value: "active" },
            { label: "Sem assinatura", value: "none" },
          ],
        }}
      />
      <DataTable>
        <thead><tr><Th>ID</Th><Th>Nome</Th><Th>Responsável</Th><Th>E-mail</Th><Th>WhatsApp</Th><Th>Cidade/UF</Th><Th>Ramo</Th><Th>Criada</Th><Th>Assinatura</Th></tr></thead>
        <tbody className="divide-y divide-line">
          {companies.map((company) => (
            <tr key={company.id}>
              <Td>#{company.id}</Td>
              <Td><LinkCell href={`/empresas/${company.id}`}>{company.name}</LinkCell></Td>
              <Td>{company.user.name}</Td>
              <Td>{company.email}</Td>
              <Td>{company.whatsapp}</Td>
              <Td>{company.city?.name ?? "-"} / {company.state.uf}</Td>
              <Td>{company.customRamoName || company.businessCategory?.name || "-"}</Td>
              <Td><DateValue value={company.createdAt} /></Td>
              <Td><Badge tone={company.subscription?.status === "active" ? "ok" : company.subscription?.status === "trialing" ? "warn" : "neutral"}>{company.subscription?.status ?? "sem assinatura"}</Badge></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
