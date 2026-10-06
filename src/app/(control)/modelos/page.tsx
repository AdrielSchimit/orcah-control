import { PageHeader } from "@/components/ui";
import { TemplateReviewer } from "@/components/template-reviewer";
import { requireSession } from "@/lib/auth";
import { getTemplateReviews } from "@/lib/template-review";

export default async function ModelsPage() {
  await requireSession();
  const data = await getTemplateReviews();

  return (
    <>
      <PageHeader
        title="Capas & modelos"
        description="Revise a experiência de cada ramo sem criar contas de teste: capa, placeholder, orçamento e regras de formatação em um único lugar."
      />

      <div className="mb-5 rounded-2xl border border-blue-200/70 bg-blue-50/70 px-4 py-3.5 text-sm leading-6 text-blue-950">
        <strong>Biblioteca de QA.</strong> Esta tela lê os moldes reais da aplicação principal. As artes entram automaticamente quando forem publicadas nos caminhos padrão de cada ramo.
      </div>

      <TemplateReviewer
        items={data.rows}
        catalog={data.catalog}
      />
    </>
  );
}
