const fs = require('fs');
const cp = require('child_process');
const package = require('./package.json');

const lzma = require('lzma-native');
const tar = require('tar');
const axios = require('axios');

const DOWNLOAD_URL = `https://poppler.freedesktop.org/poppler-${package.version}.tar.xz`;

async function spawn(cmd, args, opts) {
	return new Promise((resolve, reject) => {
		let hand = cp.spawn(cmd, args, opts);
		hand.stdout.on('data', (data) => console.log(data.toString()));
		hand.stderr.on('data', (data) => console.error(data.toString()));
		hand.on('close', (code) => {
			if (code == 0) {
				resolve(code);
			} else {
				reject(code);
			}
		});
	});
}

axios.get(DOWNLOAD_URL, { responseType: 'stream' })
.then(({ data }) => {
	fs.rmSync(__dirname + '/poppler', { force: true, recursive: true });
	fs.mkdirSync(__dirname + '/poppler/build', { recursive: true });

	let extractor = tar.x({
		strip: 1,
		// TODO: safe path join
		cwd: __dirname + '/poppler'
	});

	data.pipe(lzma.createDecompressor()).pipe(extractor);

	extractor.on('finish', async () => {
		let opts = {
			cwd: __dirname + '/poppler/build'
		};

		await spawn('cmake', ['-DCMAKE_BUILD_TYPE=release', '-G Ninja', '..'], opts);
		await spawn('ninja', [], opts);
		console.log("Finished");
	});
});
