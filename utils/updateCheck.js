const https = require('https');
const { SERVER_VERSION } = require('../config/params');

const REMOTE_VERSION_URL = 'https://aledotcv.com/api/tempobeast/nodeversion';
const UPDATE_REPO_URL = 'https://github.com/aledotcv/tempobeast';

function fetchRemoteVersion(timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const req = https.get(REMOTE_VERSION_URL, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`Unexpected status ${res.statusCode}`));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(data.trim()));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('Request timeout'));
    });
  });
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

async function checkForUpdates() {
  try {
    const remote = await fetchRemoteVersion();
    if (!/^\d+\.\d+\.\d+$/.test(remote)) {
      console.warn('[update] remote version formating error:', remote);
      return;
    }
    const cmp = compareVersions(remote, SERVER_VERSION);
    if (cmp > 0) {
      console.log(`\n[update] A newer version (${remote}) is available. You are on ${SERVER_VERSION}.`);
      console.log(`[update] Visit ${UPDATE_REPO_URL} to download or upgrade.\n`);
    } else if (cmp === 0) {
      console.log(`[update] Server version (${SERVER_VERSION}) is up to date.`);
    } else {
      console.log(`[update] Local version (${SERVER_VERSION}) is newer than remote (${remote}).`);
    }
  } catch (e) {
    console.warn('[update] Version check failed:', e.message);
  }
}

module.exports = { checkForUpdates };
