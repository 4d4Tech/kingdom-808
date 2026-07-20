import puppeteer from 'puppeteer-core';

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 375,
    height: 812,
    isMobile: true,
    hasTouch: true
  });

  console.log('Navigating to http://localhost:5174/?view=playlist');
  await page.goto('http://localhost:5174/?view=playlist', { waitUntil: 'load' });
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Saving screenshot...');
  await page.screenshot({
    path: '/Users/brandonrobinson/.gemini/antigravity-ide/brain/cc2e5134-0c73-41f7-8d66-305692889df3/mobile_hero_glass_player_centered.png',
    fullPage: false
  });

  await browser.close();
  console.log('Done!');
}

capture().catch(console.error);
