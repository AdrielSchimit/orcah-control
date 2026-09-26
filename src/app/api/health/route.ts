import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/health";

export async function GET() {
  return NextResponse.json(await checkHealth(), { headers: { "cache-control": "no-store" } });
}
