import { Client } from 'ssh2';
import config from './deploy.config.local.js';

const remoteHome = config.remoteHome.replace(/\/+$/, '');
const backendRemote = `${remoteHome}/${config.remoteBackendDir}`;
const art = `php "${backendRemote}/artisan"`;

const conn = new Client();

function sshExec(cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream
        .on('close', (code) => {
          if (code !== 0) return reject(new Error(`Command failed (${code}): ${cmd}\n${out}`));
          resolve(out);
        })
        .on('data', (d) => { out += d.toString(); })
        .stderr.on('data', (d) => { out += d.toString(); });
    });
  });
}

conn.on('ready', async () => {
  console.log("SSH connection established. Fetching unlinked products...");
  try {
    const output = await sshExec(`${art} tinker --execute="foreach (App\\Models\\Product::all() as \\$p) { if (\\$p->categories->count() === 0) { echo \\$p->id . ' | ' . \\$p->name . PHP_EOL; } }"`);
    console.log("=== UNLINKED PRODUCTS ===");
    console.log(output);
    console.log("=========================");
  } catch (e) {
    console.error("Failed to query unlinked products:", e);
  } finally {
    conn.end();
  }
}).connect({
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
});
