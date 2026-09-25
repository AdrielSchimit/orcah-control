import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const CONTROL_COOKIE = "orcah_control_session";
const MAX_AGE = 60 * 60 * 8;

export type ControlSession = {
  userId: number;
  email: string;
  name: string;
};

function authSecret() {
  const value = process.env.CONTROL_AUTH_SECRET?.trim();
  if (!value || value.length < 24) {
    throw new Error("CONTROL_AUTH_SECRET ausente ou curto demais.");
  }
  return new TextEncoder().encode(value);
}

export function adminEmailSet(value = process.env.CONTROL_ADMIN_EMAILS ?? "") {
  return new Set(
    value
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function emailIsAllowed(email: string, list = adminEmailSet()) {
  return list.has(email.trim().toLowerCase());
}

export function controlCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}

export async function signControlSession(session: ControlSession) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(authSecret());
}

export async function readControlSession(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    const userId = Number(payload.userId);
    const email = typeof payload.email === "string" ? payload.email : "";
    const name = typeof payload.name === "string" ? payload.name : "";
    if (!userId || !emailIsAllowed(email)) return null;
    return { userId, email, name: name || email } satisfies ControlSession;
  } catch {
    return null;
  }
}

export async function currentSession() {
  const jar = await cookies();
  return readControlSession(jar.get(CONTROL_COOKIE)?.value);
}

export async function requireSession() {
  const session = await currentSession();
  if (!session) redirect("/login");
  return session;
}

export async function authenticateControlUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!emailIsAllowed(normalizedEmail)) {
    return { ok: false, error: "Acesso negado para este e-mail." } as const;
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  if (!user || !(await compare(password, user.passwordHash))) {
    return { ok: false, error: "E-mail ou senha inválidos." } as const;
  }

  return { ok: true, user: { userId: user.id, email: user.email, name: user.name } } as const;
}
