import puppeteer from 'puppeteer-core';

async function inspectPositions() {
  console.log('Launching browser...');
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

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('Inspecting layout...');
  const data = await page.evaluate(() => {
    const mainSlide = document.querySelector('.player-slide.slide-main');
    const playerCenter = document.querySelector('.player-center');
    if (!playerCenter) return { error: 'No player-center found' };

    const firstRow = playerCenter.querySelector('div:first-child');
    const scrubberWrapper = playerCenter.querySelector('.scrubber-wrapper');

    const getElementDetails = (el, name) => {
      if (!el) return { name, exists: false };
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        name,
        exists: true,
        tagName: el.tagName,
        className: el.className,
        rect: {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        },
        styles: {
          display: style.display,
          flexDirection: style.flexDirection,
          justifyContent: style.justifyContent,
          alignItems: style.alignItems,
          gap: style.gap,
          padding: style.padding,
          margin: style.margin,
          flex: style.flex,
          flexGrow: style.flexGrow,
          flexShrink: style.flexShrink,
          flexBasis: style.flexBasis
        }
      };
    };

    const firstRowButtons = firstRow ? Array.from(firstRow.children).map((btn, i) => {
      const rect = btn.getBoundingClientRect();
      const style = window.getComputedStyle(btn);
      return {
        index: i,
        outerHTML: btn.outerHTML,
        rect: {
          left: rect.left,
          right: rect.right,
          width: rect.width
        },
        styles: {
          padding: style.padding,
          margin: style.margin,
          width: style.width,
          boxSizing: style.boxSizing
        }
      };
    }) : [];

    const scrubberKids = scrubberWrapper ? Array.from(scrubberWrapper.children).map((kid, i) => {
      const rect = kid.getBoundingClientRect();
      const style = window.getComputedStyle(kid);
      return {
        index: i,
        className: kid.className,
        outerHTML: kid.outerHTML,
        rect: {
          left: rect.left,
          right: rect.right,
          width: rect.width
        },
        styles: {
          display: style.display,
          visibility: style.visibility,
          width: style.width,
          margin: style.margin,
          padding: style.padding
        }
      };
    }) : [];

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      mainSlide: getElementDetails(mainSlide, 'mainSlide'),
      playerCenter: getElementDetails(playerCenter, 'playerCenter'),
      firstRow: getElementDetails(firstRow, 'firstRow'),
      firstRowButtons,
      scrubberWrapper: getElementDetails(scrubberWrapper, 'scrubberWrapper'),
      scrubberKids
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

inspectPositions().catch(err => {
  console.error(err);
  process.exit(1);
});
