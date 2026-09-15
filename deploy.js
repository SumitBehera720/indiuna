// Production deployment script for INDIUNA.
// Reads credentials from deploy.config.local.js (gitignored — never commit real values).
//
// Usage:  node deploy.js            (build + full deploy)
//         node deploy.js --no-build (skip frontend builds)
//
// Deploy model: Laravel backend lives at <remoteHome>/backend and serves the
// storefront from its public/ directory (dist -> backend/public, admin/dist -> backend/public/admin).
// A public_html (Hostinger docroot) is linked to backend/public.

import { Client } from 'ssh2';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';
import { randomBytes } from 'crypto';
import config from './deploy.config.local.js';

const noBuild = process.argv.includes('--no-build');
const tmpDir = path.join(os.tmpdir(), 'indiuna-deploy-' + Date.now()).replace(/\\/g, '/');
const backendZip = path.join(tmpDir, 'backend.zip').replace(/\\/g, '/');

const remoteHome = config.remoteHome.replace(/\/+$/, '');
const backendRemote = `${remoteHome}/${config.remoteBackendDir}`;
const publicRemote = `${backendRemote}/public`;

function run(cmd, cwd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// ---------- 1. Build frontends ----------
if (!noBuild) {
  run('npm run build', process.cwd());
  run('npm run build', path.join(process.cwd(), 'admin'));
} else {
  console.log('\nSkipping frontend builds (--no-build)');
}

for (const p of ['dist', 'admin/dist', 'backend']) {
  if (!fs.existsSync(path.join(process.cwd(), p))) {
    console.error(`Missing required directory: ${p}`);
    process.exit(1);
  }
}

// ---------- 2. Create backend archive (vendor included, secrets/caches excluded) ----------
fs.mkdirSync(tmpDir, { recursive: true });
const excludes = [
  '--exclude=.env',
  '--exclude=.env.*',
  '--exclude=node_modules',
  '--exclude=storage/framework/cache/data',
  '--exclude=storage/framework/sessions',
  '--exclude=storage/framework/views',
  '--exclude=storage/logs',
  '--exclude=public/storage',
  '--exclude=public/assets',
  '--exclude=public/admin',
  '--exclude=public/images',
  '--exclude=public/index.html',
  '--exclude=database/database.sqlite',
  '--exclude=*.sqlite',
  '--exclude=.git',
  '--exclude=tests',
];
console.log('\nCreating backend archive...');
execSync(`tar -czf "${backendZip}" ${excludes.join(' ')} -C backend .`);
console.log(`Archive created: ${fs.statSync(backendZip).size} bytes`);

// ---------- 3. Connect & deploy ----------
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

async function sftpUploadDir(localDir, remoteDir, sftp) {
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const localPath = path.join(localDir, entry.name);
    const remotePath = `${remoteDir}/${entry.name}`;
    if (entry.isDirectory()) {
      await sshExec(`mkdir -p "${remotePath}"`);
      await sftpUploadDir(localPath, remotePath, sftp);
    } else {
      await new Promise((res, rej) => sftp.fastPut(localPath, remotePath, (e) => (e ? rej(e) : res())));
      process.stdout.write(`.`);
    }
  }
}

