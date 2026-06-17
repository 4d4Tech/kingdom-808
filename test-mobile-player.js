import puppeteer from 'puppeteer-core';

async function testMobilePlayer() {
  console.log('Launching browser in mobile emulation mode...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  await page.setViewport({
    width: 375,
    height: 667,
    isMobile: true,
    hasTouch: true
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to app home page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });

  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('Checking global player elements visibility on mobile...');
  const containerExists = await page.evaluate(() => {
    const container = document.querySelector('.player-swipe-container');
    const firstSlide = document.querySelector('.player-slide.slide-main');
    const secondSlide = document.querySelector('.player-slide.slide-extra');
    
    if (!container) return { success: false, reason: 'swipe container not found' };
    if (!firstSlide || !secondSlide) return { success: false, reason: 'slides not found' };
    
    const dots = document.querySelector('.player-dots');
    if (!dots) return { success: false, reason: 'swipe dots not found' };
    
    const style = window.getComputedStyle(container);
    if (style.overflowX !== 'auto' && style.overflowX !== 'scroll') {
      return { success: false, reason: 'container is not horizontally scrollable' };
    }
    
    return { success: true };
  });

  if (!containerExists.success) {
    throw new Error('Verification failed: ' + containerExists.reason);
  }
  console.log('✔ Verified: Horizontal swipe containers, slides, and dot indicators exist and are correctly configured for mobile!');

  console.log('Simulating swipe to slide 2...');
  await page.evaluate(() => {
    const container = document.querySelector('.player-swipe-container');
    container.scrollLeft = container.clientWidth;
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  const dotState = await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('.player-dots .dot'));
    if (dots.length < 2) return { success: false, reason: 'dots not found' };
    const secondDotActive = dots[1].classList.contains('active');
    return { success: secondDotActive, reason: secondDotActive ? '' : 'second dot is not active after scroll' };
  });

  if (!dotState.success) {
    throw new Error('Verification failed: ' + dotState.reason);
  }
  console.log('✔ Verified: Swipe indicator dot successfully transitioned active state on scroll!');

  await browser.close();
  console.log('Mobile responsiveness verification completed successfully!');
}

testMobilePlayer().catch(err => {
  console.error('Mobile verification failed:', err);
  process.exit(1);
});
