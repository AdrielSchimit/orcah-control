import { pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const CONTROL_COOKIE = "orcah_control_session";
const MAX_AGE = 60 * 60 * 8;
const CESAR_PASSWORD_HASH = "pbkdf2_sha256$210000$74j-u0U2KsbGNb5BXsdKyA$TcSS0AbQsm4bvTUlW4yu6b_VE1mle4vLtSe0xN7qBOQ";

export type ControlSession = {
  userId: number;
  email: string;
  name: string;
};

type AdminCredential = {
  userId: number;
  identifier: string;
  passwordHash: string;
  name: string;
};

function authSecret() {
  const value = process.env.CONTROL_AUTH_SECRET?.trim();
  if (!value || value.length < 24) {
    throw new Error("CONTROL_AUTH_SECRET ausente ou curto demais.");
  }
  return new TextEncoder().encode(value);
}

function adminCredentials(): AdminCredential[] {
  const credentials: AdminCredential[] = [];

  const adriel = process.env.CONTROL_ADMIN_USER?.trim().toLowerCase() ?? "";
  const adrielHash = process.env.CONTROL_ADMIN_PASSWORD_HASH?.trim() ?? "";
  if (adriel && adrielHash) {
    credentials.push({ userId: 1, identifier: adriel, passwordHash: adrielHash, name: "Adriel" });
  }

  const cesar = process.env.CONTROL_CESAR_USER?.trim().toLowerCase() || "cesar";
  credentials.push({ userId: 2, identifier: cesar, passwordHash: CESAR_PASSWORD_HASH, name: "Cesar" });

  return credentials;
}

export function adminEmailSet(value = process.env.CONTROL_ADMIN_EMAILS ?? "") {
  return new Set(
    value
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function emailIsAllowed(identifier: string, list = adminEmailSet()) {
  const normalized = identifier.trim().toLowerCase();
  return Boolean(normalized) && (adminCredentials().some((credential) => credential.identifier === normalized) || list.has(normalized));
}

function verifyAdminPassword(password: string, encoded: string) {
  const [algorithm, iterationsText, saltText, expectedText] = encoded.split("$");
  if (algorithm !== "pbkdf2_sha256") return false;

  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 100_000) return false;

  try {
    const salt = Buffer.from(saltText, "base64url");
    const expected = Buffer.from(expectedText, "base64url");
    const actual = pbkdf2Sync(password, salt, iterations, expected.length, "sha256");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
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

export async function authenticateControlUser(identifier: string, password: string) {
  const normalized = identifier.trim().toLowerCase();
  const credential = adminCredentials().find((item) => item.identifier === normalized);

  if (!credential) {
    return { ok: false, error: "Acesso negado para este usuário." } as const;
  }

  if (!verifyAdminPassword(password, credential.passwordHash)) {
    return { ok: false, error: "Usuário ou senha inválidos." } as const;
  }

  return {
    ok: true,
    user: { userId: credential.userId, email: credential.identifier, name: credential.name },
  } as const;
}
