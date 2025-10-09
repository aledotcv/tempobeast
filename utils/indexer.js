const fs = require('fs');
const path = require('path');
const { MUSIC_FOLDER, EXCLUDED_ENTRIES } = require('../config/params');
const { readJsonSafe } = require('./fsHelpers');

const INDEX_FILENAME = 'index.json';
let inMemoryIndex = null;
let building = false;

function getIndexPath() {
  return path.join(MUSIC_FOLDER, INDEX_FILENAME);
}

async function buildIndex() {
  if (building) return inMemoryIndex; 
  building = true;
  try {
    const entries = await fs.promises.readdir(MUSIC_FOLDER);
    const index = [];
    for (const entry of entries) {
      if (EXCLUDED_ENTRIES.has(entry)) continue;
      const infoPath = path.join(MUSIC_FOLDER, entry, 'info.json');
      if (!fs.existsSync(infoPath)) continue;
      try {
        const infoData = await readJsonSafe(infoPath);
        const md = infoData.music_data?.[0] || {};
        index.push({
          id: entry,
            artist: md.artist || null,
            track: md.track || null,
            gamemode: md.gamemode || 'Flow'
        });
      } catch (_) {
        
      }
    }
    inMemoryIndex = { music_data: index, builtAt: new Date().toISOString() };
    await fs.promises.writeFile(getIndexPath(), JSON.stringify(inMemoryIndex, null, 2));
    return inMemoryIndex;
  } finally {
    building = false;
  }
}

async function loadIndex() {
  if (inMemoryIndex) return inMemoryIndex;
  try {
    const raw = await fs.promises.readFile(getIndexPath(), 'utf-8');
    inMemoryIndex = JSON.parse(raw);
    return inMemoryIndex;
  } catch (_) {
    return buildIndex();
  }
}

function invalidateIndex() {
  inMemoryIndex = null;
}

module.exports = { buildIndex, loadIndex, invalidateIndex, getIndexPath };


