type ControlAction =
  | "health"
  | "dashboard"
  | "companies"
  | "company"
  | "users"
  | "budgets"
  | "budget"
  | "subscriptions"
  | "events"
  | "templates"
  | "support";

export class ControlGatewayError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function supportBaseUrl() {
  const configured = process.env.CONTROL_APP_URL?.trim();
  if (!configured) throw new Error("CONTROL_APP_URL obrigatório para suporte.");

  let url: URL;
  try { url = new URL(configured); }
  catch { throw new Error("CONTROL_APP_URL inválido para suporte."); }

  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  const localHttp = url.protocol === "http:" && local && process.env.NODE_ENV !== "production";
  if ((url.protocol !== "https:" && !localHttp) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("CONTROL_APP_URL deve ser uma origem HTTPS; HTTP local permitido apenas fora de produção.");
  }
  return url.origin;
}

export async function controlApi<T>(action: ControlAction, params: Record<string, unknown> = {}): Promise<T> {
  const baseUrl = action === "support"
    ? supportBaseUrl()
    : (process.env.CONTROL_APP_URL || "https://orcah-clone.vercel.app").replace(/\/$/, "");
  const secret = process.env.CONTROL_INTERNAL_SECRET?.trim();
  if (!secret) throw new Error("CONTROL_INTERNAL_SECRET não configurado.");
  if (action === "support" && Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("CONTROL_INTERNAL_SECRET deve ter pelo menos 32 bytes para suporte.");
  }

  const response = await fetch(`${baseUrl}/api/internal/control`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-orcah-control-secret": secret,
    },
    body: JSON.stringify({ action, params }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    if (action === "support") {
      const data = await response.json().catch(() => ({}));
      throw new ControlGatewayError(response.status, typeof data.error === "string" ? data.error : "Falha no suporte.");
    }
    throw new Error(`ORCAH Control gateway respondeu ${response.status}.`);
  }

  return (await response.json()) as T;
}
