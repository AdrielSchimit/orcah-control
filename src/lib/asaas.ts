import { maskDocument } from "@/lib/format";

export type AsaasEnvironment = "SANDBOX" | "PRODUCAO" | "NAO_CONFIGURADO";

type AsaasList<T> = { data?: T[] };

export type AsaasCustomer = {
  id: string;
  name?: string;
  email?: string;
  cpfCnpj?: string;
  externalReference?: string;
  dateCreated?: string;
};

export type AsaasSubscription = {
  id: string;
  customer?: string;
  status?: string;
  billingType?: string;
  value?: number;
  nextDueDate?: string;
};

export type AsaasPayment = {
  id: string;
  customer?: string;
  status?: string;
  billingType?: string;
  value?: number;
  dueDate?: string;
};

export function asaasBaseUrl() {
  return (process.env.ASAAS_API_URL ?? "").replace(/\/$/, "");
}

export function asaasEnvironment(url = asaasBaseUrl()): AsaasEnvironment {
  if (!url) return "NAO_CONFIGURADO";
  return /sandbox/i.test(url) ? "SANDBOX" : "PRODUCAO";
}

export function asaasConfigured() {
  return Boolean(asaasBaseUrl() && process.env.ASAAS_API_KEY?.trim());
}

async function asaasGet<T>(path: string): Promise<T> {
  const base = asaasBaseUrl();
  const key = process.env.ASAAS_API_KEY?.trim();
  if (!base || !key) throw new Error("Asaas não configurado.");

  const response = await fetch(`${base}${path}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      access_token: key,
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Asaas respondeu ${response.status}.`);
  return (await response.json()) as T;
}

export async function listAsaasCustomers() {
  const result = await asaasGet<AsaasList<AsaasCustomer>>("/customers?limit=50");
  return result.data ?? [];
}

export async function listAsaasSubscriptions() {
  const result = await asaasGet<AsaasList<AsaasSubscription>>("/subscriptions?limit=50");
  return result.data ?? [];
}

export async function listAsaasPayments() {
  const result = await asaasGet<AsaasList<AsaasPayment>>("/payments?limit=50");
  return result.data ?? [];
}

export function sanitizeAsaasCustomer(customer: AsaasCustomer) {
  return {
    id: customer.id,
    name: customer.name ?? "-",
    email: customer.email ?? "-",
    cpfCnpj: maskDocument(customer.cpfCnpj),
    externalReference: customer.externalReference ?? "",
    dateCreated: customer.dateCreated ?? "",
  };
}

export function companyIdFromExternalReference(value: string | null | undefined) {
  if (!value || !/^\d+$/.test(value.trim())) return null;
  return Number(value);
}
