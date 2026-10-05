import { asaasBaseUrl, asaasConfigured } from "@/lib/asaas";
import { controlApi } from "@/lib/control-api";

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

export async function checkHealth({
  pingDatabase = () => controlApi<{ ok: boolean }>("health"),
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
    console.error("[health] gateway do ORCAH não respondeu");
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
