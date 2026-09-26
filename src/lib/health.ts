import { asaasBaseUrl, asaasConfigured } from "@/lib/asaas";
import { prisma } from "@/lib/db";

export type HealthReport = {
  app: "online";
  database: { ok: true; latencyMs: number } | { ok: false };
  asaas: { ok: boolean; configured: boolean };
};

type HealthDeps = {
  pingDatabase?: () => Promise<unknown>;
  pingAsaas?: () => Promise<boolean>;
  isAsaasConfigured?: () => boolean;
  now?: () => number;
};

async function defaultPingAsaas() {
  const key = process.env.ASAAS_API_KEY?.trim() ?? "";
  const response = await fetch(`${asaasBaseUrl()}/customers?limit=1`, {
    method: "GET",
    headers: { accept: "application/json", access_token: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  return response.ok;
}

/**
 * Check leve de banco e Asaas. A resposta é pública: só booleanos e latência,
 * nunca mensagem de erro, stack, URL de conexão ou detalhes do Prisma.
 */
export async function checkHealth({
  pingDatabase = () => prisma.$queryRaw`SELECT 1`,
  pingAsaas = defaultPingAsaas,
  isAsaasConfigured = asaasConfigured,
  now = Date.now,
}: HealthDeps = {}): Promise<HealthReport> {
  let database: HealthReport["database"] = { ok: false };
  const started = now();
  try {
    await pingDatabase();
    database = { ok: true, latencyMs: now() - started };
  } catch {
    // detalhes ficam fora da resposta; o log do servidor mostra só que falhou
    console.error("[health] banco não respondeu");
  }

  const configured = isAsaasConfigured();
  let asaasOk = false;
  if (configured) {
    try {
      asaasOk = await pingAsaas();
    } catch {
      asaasOk = false;
    }
  }

  return { app: "online", database, asaas: { ok: asaasOk, configured } };
}
