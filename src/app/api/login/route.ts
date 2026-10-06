import { NextResponse } from "next/server";
import { authenticateControlUser, CONTROL_COOKIE, controlCookieOptions, signControlSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const result = await authenticateControlUser(body.email ?? "", body.password ?? "");

    if (!result.ok) {
      const response = NextResponse.json({ error: result.error }, { status: 401 });
      response.cookies.set(CONTROL_COOKIE, "", { ...controlCookieOptions(), maxAge: 0 });
      return response;
    }

    const response = NextResponse.json({ ok: true, next: "/dashboard" });
    response.cookies.set(
      CONTROL_COOKIE,
      await signControlSession(result.user),
      controlCookieOptions(),
    );
    return response;
  } catch (error) {
    console.error("[control-login] falha ao autenticar", error instanceof Error ? error.name : "erro");
    return NextResponse.json(
      { error: "O painel está temporariamente indisponível. Tente novamente em instantes." },
      { status: 503 },
    );
  }
}
