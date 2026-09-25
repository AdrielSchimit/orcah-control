import { NextResponse } from "next/server";
import { asaasBaseUrl, asaasConfigured } from "@/lib/asaas";
import { prisma } from "@/lib/db";

export async function GET() {
  const started = Date.now();
  let database = { ok: false, latencyMs: undefined as number | undefined, error: undefined as string | undefined };
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = { ok: true, latencyMs: Date.now() - started, error: undefined };
  } catch (cause) {
    database = { ok: false, latencyMs: Date.now() - started, error: cause instanceof Error ? cause.message : "Falha no banco." };
  }

  const configured = asaasConfigured();
  let asaas = { ok: false, configured, error: undefined as string | undefined };
  if (configured) {
    try {
      const response = await fetch(`${asaasBaseUrl()}/customers?limit=1`, {
        method: "GET",
        headers: {
          accept: "application/json",
          access_token: process.env.ASAAS_API_KEY?.trim() ?? "",
          Authorization: `Bearer ${process.env.ASAAS_API_KEY?.trim() ?? ""}`,
        },
        cache: "no-store",
      });
      asaas = { ok: response.ok, configured: true, error: response.ok ? undefined : `HTTP ${response.status}` };
    } catch (cause) {
      asaas = { ok: false, configured: true, error: cause instanceof Error ? cause.message : "Falha no Asaas." };
    }
  }

  return NextResponse.json({ app: "online", database, asaas });
}
