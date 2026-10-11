import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const grouped = process.platform !== "win32";
const children = new Set();
let stopping = false;

function stop(code) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) {
    try {
      if (grouped) process.kill(-child.pid, "SIGTERM");
      else child.kill("SIGTERM");
    } catch (error) {
      if (error.code !== "ESRCH") console.error(error.message);
    }
  }
}

function start(label, args) {
  const child = spawn(process.execPath, args, {
    cwd: root,
    stdio: "inherit",
    detached: grouped,
  });
  children.add(child);
  child.on("error", (error) => {
    console.error(`${label} could not start: ${error.message}`);
    children.delete(child);
    stop(1);
  });
  child.on("exit", (code, signal) => {
    // Stop the sibling service and its subprocesses when either service exits.
    stop(code ?? (signal ? 1 : 0));
    children.delete(child);
  });
}

process.on("SIGINT", () => stop(130));
process.on("SIGTERM", () => stop(143));

start("Next.js", [path.join(root, "node_modules/next/dist/bin/next"), "dev", ...process.argv.slice(2)]);
start("OpenWA", [path.join(root, "scripts/openwa.mjs"), "start"]);
