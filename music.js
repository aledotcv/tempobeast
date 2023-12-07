const express = require('express');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const rp = require('request-promise')
const now = new Date();

const app = express();

// Make sure this is set to the path to the music folder
const musicFolder = path.join('/root/cdn/files/music');



app.use(bodyParser.json());
app.use(express.text());
app.use(bodyParser.text());
app.set('x-powered-by', false);


const serverVersion = "1.0.0"

  // This route is optional
app.get('/', (req, res) => {
    res.json({ status: 'Server is up and running.' });
});

  

app.get('/music/getAll', async (req, res) => {
    const folders = await fs.promises.readdir(musicFolder);
    const musicData = [];
 
    for (const folder of folders) {
        if (folder !== 'color.json' && folder !== 'previews' && folder !== 'previews.json') {
            const infoFilePath = path.join(musicFolder, folder, 'info.json');
            const info = await fs.promises.readFile(infoFilePath, 'utf-8');
            const jsonData = JSON.parse(info);
 
            musicData.push({
                id: folder,
                artist: jsonData.music_data[0].artist,
                track: jsonData.music_data[0].track,
            });
        }
    }
    res.send({ music_data: musicData });
});

// If the header, and its value (true) aren't present,
// the client will refuse to proceed.
 app.get('/music/health', async (req, res) => {
  res.setHeader('TbClient', 'true');
  res.status(200).send('OK');
 });


app.get('/music/play', async (req, res) => {
	var id = req.query.id;
	const folders = await fs.promises.readdir(musicFolder);
	const folderCount = folders.filter(folder => 
        folder !== 'color.json' && folder !== 'previews' && folder !== 'previews.json').length;

	if (id === 'random') {
		id = String(Math.floor(Math.random() * folderCount) + 1);
	}
 
	const colorFilePath = path.join(musicFolder, 'color.json');
	const colorJson = await fs.promises.readFile(colorFilePath, 'utf-8');
	const colors = JSON.parse(colorJson);
 
	if (!colors[id]) {
		return res.status(400).send({ content: 'Invalid request' });
	}

	const mapFilePath = path.join(musicFolder, id, 'map.json');
	const infoFilePath = path.join(musicFolder, id, 'info.json');
	const fxFilePath = path.join(musicFolder, id, 'fx.json');

    const infoJson = await fs.promises.readFile(infoFilePath, 'utf-8');
	const mapJson = await fs.promises.readFile(mapFilePath, 'utf-8');

	const info = JSON.parse(infoJson);

	const trackURL = info.music_data[0].trackUrl;
 
	const colorHex = colors[id];
	if (fs.existsSync(fxFilePath)) {
        const fxJson = await fs.promises.readFile(fxFilePath, 'utf-8');
        const fxData = JSON.parse(fxJson);
		res.setHeader('fxData', JSON.stringify(fxData));
	    } else {
        res.setHeader('fxData', 'nodata');
    }
	res.setHeader('colorHex', colorHex);
	res.setHeader('trackURL', trackURL);
 
	res.status(200).send(mapJson);
 });

 app.get('/music/preview', async (req, res) => {
	const info = await fs.promises.readFile('/root/cdn/files/music/previews.json', 'utf-8');
    const jsonData = JSON.parse(info);

    const randomIndex = Math.floor(Math.random() * jsonData.length);

    const selectedTrack = jsonData[randomIndex];

    res.setHeader('previewId', selectedTrack.previewId);
    res.setHeader('trackName', selectedTrack.trackName);

    res.status(200).json({ trackUrl: selectedTrack.trackUrl });
});

app.listen(3000, () => {
	console.log('Server is listening on port 3000');
  });

// If your node supports https, use this instead
// const httpsServer = https.createServer(credentials, app);

// Point these to the location of each of the corresponding files within your server
// const credentials = {
//    key: privateKey,
//    cert: certificate,
//    ca: ca
//};
//httpsServer.listen(1000, () => {
//    console.log('Node server running on port 1000');
//});

app.use((req, res, next) => {
    res.status(404).json({
      message: 'Route does not exist.',
    });  
});

app.use((err, req, res, next) => {
	console.error(`[${req.timestamp}] An error occurred: ${err.message}`);
  
	return res.status(500).json({ message: err.message });
});

// Example of what you may use to serve files using express
// This implementation may require more work for a public node

// const cdn = express();
//cdn.use('/files', express.static('yourpathtoyourfilesfolder'));
//cdn.listen(3001, () => {
//  console.log('Server is listening on port 3001');
//});