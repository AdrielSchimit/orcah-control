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

export async function controlApi<T>(action: ControlAction, params: Record<string, unknown> = {}): Promise<T> {
  const baseUrl = (process.env.CONTROL_APP_URL || "https://orcah-clone.vercel.app").replace(/\/$/, "");
  const secret = process.env.CONTROL_INTERNAL_SECRET?.trim();
  if (!secret) throw new Error("CONTROL_INTERNAL_SECRET não configurado.");

  const response = await fetch(`${baseUrl}/api/internal/control`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-orcah-control-secret": secret,
    },
    body: JSON.stringify({ action, params }),
    cache: "no-store",
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
