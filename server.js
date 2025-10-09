const express = require('express');
const { PORT, FILES_PORT, MUSIC_FOLDER, SERVER_VERSION } = require('./config/params');
const musicRouter = require('./routes/music');
const timestamp = require('./middleware/timestamp');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { buildIndex } = require('./utils/indexer');
const { checkForUpdates } = require('./utils/updateCheck');

function buildApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(express.text());
  app.use(timestamp);
  app.get('/', (req, res) => {
    res.json({ status: 'ok', version: SERVER_VERSION });
  });
  app.use('/music', musicRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

function startServers() {
  const app = buildApp();
  const apiServer = app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
    
    buildIndex()
      .then(() => console.log('Track index built/updated.'))
      .catch(e => console.warn('Index build failed:', e.message));
    
    checkForUpdates();
  });
  const files = express();
  files.use('/files', express.static(MUSIC_FOLDER));
  const filesServer = files.listen(FILES_PORT, () => {
    console.log(`File server serving ${MUSIC_FOLDER} on port ${FILES_PORT}`);
  });
  return { apiServer, filesServer };
}


if (require.main === module) {
  startServers();
}

module.exports = { startServers, buildApp };

