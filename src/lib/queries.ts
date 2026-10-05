import { controlApi } from "@/lib/control-api";

type Row = Record<string, any>;

export async function listCompanies(query = "", status = "") {
  const result = await controlApi<{ rows: Row[] }>("companies", { q: query, status });
  return result.rows;
}

export async function getCompanyDetails(id: number) {
  const result = await controlApi<{ row: Row | null }>("company", { id });
  return result.row;
}

export async function listUsers(query = "") {
  const result = await controlApi<{ rows: Row[] }>("users", { q: query });
  return result.rows;
}

export async function listBudgets(search = "", status = "") {
  const result = await controlApi<{ rows: Row[] }>("budgets", { q: search, status });
  return result.rows;
}

export async function getBudgetDetails(id: number) {
  const result = await controlApi<{ row: Row | null }>("budget", { id });
  return result.row;
}

export async function listSubscriptions() {
  const result = await controlApi<{ rows: Row[] }>("subscriptions");
  return result.rows;
}

export async function listEvents() {
  const result = await controlApi<{ rows: Row[] }>("events");
  return result.rows;
}
