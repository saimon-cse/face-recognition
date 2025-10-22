const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const TARGET_DIR = path.join(__dirname, '..', 'public', 'models');

const FILES = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(dest);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        fileStream.close();
        fs.unlink(dest, () => reject(new Error(`Failed to download ${url}. Status ${response.statusCode}`)));
        return;
      }

      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(resolve);
      });
    }).on('error', err => {
      fileStream.close();
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function downloadModels() {
  ensureDirSync(TARGET_DIR);
  for (const fileName of FILES) {
    const targetPath = path.join(TARGET_DIR, fileName);
    if (fs.existsSync(targetPath)) {
      console.log(`Already have ${fileName}, skipping.`);
      continue;
    }

    const url = `${BASE_URL}/${fileName}`;
    console.log(`Downloading ${fileName}...`);
    try {
      await downloadFile(url, targetPath);
      console.log(`Saved ${fileName}`);
    } catch (error) {
      console.error(`Failed to download ${fileName}:`, error.message);
      throw error;
    }
  }
  console.log('All model files downloaded.');
}

downloadModels().catch(error => {
  console.error('Unable to download all model files.', error);
  process.exitCode = 1;
});
