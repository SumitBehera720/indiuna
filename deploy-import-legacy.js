// One-off: upload changed backend files (import command, settings endpoint, routes) to prod and clear caches.
import { Client } from 'ssh2';
import config from './deploy.config.local.js';

const conn = new Client();
const remoteHome = config.remoteHome.replace(/\/+$/, '');
const backendRemote = `${remoteHome}/${config.remoteBackendDir}`;

function sshExec(cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream
        .on('close', (code) => (code !== 0 ? reject(new Error(`Failed (${code}): ${cmd}\n${out}`)) : resolve(out)))
        .on('data', (d) => { out += d.toString(); process.stdout.write(d); })
        .stderr.on('data', (d) => { out += d.toString(); process.stderr.write(d); });
    });
  });
}

function sftpPut(local, remote) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      sftp.fastPut(local, remote, (e) => (e ? reject(e) : resolve()));
    });
  });
}

conn.on('ready', () => {
  console.log('SSH connected.');
  (async () => {
    try {
      console.log('1. Uploading ImportLegacyStore.php...');
      await sftpPut('backend/app/Console/Commands/ImportLegacyStore.php', `${backendRemote}/app/Console/Commands/ImportLegacyStore.php`);
      await sftpPut('backend/app/Http/Controllers/Api/V1/SettingController.php', `${backendRemote}/app/Http/Controllers/Api/V1/SettingController.php`);
      await sftpPut('backend/routes/api.php', `${backendRemote}/routes/api.php`);
      await sftpPut('backend/app/Repositories/ProductRepository.php', `${backendRemote}/app/Repositories/ProductRepository.php`);
      await sftpPut('backend/app/Services/CartService.php', `${backendRemote}/app/Services/CartService.php`);
      await sftpPut('backend/app/Services/CheckoutService.php', `${backendRemote}/app/Services/CheckoutService.php`);
      await sftpPut('backend/app/Services/OrderService.php', `${backendRemote}/app/Services/OrderService.php`);
      await sftpPut('backend/app/Services/AnalyticsService.php', `${backendRemote}/app/Services/AnalyticsService.php`);
      await sftpPut('backend/app/Services/ReportService.php', `${backendRemote}/app/Services/ReportService.php`);
      await sftpPut('backend/database/migrations/2026_08_03_000003_add_deleted_at_to_shipping_zones_table.php', `${backendRemote}/database/migrations/2026_08_03_000003_add_deleted_at_to_shipping_zones_table.php`);

      console.log('2. Migrating + clearing caches...');
      await sshExec(`cd "${backendRemote}" && php artisan migrate --force && php artisan optimize:clear && php artisan cache:clear && php artisan route:clear`);

      console.log('\nDONE.');
      conn.end();
    } catch (e) {
      console.error('\nFAILED:', e.message);
      conn.end();
      process.exit(1);
    }
  })();
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  readyTimeout: 60000,
});
