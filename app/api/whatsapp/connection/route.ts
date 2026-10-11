import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/auth/requireSession";
import { openwaConfig } from "@/lib/openwa";
import { openwaPairingStatus, openwaAccountAvailable } from "@/lib/openwa-status";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store, private", "Vary": "Cookie" };

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  const config = openwaConfig();
  if (!config) return NextResponse.json({ status: "setup", qr: null }, { headers });
  try {
    // Access this endpoint over a private network or an authenticated gateway.
    const result = await fetch(`${config.url}/health`, {
      cache: "no-store", redirect: "error", headers: { "X-API-Key": config.key }, signal: AbortSignal.timeout(4000),
    });
    if (!result.ok) throw new Error("Service unavailable");
    const health = await result.json();
    const connected = await openwaAccountAvailable(config);
    // A stale /health snapshot must not hide a current pairing QR.
    const pairing = openwaPairingStatus({ ...health, connected, session: { ...health.session, ready: connected } });
    const { qr, issue } = pairing;
    const image = qr ? await QRCode.toDataURL(qr, { width: 320, margin: 4, errorCorrectionLevel: "M" }) : null;
    return NextResponse.json({ status: connected ? "connected" : issue || (image ? "pairing" : "waiting"), qr: image }, { headers });
  } catch {
    return NextResponse.json({ status: "offline", qr: null }, { headers });
  }
}
