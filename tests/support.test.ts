import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { proxySupport } from "../src/lib/support-proxy";
import { ControlGatewayError } from "../src/lib/control-api";

const session = async () => ({ userId: 2, name: "Cesar", email: "cesar" });
const request = (body: unknown = {}) => new Request("https://control.test/api/support/threads/id/messages", { method: "POST", headers: { origin: "https://control.test", "content-type": "application/json" }, body: JSON.stringify(body) });
describe("Control → gateway autenticado", () => {
  it("rejeita ação sem sessão sem chamar gateway", async () => {
    let calls = 0;
    const response = await proxySupport(request(), ["threads", "id", "claim"], { session: async () => null, gateway: async () => { calls++; throw new Error(); } });
    assert.equal(response.status, 401); assert.equal(calls, 0);
  });
  it("rejeita leitura sem sessão e operador não autorizado", async () => {
    const read = new Request("https://control.test/api/support/inbox");
    assert.equal((await proxySupport(read, ["inbox"], { session: async () => null })).status, 401);
    assert.equal((await proxySupport(read, ["inbox"], { session: async () => ({ userId: 9, email: "other", name: "Other" }) })).status, 403);
  });
  it("browser não escolhe remetente nem identidade do operador", async () => {
    let params: Record<string, unknown> = {};
    const gateway = (async (_action: unknown, input: Record<string, unknown>) => { params = input; return { ok: true }; }) as never;
    const response = await proxySupport(request({ content: "Olá", clientId: "request_123", senderName: "Adriel", senderType: "ASSISTANT", operator: { id: "1" } }), ["threads", "thread_123", "messages"], { session, gateway });
    assert.equal(response.status, 200);
    assert.deepEqual(params, { threadId: "thread_123", content: "Olá", clientId: "request_123", operation: "messages", operator: { id: "2" } });
  });
  it("preserva conflitos, limite e erro de domínio sem expor segredos", async () => {
    for (const code of [400, 404, 409, 429]) {
      const response = await proxySupport(request(), ["threads", "id", "claim"], { session, gateway: async () => { throw new ControlGatewayError(code, "Erro seguro"); } });
      assert.equal(response.status, code);
    }
    const response = await proxySupport(request(), ["threads", "id", "claim"], { session, gateway: async () => { throw new Error("secret=xxx DATABASE_URL"); } });
    assert.equal(response.status, 503); assert.ok(!(await response.text()).includes("secret"));
  });
  it("bloqueia escrita cross-site e corpo excessivo", async () => {
    const cross = new Request("https://control.test/api", { method: "POST", headers: { origin: "https://evil.test" }, body: "{}" });
    assert.equal((await proxySupport(cross, ["threads", "id", "claim"], { session })).status, 403);
    assert.equal((await proxySupport(request({ content: "x".repeat(12000) }), ["threads", "id", "messages"], { session })).status, 413);
  });
  it("nega rota e método inválidos", async () => {
    assert.equal((await proxySupport(request(), ["threads", "id", "delete"], { session })).status, 404);
    assert.equal((await proxySupport(request(), ["threads", "id", "priority"], { session })).status, 404);
  });
});
