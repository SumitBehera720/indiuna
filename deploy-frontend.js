import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import config from './deploy.config.local.js';

const conn = new Client();
const remoteHome = config.remoteHome.replace(/\/+$/, '');
const publicRemote = `${remoteHome}/${config.remoteBackendDir}/public`;

function sshExec(cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream
        .on('close', (code) => (code !== 0 ? reject(new Error(`Command failed (${code}): ${cmd}\n${out}`)) : resolve(out)))
        .on('data', (d) => { out += d.toString(); })
        .stderr.on('data', (d) => { out += d.toString(); });
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
      process.stdout.write('.');
    }
  }
}

conn.on('ready', () => {
  (async () => {
    try {
      console.log('connected');
      await sshExec(`rm -rf "${publicRemote}/assets" "${publicRemote}/admin" "${publicRemote}/index.html"`);
      const sftp = await new Promise((res, rej) => conn.sftp((e, s) => (e ? rej(e) : res(s))));
      console.log('uploading storefront...');
      await sftpUploadDir(path.join(process.cwd(), 'dist'), publicRemote, sftp);
      console.log('\nuploading admin...');
      await sftpUploadDir(path.join(process.cwd(), 'admin/dist'), `${publicRemote}/admin`, sftp);
      console.log('\nFRONTEND DEPLOY DONE');
    } catch (e) {
      console.error('FAILED:', e.message);
      process.exit(1);
    }
    conn.end();
  })();
});

conn.on('error', (err) => { console.error('SSH error:', err.message); process.exit(1); });
conn.connect({
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  readyTimeout: 60000,
});