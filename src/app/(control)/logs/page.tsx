import { PageHeader, ReadOnlyNotice } from "@/components/ui";
import { requireSession } from "@/lib/auth";

export default async function LogsPage() {
  await requireSession();
  return (
    <>
      <PageHeader title="Logs" description="Espaço reservado para logs estruturados. Nesta versão não há coleta de logs externos." />
      <ReadOnlyNotice />
      <div className="rounded-lg border border-line bg-card p-6 shadow-card">
        <p className="text-sm text-ink-soft">Nenhum log operacional é persistido pelo Control nesta primeira versão.</p>
      </div>
    </>
  );
}
