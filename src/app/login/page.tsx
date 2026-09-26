import { redirect } from "next/navigation";
import Image from "next/image";
import { currentSession } from "@/lib/auth";
import { LoginForm } from "./ui";

export default async function LoginPage() {
  const session = await currentSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white p-6 shadow-card">
        <Image
          src="/brand/orcah-logo.svg"
          alt="Orçah"
          width={872}
          height={242}
          className="h-10 w-auto"
          priority
        />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">Control</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Painel administrativo</h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Entre com seu acesso autorizado para acompanhar o ORÇAH.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
