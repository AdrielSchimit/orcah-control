import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";
import { LoginForm } from "./ui";

export default async function LoginPage() {
  const session = await currentSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">ORÇAH CONTROL</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Acesso interno</h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Use seu usuário do ORÇAH. O acesso só é liberado para e-mails em CONTROL_ADMIN_EMAILS.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
