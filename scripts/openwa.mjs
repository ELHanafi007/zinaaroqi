import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const values = {};
for (const file of [".env", ".env.local"]) {
  const source = path.join(root, file);
  if (fs.existsSync(source)) Object.assign(values, dotenv.parse(fs.readFileSync(source)));
}
const env = { ...values, ...process.env };

if (process.argv[2] === "setup") {
  const additions = [];
  if (!env.OPENWA_API_URL) additions.push("OPENWA_API_URL=http://127.0.0.1:8080");
  if (!env.OPENWA_API_KEY) additions.push(`OPENWA_API_KEY=${crypto.randomBytes(32).toString("hex")}`);
  if (additions.length) fs.appendFileSync(path.join(root, ".env.local"), `\n# Local OpenWA service\n${additions.join("\n")}\n`, { mode: 0o600 });
  console.log("Local OpenWA settings are configured. Existing values were preserved; secrets were not printed.");
  console.log("Run npm run openwa:start, then link WhatsApp from /dashboard/whatsapp.");
  process.exit(0);
}

if (!env.OPENWA_API_KEY) {
  console.error("OpenWA cannot start yet. Run npm run openwa:setup.");
  process.exit(1);
}

// Keep OpenWA and its compatible Effect dependencies separate from Next.js.
const service = path.join(root, "services/openwa");
delete env.WA_LICENSE_KEY;
delete env.OPENWA_LICENSE_KEY;
const serviceEnv = { ...env, npm_config_cache: env.OPENWA_NPM_CACHE || path.join(root, "node_modules/.cache/openwa-npm") };
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: service, env: serviceEnv, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
}
try {
  const cli = path.join(service, "node_modules/@open-wa/wa-automate/dist/cli.cjs");
  if (!fs.existsSync(cli)) {
    const installed = await run("npm", ["install", "--no-audit", "--no-fund"]);
    if (installed !== 0) process.exit(installed);
  }
  // OpenWA v5 needs Node 22; do not change the website's Node runtime.
  process.exitCode = await run("npx", ["--yes", "--package", "node@22.22.2", "node", path.join(service, "server.mjs"), "--config", "./wa.config.mjs", "--session-id", "property-office", "--host", "127.0.0.1", "--port", "8080"]);
} catch {
  console.error("Could not start the OpenWA service.");
  process.exitCode = 1;
}
