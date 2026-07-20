import puppeteer from 'puppeteer-core';

async function capture() {
  console.log('Launching browser in mobile emulation mode...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  await page.setViewport({
    width: 375,
    height: 800,
    isMobile: true,
    hasTouch: true
  });

  console.log('Navigating to playlist details page...');
  await page.goto('http://localhost:5173/?view=playlist', { waitUntil: 'load' });

  console.log('Waiting for elements to render...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const screenshotPath = '/Users/brandonrobinson/.gemini/antigravity-ide/brain/cc2e5134-0c73-41f7-8d66-305692889df3/mobile_hero_playlist.png';
  console.log(`Saving screenshot to ${screenshotPath}...`);
  await page.screenshot({ path: screenshotPath });

  await browser.close();
  console.log('Capture completed successfully!');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
