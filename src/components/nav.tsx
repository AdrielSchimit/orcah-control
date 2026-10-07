import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CONTROL_COOKIE, controlCookieOptions, type ControlSession } from "@/lib/auth";
import { NavLinks, type ControlNavSection } from "@/components/nav-links";

const sections: ControlNavSection[] = [
  { title: "", items: [{ href: "/dashboard", label: "Dashboard", icon: "dashboard" }] },
  {
    title: "Negócio",
    items: [
      { href: "/empresas", label: "Empresas", icon: "building" },
      { href: "/usuarios", label: "Usuários", icon: "users" },
      { href: "/suporte", label: "Suporte", icon: "support" },
      { href: "/orcamentos", label: "Orçamentos", icon: "budget" },
      { href: "/modelos", label: "Capas & modelos", icon: "models" },
      { href: "/assinaturas", label: "Assinaturas", icon: "subscription" },
    ],
  },
  { title: "Financeiro", items: [{ href: "/asaas", label: "Asaas", icon: "wallet" }] },
  {
    title: "Sistema",
    items: [
      { href: "/saude", label: "Saúde", icon: "health" },
      { href: "/eventos", label: "Eventos", icon: "events" },
      { href: "/logs", label: "Logs", icon: "logs" },
    ],
  },
];

export async function logoutAction() {
  "use server";
  const jar = await cookies();
  jar.set(CONTROL_COOKIE, "", { ...controlCookieOptions(), maxAge: 0 });
  redirect("/login");
}

function UserBlock({ session }: { session: ControlSession }) {
  const initials = session.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "OC";

  return (
    <div className="border-t border-white/[0.08] p-4">
      <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] p-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold text-xs font-black text-ink">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{session.name}</p>
          <p className="truncate text-xs text-white/42">{session.email}</p>
        </div>
      </div>
      <form action={logoutAction}>
        <button className="mt-3 w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white">
          Sair do Control
        </button>
      </form>
    </div>
  );
}

function SidebarContent({ session }: { session: ControlSession }) {
  return (
    <div className="flex h-full flex-col bg-ink-panel text-white">
      <div className="border-b border-white/[0.08] px-5 pb-5 pt-6">
        <Image
          src="/brand/orcah-logo-branco.svg"
          alt="Orçah"
          width={872}
          height={242}
          className="h-7 w-auto"
          priority
        />
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-md bg-gold px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-ink">Control</span>
          <span className="text-xs text-white/40">gestão interna</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <NavLinks sections={sections} />
      </nav>

      <UserBlock session={session} />
    </div>
  );
}

export function ControlShell({ session, children }: { session: ControlSession; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen lg:block">
        <SidebarContent session={session} />
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-40 border-b border-line/80 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
            <Image src="/brand/orcah-logo.svg" alt="Orçah" width={872} height={242} className="h-7 w-auto" priority />
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink shadow-sm">
                <span className="flex flex-col gap-1">
                  <span className="h-0.5 w-4 rounded bg-ink" />
                  <span className="h-0.5 w-4 rounded bg-ink" />
                  <span className="h-0.5 w-4 rounded bg-ink" />
                </span>
                Menu
              </summary>
              <div className="fixed inset-x-3 top-[68px] max-h-[calc(100vh-84px)] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <SidebarContent session={session} />
              </div>
            </details>
          </div>
        </div>

        <main className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10 xl:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
