import assert from "node:assert/strict";
import { test } from "node:test";
import { openwaPairingStatus } from "../lib/openwa-status";

test("pairing status exposes QR only while disconnected, without raw diagnostics", () => {
  assert.deepEqual(openwaPairingStatus({ connected: false, qr: "pairing-value", license: "secret", session: { ready: false }, host: { private: true } }), { connected: false, qr: "pairing-value", issue: null });
  assert.deepEqual(openwaPairingStatus({ connected: true, session: { ready: true }, qr: "stale-code" }), { connected: true, qr: null, issue: null });
});

test("HTTP liveness alone is not session readiness; invalid and oversized QR data is dropped", () => {
  assert.deepEqual(openwaPairingStatus({ connected: true, session: { ready: false } }), { connected: false, qr: null, issue: null });
  for (const value of [null, {}, { qr: { url: "https://evil.example" } }, { qr: "a".repeat(8193) }]) {
    assert.deepEqual(openwaPairingStatus(value), { connected: false, qr: null, issue: null });
  }
});


test("invalid licenses and blocked startup show actionable states and hide stale QR", () => {
  assert.deepEqual(openwaPairingStatus({ connected: false, session: { status: "blocked" }, license: { status: "invalid", key: "secret" }, qr: "old" }), { connected: false, qr: null, issue: "licenseInvalid" });
  assert.deepEqual(openwaPairingStatus({ session: { status: "blocked" } }), { connected: false, qr: null, issue: "blocked" });
});
