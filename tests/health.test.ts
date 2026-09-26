import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkHealth } from "../src/lib/health";

const quiet = async <T>(fn: () => Promise<T>) => {
  const original = console.error;
  console.error = () => undefined;
  try {
    return await fn();
  } finally {
    console.error = original;
  }
};

describe("health público", () => {
  it("banco ok: devolve só ok e latência", async () => {
    let t = 1000;
    const report = await checkHealth({
      pingDatabase: async () => {
        t += 42;
      },
      isAsaasConfigured: () => false,
      now: () => t,
    });
    assert.deepEqual(report, { app: "online", database: { ok: true, latencyMs: 42 }, asaas: { ok: false, configured: false } });
  });

  it("banco com erro: não vaza mensagem, URL nem detalhes do Prisma", async () => {
    const secret = "postgresql://postgres.ref:SENHA@pooler.supabase.com:6543/postgres";
    const report = await quiet(() =>
      checkHealth({
        pingDatabase: async () => {
          throw new Error(`Invalid \`prisma.$queryRaw()\` invocation: DATABASE_URL resolved to an empty string ${secret}`);
        },
        isAsaasConfigured: () => false,
      }),
    );
    assert.deepEqual(report, { app: "online", database: { ok: false }, asaas: { ok: false, configured: false } });
    const json = JSON.stringify(report);
    for (const leak of ["prisma", "DATABASE_URL", "SENHA", "supabase", "stack", "error"]) {
      assert.ok(!json.includes(leak), `resposta não pode conter "${leak}"`);
    }
  });

  it("Asaas com falha: só configured e ok=false, sem mensagem", async () => {
    const report = await checkHealth({
      pingDatabase: async () => undefined,
      isAsaasConfigured: () => true,
      pingAsaas: async () => {
        throw new Error("access_token inválido: aact_xxx");
      },
    });
    assert.deepEqual(report.asaas, { ok: false, configured: true });
    assert.ok(!JSON.stringify(report).includes("aact_"));
  });
});
