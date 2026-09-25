import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { CONTROL_COOKIE, controlCookieOptions, type ControlSession } from "@/lib/auth";

const sections = [
  { title: "", items: [{ href: "/dashboard", label: "Dashboard" }] },
  {
    title: "NEGÓCIO",
    items: [
      { href: "/empresas", label: "Empresas" },
      { href: "/usuarios", label: "Usuários" },
      { href: "/orcamentos", label: "Orçamentos" },
      { href: "/assinaturas", label: "Assinaturas" },
    ],
  },
  { title: "FINANCEIRO", items: [{ href: "/asaas", label: "Asaas" }] },
  {
    title: "SISTEMA",
    items: [
      { href: "/saude", label: "Saúde" },
      { href: "/eventos", label: "Eventos" },
      { href: "/logs", label: "Logs" },
    ],
  },
];

export async function logoutAction() {
  "use server";
  const jar = await cookies();
  jar.set(CONTROL_COOKIE, "", { ...controlCookieOptions(), maxAge: 0 });
  redirect("/login");
}

function SidebarContent({ session }: { session: ControlSession }) {
  return (
    <div className="flex h-full flex-col bg-ink-panel text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-lg font-semibold">ORÇAH CONTROL</p>
        <p className="mt-1 text-xs text-white/55">Monitoramento interno</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title || "top"} className="mb-5">
            {section.title ? <p className="mb-2 px-2 text-[11px] font-bold tracking-[0.16em] text-white/40">{section.title}</p> : null}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm font-medium text-white/82 hover:bg-white/10">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold">{session.name}</p>
        <p className="truncate text-xs text-white/50">{session.email}</p>
        <form action={logoutAction}>
          <button className="mt-3 w-full rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10">
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}

export function ControlShell({ session, children }: { session: ControlSession; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <SidebarContent session={session} />
      </aside>
      <div className="min-w-0">
        <div className="sticky top-0 z-20 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
          <details>
            <summary className="cursor-pointer list-none rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white">
              Menu do Control
            </summary>
            <div className="mt-3 h-[70vh] overflow-hidden rounded-lg">
              <SidebarContent session={session} />
            </div>
          </details>
        </div>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
