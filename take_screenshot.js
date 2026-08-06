import puppeteer from 'puppeteer-core';

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Go to localhost:5173/?view=discover
  console.log('Navigating to discover/listen now...');
  await page.goto('http://localhost:5173/?view=discover', { waitUntil: 'load' });

  // Wait 6 seconds for page load, Firestore fetch, and layout to settle
  console.log('Waiting for page to settle...');
  await new Promise(resolve => setTimeout(resolve, 6000));

  // Take screenshot
  const screenshotPath = '/Users/brandonrobinson/.gemini/antigravity-ide/brain/851cba56-5708-4fb0-b550-b6882a8ad0f9/discover_fixed.png';
  console.log('Taking screenshot...');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