conn.on('ready', () => {
  console.log('\nSSH connection established');

  (async () => {
    try {
      // ---------- 4. Upload + extract backend ----------
      console.log('\n4. Uploading backend archive...');
      await sshExec(`mkdir -p "${backendRemote}"`);
      await sftpPut(backendZip, `${backendRemote}/backend.zip`);
      await sshExec(`cd "${backendRemote}" && (tar -xzf backend.zip || unzip -oq backend.zip) && rm -f backend.zip`);
      console.log('Backend extracted.');

      // ---------- 5. Write production .env ----------
      let existingAppKey = '';
      try {
        const remoteEnv = await sshExec(`cat "${backendRemote}/.env"`);
        const match = remoteEnv.match(/^APP_KEY=(.*)$/m);
        if (match && match[1] && match[1].trim()) {
          existingAppKey = match[1].trim();
          console.log(`Found existing remote APP_KEY: ${existingAppKey}`);
        }
      } catch (e) {
        console.log('No existing remote .env or APP_KEY found, will generate a new one.');
      }

      // ---------- 5.5 Automated Live Database Backup ----------
      try {
        console.log('\n5.5 Creating live database backup...');
        const backupDir = `${remoteHome}/backups`;
        await sshExec(`mkdir -p "${backupDir}"`);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const dbHost = config.env.DB_HOST || 'localhost';
        const dbUser = config.env.DB_USERNAME || 'u256596250_indiuna01';
        const dbPass = config.env.DB_PASSWORD || '';
        const dbName = config.env.DB_DATABASE || 'u256596250_indiuna01';
        const backupFile = `${backupDir}/db_backup_${timestamp}.sql.gz`;

        await sshExec(`mysqldump -h "${dbHost}" -u "${dbUser}" -p'${dbPass}' "${dbName}" | gzip > "${backupFile}"`);
        const backupSize = (await sshExec(`ls -lh "${backupFile}" | awk '{print $5}'`)).trim();
        console.log(`Live database backed up successfully to ${backupFile} (Size: ${backupSize})`);
      } catch (e) {
        console.warn('Database backup notice (mysqldump may require specific permissions or path):', e.message);
      }

      const adminPassword = config.env.ADMIN_PASSWORD || randomBytes(12).toString('hex');
      if (!config.env.ADMIN_PASSWORD) {
        console.log(`\nGenerated admin password: ${adminPassword} (login: admin@indiuna.com)`);
      }
      const envTemplate = fs.readFileSync(
        path.join(process.cwd(), 'backend/.env.production.example'),
        'utf8'
      );
      let envContent = Object.entries({ ...config.env, ADMIN_PASSWORD: adminPassword }).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(`__${k}__`, 'g'), () => v),
        envTemplate
      );

      // Restore existing remote APP_KEY if found
      if (existingAppKey) {
        envContent = envContent.replace(/^APP_KEY=.*$/m, `APP_KEY=${existingAppKey}`);
      }

      const envBase64 = Buffer.from(envContent).toString('base64');
      await sshExec(`echo ${envBase64} | base64 -d > "${backendRemote}/.env"`);
      console.log('Production .env written.');

      // ---------- 6. Laravel setup ----------
      const art = `cd "${backendRemote}" && php artisan`;
      try {
        await sshExec(`${art} optimize:clear`);
      } catch (e) {
        console.log('Clearing cache failed (expected on first run):', e.message);
      }
      if (!existingAppKey) {
        await sshExec(`${art} key:generate --force`);
      } else {
        console.log('Skipping key:generate as remote APP_KEY was preserved.');
      }
      await sshExec(`${art} migrate --force`);
      console.log('Skipped db:seed --force to avoid hampering active database records.');
      await sshExec(`php "${backendRemote}/seed_cats_v3.php"`);
      console.log('Categories seeded (V3 2-Tier).');
      await sshExec(`php "${backendRemote}/restore_product_categories.php"`);
      console.log('Product categories restored.');
      await sshExec(`php "${backendRemote}/auto_restore.php"`);
      console.log('Category images and unlinked products auto-restored.');
      try {
        await sshExec(`${art} storage:link`);
      } catch {
        console.warn('php storage:link unavailable (symlink/exec disabled) — creating symlink via ln -s.');
        await sshExec(`cd "${backendRemote}/public" && rm -f storage && ln -s ../storage/app/public storage`);
      }
      await sshExec(`chmod -R 775 "${backendRemote}/storage" "${backendRemote}/bootstrap/cache"`);
      await sshExec(`mkdir -p "${backendRemote}/storage/framework/views" "${backendRemote}/storage/framework/cache/data" "${backendRemote}/storage/framework/sessions" "${backendRemote}/storage/logs" "${backendRemote}/bootstrap/cache"`);
      await sshExec(`${art} optimize:clear`);
      await sshExec(`${art} optimize`);
      console.log('Laravel migrated + optimized (no seeding executed).');


      // ---------- 7. Upload frontends into backend/public ----------
      console.log('\n7. Uploading storefront + admin builds...');
      await sshExec(`rm -rf "${publicRemote}/assets" "${publicRemote}/admin" "${publicRemote}/images" "${publicRemote}/index.html" "${publicRemote}/vite.svg"`);
      await new Promise((res, rej) =>
        conn.sftp((e, sftp) => (e ? rej(e) : res(sftp)))
      ).then((sftp) => sftpUploadDir(path.join(process.cwd(), 'dist'), publicRemote, sftp));
      await new Promise((res, rej) =>
        conn.sftp((e, sftp) => (e ? rej(e) : res(sftp)))
      ).then((sftp) => sftpUploadDir(path.join(process.cwd(), 'admin/dist'), `${publicRemote}/admin`, sftp));
      console.log('\nFrontends uploaded.');

      // ---------- 8. Link Hostinger public_html docroot ----------
      const listing = await sshExec(`ls -la "${remoteHome}"`);
      const hasPublicHtml = /public_html/.test(listing);
      if (hasPublicHtml) {
        const home = (await sshExec(`cd "${remoteHome}" && pwd`)).trim();
        const absTarget = `${home}/${config.remoteBackendDir}/public`;
        const link = await sshExec(`readlink "${remoteHome}/public_html" || echo NOT_LINK`);
        if (link.includes('NOT_LINK')) {
          console.log('public_html is a real directory — moving it aside and symlinking backend/public.');
          await sshExec(`rm -rf "${remoteHome}/public_html_old"`);
          await sshExec(`mv "${remoteHome}/public_html" "${remoteHome}/public_html_old"`);
        } else {
          console.log('public_html already a symlink — replacing with correct absolute link.');
          await sshExec(`rm -rf "${remoteHome}/public_html"`);
        }
        await sshExec(`ln -s "${absTarget}" "${remoteHome}/public_html"`);
        console.log(`public_html linked to ${absTarget}`);
      }

      // ---------- 9. Cron for scheduler + queue (best effort) ----------
      try {
        await sshExec(
          `(crontab -l 2>/dev/null | grep -v artisan; echo '* * * * * /usr/bin/php "${backendRemote}/artisan" schedule:run >> /dev/null 2>&1') | crontab -`
        );
        console.log('Cron entry installed.');
      } catch {
        console.warn('Could not install cron via crontab — add manually in cPanel:');
        console.warn(`* * * * * /usr/bin/php ${backendRemote}/artisan schedule:run`);
      }

      console.log('\nDEPLOYMENT COMPLETED SUCCESSFULLY!');
      conn.end();
    } catch (e) {
      console.error('\nDEPLOYMENT FAILED:', e.message);
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
