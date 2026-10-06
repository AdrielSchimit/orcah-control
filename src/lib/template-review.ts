import { controlApi } from "@/lib/control-api";

export type TemplateField = {
  campo: string;
  obrigatorio: boolean;
  unidade?: string;
  regra: string;
};

export type TemplateExample = {
  name: string;
  unit: string;
  unitPrice?: string;
  kind?: string;
  groupName?: string;
  notes?: string;
};

export type TemplateForm = {
  simplified?: boolean;
  itemLayout?: string;
  showAddress?: boolean;
  showStateCity?: boolean;
  showValidity?: boolean;
  showPrazo?: boolean;
  itemNotes?: boolean;
  itemMaterial?: boolean;
  itemMeasures?: boolean;
  itemAreaM2?: boolean;
  itemPowerKwp?: boolean;
  itemVolumeM3?: boolean;
  itemSizeWH?: boolean;
  itemSizeLW?: boolean;
  itemSizeWHD?: boolean;
  addressRequired?: boolean;
  showTravelFee?: boolean;
  [key: string]: unknown;
};

export type TemplatePreview = {
  slug: string;
  titulo: string;
  unidadePadrao: string;
  linhas: string[];
  linhasExtras: string[];
  medidas: string[];
  desktop: string[];
  mobile: string[];
  pdf: string[];
};

export type TemplateReviewItem = {
  nome: string;
  slug: string;
  familia: string;
  familiaNome: string;
  moldeFino: boolean;
  excecao: string | null;
  unidades: string[];
  unidadePadrao: string;
  campos: TemplateField[];
  regras: string[];
  duplicidades: string[];
  preview: TemplatePreview;
  exemplos: TemplateExample[];
  form: TemplateForm | null;
  capaUrl: string;
  placeholderUrl: string;
};

export type TemplateReviewPayload = {
  rows: TemplateReviewItem[];
  familias: Array<{
    key: string;
    nome: string;
    clienteVe: string;
    ramos: string[];
  }>;
  assetConvention: {
    capas: string;
    placeholders: string;
  };
};

export async function getTemplateReviews() {
  return controlApi<TemplateReviewPayload>("templates");
}
