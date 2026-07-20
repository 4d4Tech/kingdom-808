import puppeteer from 'puppeteer-core';

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Capture Mobile
  await page.setViewport({
    width: 375,
    height: 812,
    isMobile: true,
    hasTouch: true
  });
  console.log('Navigating to mobile view...');
  await page.goto('http://localhost:5173/?view=playlist', { waitUntil: 'load' });
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('Saving mobile screenshot...');
  await page.screenshot({
    path: '/Users/brandonrobinson/.gemini/antigravity-ide/brain/cc2e5134-0c73-41f7-8d66-305692889df3/mobile_hero_glass_player_split_mobile.png'
  });

  // Capture Desktop
  await page.setViewport({
    width: 1280,
    height: 800,
    isMobile: false,
    hasTouch: false
  });
  console.log('Navigating to desktop view...');
  await page.goto('http://localhost:5173/?view=playlist', { waitUntil: 'load' });
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('Saving desktop screenshot...');
  await page.screenshot({
    path: '/Users/brandonrobinson/.gemini/antigravity-ide/brain/cc2e5134-0c73-41f7-8d66-305692889df3/mobile_hero_glass_player_split_desktop.png'
  });

  await browser.close();
  console.log('Done!');
}

capture().catch(console.error);
