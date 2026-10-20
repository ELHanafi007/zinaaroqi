import { fileURLToPath } from 'node:url';
import path from 'node:path';
process.chdir(path.dirname(fileURLToPath(import.meta.url)));
if (!process.env.OPENWA_API_KEY || process.env.OPENWA_API_KEY.length < 24) throw Error('Set OPENWA_API_KEY to a random secret of at least 24 characters.');
const port = Number(process.env.PORT || 8080);
if (!Number.isInteger(port) || port < 1024 || port > 65534) throw Error('PORT must be between 1024 and 65534.');
process.argv = [process.argv[0], fileURLToPath(new URL('./server.mjs', import.meta.url)), '--config', './wa.config.mjs', '--session-id', 'property-office', '--host', '127.0.0.1', '--port', String(port)];
await import('./server.mjs');
