/** Only expose pairing data needed by the admin page, never raw diagnostics. */
export function openwaPairingStatus(value: unknown) {
  const health = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const session = health.session && typeof health.session === "object" ? health.session as Record<string, unknown> : {};
  const connected = health.connected === true && session.ready === true;
  const license = health.license && typeof health.license === "object" ? health.license as Record<string, unknown> : {};
  const issue = !connected && license.status === "invalid" ? "licenseInvalid" :
    !connected && session.status === "blocked" ? "blocked" : null;
  const qr = !connected && typeof health.qr === "string" && health.qr.length <= 8192 ? health.qr : null;
  return { connected, qr: issue ? null : qr, issue };
}

/** Probe the browser runtime; /health readiness can survive a WhatsApp logout. */
export async function openwaAccountAvailable(config: { url: string; key: string }, fetcher = fetch) {
  try {
    const response = await fetcher(`${config.url}/office/connection`, {
      cache: "no-store", redirect: "error", headers: { "X-API-Key": config.key },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return false;
    const result: unknown = await response.json();
    return Boolean(result && typeof result === "object" && (result as Record<string, unknown>).connected === true);
  } catch { return false; }
}
