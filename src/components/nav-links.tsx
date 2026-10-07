"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type ControlNavSection = {
  title: string;
  items: Array<{
    href: string;
    label: string;
    icon: "dashboard" | "building" | "users" | "budget" | "models" | "subscription" | "wallet" | "health" | "events" | "logs" | "support";
  }>;
};

const paths: Record<ControlNavSection["items"][number]["icon"], React.ReactNode> = {
  support: <><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H3l2-5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 10h8M8 14h5"/></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  building: <><path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16"/><path d="M8 7h5M8 11h5M8 15h5M2 21h20M17 9h2a1 1 0 0 1 1 1v11"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  budget: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></>,
  models: <><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="8" height="6" rx="2"/><rect x="15" y="14" width="6" height="6" rx="2"/></>,
  subscription: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
  wallet: <><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6"/><path d="M16 13h4"/></>,
  health: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/><path d="M8 12h2l1-2 2 4 1-2h2"/></>,
  events: <><path d="M3 12h4l2-6 4 12 2-6h6"/></>,
  logs: <><path d="M4 6h16M4 12h16M4 18h10"/></>,
};

function NavIcon({ icon }: { icon: ControlNavSection["items"][number]["icon"] }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[icon]}
    </svg>
  );
}

export function NavLinks({ sections }: { sections: ControlNavSection[] }) {
  const pathname = usePathname();

  return (
    <>
      {sections.map((section) => (
        <div key={section.title || "top"} className="mb-6 last:mb-0">
          {section.title ? (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              {section.title}
            </p>
          ) : null}
          <div className="space-y-1">
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "group flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-sm"
                      : "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/68 transition hover:bg-white/[0.07] hover:text-white"
                  }
                >
                  <span className={active ? "text-gold" : "text-white/42 transition group-hover:text-white/75"}>
                    <NavIcon icon={item.icon} />
                  </span>
                  <span>{item.label}</span>
                  {active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" /> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
