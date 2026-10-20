import { resolvedWhatsAppConfig } from "@/lib/whatsapp-settings";
import { NextResponse } from "next/server";
import { requireOrdersAccess } from "@/lib/auth/requireSession";
import { fetchWhatsAppGroups } from "@/lib/openwa-groups";
export const dynamic = "force-dynamic";
export async function GET() {
  const { response } = await requireOrdersAccess();
  if (response) return response;
  const config = await resolvedWhatsAppConfig();
  if (!config) return NextResponse.json({ code: "openwaSetup" }, { status: 503 });
  try { return NextResponse.json({ data: await fetchWhatsAppGroups(config) }, { headers: { "Cache-Control": "no-store, private" } }); }
  catch { return NextResponse.json({ code: "groupsFailed" }, { status: 502 }); }
}
