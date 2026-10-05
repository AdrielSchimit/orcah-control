import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const SUPABASE_PROJECT_REF = "wcrqtutmzgkjaadrhren";
const SUPABASE_POOLER_HOST = "aws-0-ca-central-1.pooler.supabase.com";

function runtimeDatabaseUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return raw;

  try {
    const url = new URL(raw);

    // Vercel/serverless deve usar o Supabase Shared Pooler em transaction mode.
    // Preservamos a senha já configurada na variável secreta e normalizamos
    // somente os dados de conexão que podem ficar obsoletos.
    if (
      url.hostname.endsWith("supabase.co") ||
      url.hostname.endsWith("pooler.supabase.com")
    ) {
      url.hostname = SUPABASE_POOLER_HOST;
      url.port = "6543";
      url.username = `postgres.${SUPABASE_PROJECT_REF}`;
      url.searchParams.set("pgbouncer", "true");
      url.searchParams.set("connection_limit", "1");
      url.searchParams.set("connect_timeout", "10");
    }

    return url.toString();
  } catch {
    return raw;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: runtimeDatabaseUrl()
      ? { db: { url: runtimeDatabaseUrl() } }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
