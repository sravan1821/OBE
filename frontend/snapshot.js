import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log("Navigating...");
  await page.goto('https://www.mictech.edu.in/', { waitUntil: 'networkidle2' });
  
  const path = 'C:\\Users\\srava\\.gemini\\antigravity\\brain\\2d506c01-2e8f-4f6b-944f-bcbcde9b9036\\mictech_home.png';
  console.log("Saving screenshot to", path);
  await page.screenshot({ path: path, fullPage: false });
  
  await browser.close();
  console.log("Done");
})();
