const fs = require('fs');
const path = require('path');


const DEFAULTS = {
  port: 3000,
  filesPort: 3001,
  serverVersion: '1.5.0',
  musicFolder: path.join('music'),
  excludedEntries: ['color.json', 'previews', 'previews.json']
};

let fileConfig = {};
const rootConfigPath = path.join(process.cwd(), 'config.json');
try {
  if (fs.existsSync(rootConfigPath)) {
    const raw = fs.readFileSync(rootConfigPath, 'utf-8');
    fileConfig = JSON.parse(raw);
  }
} catch (err) {
  console.warn(`Warning: could not parse config.json: ${err.message}. Falling back to defaults.`);
}


const merged = { ...DEFAULTS, ...fileConfig };


const PORT = Number(merged.port);
const FILES_PORT = Number(merged.filesPort);
const SERVER_VERSION = String(merged.serverVersion);
const MUSIC_FOLDER = path.resolve(String(merged.musicFolder));

let excluded = merged.excludedEntries;
if (!Array.isArray(excluded)) excluded = DEFAULTS.excludedEntries;
const EXCLUDED_ENTRIES = new Set(excluded);

module.exports = { PORT, FILES_PORT, SERVER_VERSION, MUSIC_FOLDER, EXCLUDED_ENTRIES };


