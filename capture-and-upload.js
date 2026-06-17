import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration copied from src/firebase.js
const firebaseConfig = {
    apiKey: "AIzaSyDyf26C4SbpCy_MMXw4-DsQ4qZwIU8enDw",
    authDomain: "kingdom-808.firebaseapp.com",
    projectId: "kingdom-808",
    storageBucket: "kingdom-808.firebasestorage.app",
    messagingSenderId: "319355254510",
    appId: "1:319355254510:web:0c1b1bc97ece51524725ff",
    measurementId: "G-BJJTJBYJJL"
};

// Initialize Firebase App and Storage for Node environment (without Analytics)
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const views = ['artist', 'playlist', 'discover', 'wrapped', 'player'];
const port = 5173;

async function captureScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Set standard high-DPI desktop viewport
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const files = [];

  for (const view of views) {
    const url = `http://localhost:${port}/?view=${view}`;
    console.log(`Navigating to ${url}...`);
    // Wait for the initial HTML load
    await page.goto(url, { waitUntil: 'load' });
    
    // Wait an additional 5 seconds for React components, three.js canvas, and animations to fully render
    console.log(`Waiting 5s for ${view} view animations & 3D canvas to settle...`);
    await new Promise(resolve => setTimeout(resolve, 5000));

    const filename = `${view}.png`;
    const filepath = path.join(screenshotsDir, filename);
    
    console.log(`Taking screenshot for ${view} view...`);
    await page.screenshot({ path: filepath, type: 'png' });
    console.log(`Saved screenshot to ${filepath}`);
    
    files.push({ name: filename, path: filepath });
  }

  await browser.close();
  return files;
}

async function uploadToFirebase(files) {
  console.log('Starting upload to Firebase Storage (review/)...');
  for (const file of files) {
    const fileBuffer = fs.readFileSync(file.path);
    // Destination path: review/{filename}
    const storageRef = ref(storage, `review/${file.name}`);
    
    console.log(`Uploading ${file.name} to review/${file.name}...`);
    const metadata = {
      contentType: 'image/png',
    };
    
    try {
      const snapshot = await uploadBytes(storageRef, fileBuffer, metadata);
      console.log(`Successfully uploaded ${file.name}!`);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log(`Download URL: ${downloadURL}`);
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
    }
  }
}

async function main() {
  try {
    const files = await captureScreenshots();
    await uploadToFirebase(files);
    console.log('All views successfully captured and uploaded to Firebase Storage!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during execution:', error);
    process.exit(1);
  }
}

main();
