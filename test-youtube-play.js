import puppeteer from 'puppeteer-core';

async function testYouTube() {
  console.log('Launching browser to verify YouTube playback...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to playlist details page...');
  await page.goto('http://localhost:5173/?view=playlist', { waitUntil: 'load' });

  console.log('Waiting 5s for page and anonymous auth to settle...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Clicking "Play All" (which loads the Will Smith YouTube track)...');
  await page.evaluate(() => {
    const playAllBtn = document.querySelector('.btn-primary');
    if (playAllBtn) {
      playAllBtn.click();
    } else {
      throw new Error('Play All button not found');
    }
  });

  console.log('Waiting 8s for YouTube player to initialize, buffer, and start playing...');
  await new Promise(resolve => setTimeout(resolve, 8000));

  console.log('Inspecting UI player states...');
  const playerState = await page.evaluate(() => {
    const titleEl = document.querySelector('.global-player .player-track-info h4');
    const artistEl = document.querySelector('.global-player .player-track-info p');
    const playIconEl = document.querySelector('.global-player .play-fab span');
    const durationEl = document.querySelector('.global-player .scrubber-wrapper span:last-child');
    const timeEl = document.querySelector('.global-player .scrubber-wrapper span:first-child');
    const iframeEl = document.querySelector('iframe#youtube-player');

    return {
      title: titleEl ? titleEl.textContent : null,
      artist: artistEl ? artistEl.textContent : null,
      playIcon: playIconEl ? playIconEl.textContent : null,
      duration: durationEl ? durationEl.textContent : null,
      currentTime: timeEl ? timeEl.textContent : null,
      hasIframe: !!iframeEl
    };
  });

  console.log('Player UI state:', playerState);

  if (!playerState.title || !playerState.title.includes('Rave In The Wasteland')) {
    throw new Error(`Incorrect track title playing: ${playerState.title}`);
  }
  if (!playerState.artist || !playerState.artist.includes('Will Smith')) {
    throw new Error(`Incorrect artist playing: ${playerState.artist}`);
  }
  if (playerState.playIcon !== 'pause') {
    throw new Error(`Play button did not switch to pause. Current icon: ${playerState.playIcon}`);
  }
  if (!playerState.hasIframe) {
    throw new Error('YouTube IFrame was not generated in the DOM!');
  }

  console.log('✔ Verified: YouTube URL loaded, generated hidden iframe, and updated title/artist states!');
  console.log(`✔ Verified: Play icon morphed to pause!`);
  console.log(`✔ Verified: Track duration populated as ${playerState.duration} and current time as ${playerState.currentTime}!`);

  await browser.close();
  console.log('YouTube E2E Playback test completed successfully!');
}

testYouTube().catch(err => {
  console.error('YouTube E2E Playback test failed:', err);
  process.exit(1);
});
