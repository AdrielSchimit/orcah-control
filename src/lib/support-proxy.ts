import type { ControlSession } from "./auth";
import { controlApi, ControlGatewayError } from "./control-api";

type ProxyDeps = {
  session: () => Promise<ControlSession | null>;
  gateway?: typeof controlApi;
};
const result = (data: unknown, status = 200) => Response.json(data, { status, headers: { "cache-control": "private, no-store", vary: "Cookie" } });

export async function proxySupport(request: Request, path: string[], deps: ProxyDeps) {
  try {
    const session = await deps.session();
    if (!session) return result({ error: "Faça login no Control." }, 401);
    if (session.userId !== 1 && session.userId !== 2) return result({ error: "Operador não autorizado." }, 403);
    const operator = { id: String(session.userId) };
    const url = new URL(request.url);
    const gateway = deps.gateway || controlApi;
    let operation: string, params: Record<string, unknown> = {};
    if (request.method === "GET" && path.length === 1 && path[0] === "inbox") {
      operation = "inbox"; params = { status: url.searchParams.get("status") || "", q: (url.searchParams.get("q") || "").slice(0, 100), offset: Number(url.searchParams.get("offset")) || 0 };
    } else if (path[0] === "threads" && path[1] && path[1].length <= 100) {
      params.threadId = path[1];
      if (request.method === "GET" && path.length === 2) { operation = "thread"; params.before = url.searchParams.get("before") || undefined; }
      else {
        const origin = request.headers.get("origin");
        if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== url.origin)) return result({ error: "Origem inválida." }, 403);
        const op = path[2];
        if (path.length !== 3 || (op === "priority" ? request.method !== "PATCH" : request.method !== "POST") || !["claim", "messages", "resolve", "reopen", "return-to-bot", "priority", "read"].includes(op)) return result({ error: "Rota não encontrada." }, 404);
        operation = op;
        if (Number(request.headers.get("content-length")) > 12000) return result({ error: "Requisição muito grande." }, 413);
        const reader = request.body?.getReader(); const chunks: Uint8Array[] = []; let size = 0;
        if (reader) while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 12000) { await reader.cancel(); return result({ error: "Requisição muito grande." }, 413); } chunks.push(value); }
        let body: Record<string, unknown>;
        try { const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(); body = parsed as Record<string, unknown>; }
        catch { return result({ error: "JSON inválido." }, 400); }
        // Pick allowed fields. Never forward operator/senderName/senderType received from the browser.
        if (op === "messages") params = { ...params, content: body.content, clientId: body.clientId };
        if (op === "priority") params.priority = body.priority;
        if (op === "read") params.throughId = body.throughId;
      }
    } else return result({ error: "Rota não encontrada." }, 404);
    return result(await gateway("support", { ...params, operation, operator }));
  } catch (error) {
    if (error instanceof ControlGatewayError && [400, 403, 404, 409, 429].includes(error.status)) return result({ error: error.message }, error.status);
    return result({ error: "O suporte está indisponível. Tente novamente." }, 503);
  }
}
