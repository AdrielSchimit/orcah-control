import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authenticateControlUser, CONTROL_COOKIE, controlCookieOptions, signControlSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const result = await authenticateControlUser(body.email ?? "", body.password ?? "");
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 401 });

  const jar = await cookies();
  jar.set(CONTROL_COOKIE, await signControlSession(result.user), controlCookieOptions());
  return NextResponse.json({ ok: true, next: "/dashboard" });
}
