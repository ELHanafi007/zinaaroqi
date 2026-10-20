// Run with the OpenWA v5 Easy API CLI, separately from Next.js.
// The shell/service manager must supply these variables.
if (!process.env.OPENWA_API_KEY) {
  throw new Error("Set OPENWA_API_KEY before starting OpenWA.");
}

export default {
  apiKey: process.env.OPENWA_API_KEY,
  // Free mode: do not apply paid or invalid license material.
  qrLogSkip: true,
  // Pairing through the admin page may happen long after service startup.
  qrTimeout: 0,
  authTimeout: 0,
  userDataDir: process.env.WA_USER_DATA_DIR || "./_IGNORE_property-office-user",
};
