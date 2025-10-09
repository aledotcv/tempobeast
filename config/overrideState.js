
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

let enabled = false;
let host = null; 

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

function writeConfig(mutator) {
  try {
    const cfg = readConfig();
    const updated = mutator(cfg) || cfg;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
  } catch (e) {
    console.warn('[override] failed to write config:', e.message);
  }
}

function loadPersisted() {
  const cfg = readConfig();
  if (cfg.overrideHost && /^https?:\/\/[^/]+$/.test(cfg.overrideHost)) {
    host = cfg.overrideHost;
    enabled = true;
  }
}

function setOverride(newHost) {
  host = newHost;
  enabled = true;
  writeConfig(cfg => {
    cfg.overrideHost = newHost;
    return cfg;
  });
}

function disableOverride() {
  enabled = false;
  host = null;
  writeConfig(cfg => {
    delete cfg.overrideHost;
    return cfg;
  });
}

function isEnabled() { return enabled; }
function getHost() { return host; }

function applyOverride(originalUrl) {
  if (!enabled || !host || !originalUrl) return originalUrl;
  try {
    const u = new URL(originalUrl);
    const newBase = host.replace(/\/$/, '');
    return `${newBase}${u.pathname}${u.search}${u.hash}`;
  } catch (_) {
    return originalUrl; 
  }
}


loadPersisted();

module.exports = { setOverride, disableOverride, isEnabled, getHost, applyOverride };


