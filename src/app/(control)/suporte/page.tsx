import { requireSession } from "@/lib/auth";
import { SupportInbox } from "@/components/support-inbox";
export default async function SupportPage() {
  const session = await requireSession();
  return <SupportInbox operatorId={String(session.userId)} operatorName={session.userId === 2 ? "César" : session.name} />;
}
