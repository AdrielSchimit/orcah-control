import { currentSession } from "@/lib/auth";
import { proxySupport } from "@/lib/support-proxy";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: Request, ctx: Context) { return proxySupport(request, (await ctx.params).path, { session: currentSession }); }
export { handle as GET, handle as POST, handle as PATCH };
