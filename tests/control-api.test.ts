import assert from "node:assert/strict";
import { it } from "node:test";
import { controlApi, ControlGatewayError } from "../src/lib/control-api";

const secret = "gateway_test_secret_32_bytes_long";

async function configured<T>(values: Record<string, string | undefined>, run: () => Promise<T>) {
  const previous = process.env;
  process.env = { ...previous, CONTROL_APP_URL: "https://main-preview.test", CONTROL_INTERNAL_SECRET: secret, NODE_ENV: "test", ...values };
  try { return await run(); }
  finally { process.env = previous; }
}

it("support fails before fetch when the destination or secret is unsafe", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; return Response.json({}); });
  const invalid = [
    { CONTROL_APP_URL: undefined },
    { CONTROL_APP_URL: "  " },
    { CONTROL_APP_URL: "not-a-url" },
    { CONTROL_APP_URL: "http://main-preview.test" },
    { CONTROL_APP_URL: "https://user:password@main-preview.test" },
    { CONTROL_APP_URL: "https://main-preview.test/prefix" },
    { CONTROL_APP_URL: "https://main-preview.test?next=other" },
    { CONTROL_APP_URL: "https://main-preview.test#fragment" },
    { CONTROL_INTERNAL_SECRET: undefined },
    { CONTROL_INTERNAL_SECRET: "a".repeat(31) },
    { CONTROL_APP_URL: "http://127.0.0.1:3000", NODE_ENV: "production" },
  ];
  for (const values of invalid) {
    await configured(values, () => assert.rejects(controlApi("support", { operation: "messages" })));
  }
  assert.equal(calls, 0);
});

it("support uses the explicit origin, authenticated body and a redirect-blocking fetch", async (t) => {
  const params = { operation: "messages", threadId: "thread_1", operator: { id: "2" }, content: "Hello" };
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init: RequestInit) => {
    assert.equal(String(input), "https://main-preview.test/api/internal/control");
    assert.equal(new Headers(init.headers).get("x-orcah-control-secret"), secret);
    assert.deepEqual(JSON.parse(String(init.body)), { action: "support", params });
    assert.equal(init.method, "POST");
    assert.equal(init.cache, "no-store");
    assert.equal(init.redirect, "error");
    assert.ok(init.signal);
    return Response.json({ ok: true });
  });
  await configured({ CONTROL_APP_URL: " https://main-preview.test/ " }, async () => {
    assert.deepEqual(await controlApi("support", params), { ok: true });
  });
});

it("support permits loopback HTTP for local fixtures and counts UTF-8 secret bytes", async (t) => {
  const urls: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    urls.push(String(input));
    return Response.json({ ok: true });
  });
  for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
    await configured({ CONTROL_APP_URL: `http://${host}:3000`, CONTROL_INTERNAL_SECRET: "é".repeat(16) }, () => controlApi("support"));
  }
  assert.deepEqual(urls, ["http://localhost:3000/api/internal/control", "http://127.0.0.1:3000/api/internal/control", "http://[::1]:3000/api/internal/control"]);
});

it("monitoring retains its existing fallback without accepting redirects", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init: RequestInit) => {
    assert.equal(String(input), "https://orcah-clone.vercel.app/api/internal/control");
    assert.equal(init.redirect, "error");
    return Response.json({ healthy: true });
  });
  await configured({ CONTROL_APP_URL: undefined, CONTROL_INTERNAL_SECRET: "existing-monitoring-secret" }, async () => {
    assert.deepEqual(await controlApi("health"), { healthy: true });
  });
});

it("support preserves domain errors and propagates rejected redirects", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json({ error: "Already claimed" }, { status: 409 }));
  await configured({}, () => assert.rejects(controlApi("support"), (error: unknown) => error instanceof ControlGatewayError && error.status === 409 && error.message === "Already claimed"));
  fetchMock.mock.mockImplementation(async () => { throw new TypeError("redirect rejected"); });
  await configured({}, () => assert.rejects(controlApi("support"), /redirect rejected/));
});
