const fs = require('fs');
const path = require('path');
const { MUSIC_FOLDER, EXCLUDED_ENTRIES } = require('../config/params');

async function readJsonSafe(filePath) {
  try {
    const raw = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    err.message = `failed to read JSON at ${filePath}: ${err.message}`;
    throw err;
  }
}

async function listMusicFolderIds() {
  const entries = await fs.promises.readdir(MUSIC_FOLDER);
  return entries.filter(e => !EXCLUDED_ENTRIES.has(e));
}

async function resolveRandomId(requestedId) {
  const ids = await listMusicFolderIds();
  if (requestedId === 'random') {
    if (ids.length === 0) throw new Error('No tracks available');
    return ids[Math.floor(Math.random() * ids.length)];
  }
  return requestedId;
}

async function loadTrackSet(id) {
  const base = path.join(MUSIC_FOLDER, id);
  const infoPath = path.join(base, 'info.json');
  const mapPath = path.join(base, 'map.json');
  const fxPath = path.join(base, 'fx.json');

  const infoJson = await readJsonSafe(infoPath);
  const mapRaw = await fs.promises.readFile(mapPath, 'utf-8');
  let fxData = null;
  if (fs.existsSync(fxPath)) {
    try {
      fxData = await readJsonSafe(fxPath);
    } catch (_) {
      fxData = null; 
    }
  }

  return { infoJson, mapRaw, fxData };
}

module.exports = { readJsonSafe, listMusicFolderIds, resolveRandomId, loadTrackSet };


