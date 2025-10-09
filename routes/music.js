const express = require('express');
const path = require('path');
const { MUSIC_FOLDER, SERVER_VERSION } = require('../config/params');
const { applyOverride } = require('../config/overrideState');
const { listMusicFolderIds, resolveRandomId, loadTrackSet, readJsonSafe } = require('../utils/fsHelpers');
const { loadIndex } = require('../utils/indexer');

const router = express.Router();


router.get('/health', (req, res) => {
  res.setHeader('TbClient', 'true');
  res.setHeader('Tbnode', SERVER_VERSION);
  res.status(200).send(SERVER_VERSION);
});

router.get('/getAll', async (req, res, next) => {
  try {
    const index = await loadIndex();
    
    res.json({ music_data: index.music_data });
  } catch (err) {
    next(err);
  }
});

router.get('/preview', async (req, res, next) => {
  try {
    const previewsPath = path.join(MUSIC_FOLDER, 'previews.json');
    const previews = await readJsonSafe(previewsPath);
    if (!Array.isArray(previews) || previews.length === 0) {
      return res.status(404).json({ message: 'No previews available' });
    }
  const selected = previews[Math.floor(Math.random() * previews.length)];
  const overriddenPreviewUrl = applyOverride(selected.trackUrl);
    res.setHeader('previewId', selected.previewId);
    res.setHeader('trackName', selected.trackName);
  res.status(200).json({ trackUrl: overriddenPreviewUrl });
  } catch (err) {
    next(err);
  }
});

router.get('/play', async (req, res, next) => {
  try {
    let { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Missing id parameter' });
    id = await resolveRandomId(id);
    const { infoJson, mapRaw, fxData } = await loadTrackSet(id);

    const entry = infoJson.music_data?.[0] || {};
    res.setHeader('colorHex', entry.color || '#FFFFFF');
  res.setHeader('trackURL', applyOverride(entry.trackUrl || ''));
    res.setHeader('gamemode', entry.gamemode || 'Flow');
    res.setHeader('fxData', fxData ? JSON.stringify(fxData) : 'nodata');
    res.status(200).send(mapRaw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ message: 'Track not found' });
    }
    next(err);
  }
});

router.get('/info', async (req, res, next) => {
  try {
    let { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Missing id parameter' });
    id = await resolveRandomId(id);
    const { infoJson } = await loadTrackSet(id);
    const entry = infoJson.music_data?.[0] || {};
    if (entry.trackUrl) {
      
      entry.trackUrl = applyOverride(entry.trackUrl);
    }
    res.setHeader('gamemode', entry.gamemode || 'Flow');
    res.status(200).json(infoJson);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ message: 'Track not found' });
    }
    next(err);
  }
});

module.exports = router;


