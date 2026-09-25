import { DataTable, DateValue, LinkCell, PageHeader, ReadOnlyNotice, SearchForm, Td, Th } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { listUsers } from "@/lib/queries";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireSession();
  const params = await searchParams;
  const users = await listUsers(params.q);
  return (
    <>
      <PageHeader title="Usuários" description="Usuários do ORÇAH sem hashes, tokens ou segredos." />
      <ReadOnlyNotice />
      <SearchForm placeholder="Buscar por nome ou e-mail" />
      <DataTable>
        <thead><tr><Th>ID</Th><Th>Nome</Th><Th>E-mail</Th><Th>Telefone</Th><Th>Empresa</Th><Th>Criado em</Th></tr></thead>
        <tbody className="divide-y divide-line">
          {users.map((user) => (
            <tr key={user.id}>
              <Td>#{user.id}</Td>
              <Td>{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>{user.phone ?? "-"}</Td>
              <Td>{user.company ? <LinkCell href={`/empresas/${user.company.id}`}>{user.company.name}</LinkCell> : "-"}</Td>
              <Td><DateValue value={user.createdAt} /></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
