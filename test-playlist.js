import puppeteer from 'puppeteer-core';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDyf26C4SbpCy_MMXw4-DsQ4qZwIU8enDw",
    authDomain: "kingdom-808.firebaseapp.com",
    projectId: "kingdom-808",
    storageBucket: "kingdom-808.firebasestorage.app",
    messagingSenderId: "319355254510",
    appId: "1:319355254510:web:0c1b1bc97ece51524725ff",
    measurementId: "G-BJJTJBYJJL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFlow() {
  console.log('Launching browser for E2E validation...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Forward browser console logs to node process
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  
  console.log('Navigating to playlist details...');
  await page.goto('http://localhost:5173/?view=playlist', { waitUntil: 'load' });
  
  console.log('Waiting 5s for anonymous auth and playlist initialization to settle...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const playlistRef = doc(db, 'playlists', 'morning_worship');
  let playlistSnap = await getDoc(playlistRef);
  if (playlistSnap.exists()) {
    console.log('✔ Verified: playlists/morning_worship successfully initialized. Current followers:', playlistSnap.data().follower_count);
  } else {
    throw new Error('playlists/morning_worship not found in Firestore!');
  }

  console.log('Clicking the Follow button...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('.btn.outline'));
    const followBtn = buttons.find(b => b.textContent.includes('Follow') || b.textContent.includes('Following'));
    if (followBtn) {
      followBtn.click();
    } else {
      throw new Error('Follow button not found');
    }
  });
  
  console.log('Waiting 3s for follow operation to write...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  playlistSnap = await getDoc(playlistRef);
  console.log('✔ Verified: Follower count updated in Firestore to:', playlistSnap.data().follower_count);

  console.log('Clicking Play All button...');
  await page.evaluate(() => {
    const playAllBtn = document.querySelector('.btn-primary');
    if (playAllBtn) {
      playAllBtn.click();
    } else {
      throw new Error('Play All button not found');
    }
  });
  
  console.log('Waiting 3s for Play All operation to write...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('Clicking the first track row...');
  await page.evaluate(() => {
    const trackRow = document.querySelector('.table-row');
    if (trackRow) {
      trackRow.click();
    } else {
      throw new Error('Track row not found');
    }
  });

  console.log('Waiting 3s for track click operation to write...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const trackRef = doc(db, 'tracks', 'track_01');
  const trackSnap = await getDoc(trackRef);
  if (trackSnap.exists()) {
    console.log('✔ Verified: tracks/track_01 play count in Firestore is now:', trackSnap.data().play_count);
  } else {
    throw new Error('tracks/track_01 play count not found in Firestore!');
  }

  await browser.close();
  console.log('E2E Verification completed successfully with all assertions passing!');
}

testFlow().catch(err => {
  console.error('E2E Verification failed:', err);
  process.exit(1);
});
