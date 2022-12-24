const fs = require('fs');
const package = require('./package.json');

const tar = require('tar');
const axios = require('axios');

const DOWNLOAD_URL = `https://poppler.freedesktop.org/poppler-${package.version}.tar.xz`;

axios.get(DOWNLOAD_URL, { responseType: 'stream' })
.then(data => {
	let extractor = tar.x({
		strip: 1,
		// TODO: safe path join
		cwd: __dirname + '/poppler'
	});

	data.pipe(extractor)

	extractor.on('finish', () => console.log("Finished"));
});
