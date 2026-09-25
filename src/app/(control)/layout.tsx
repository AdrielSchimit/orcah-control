import { ControlShell } from "@/components/nav";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ControlLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <ControlShell session={session}>{children}</ControlShell>;
}
