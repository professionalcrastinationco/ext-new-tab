const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const extensionPath = path.resolve(__dirname);
  console.log('Loading extension from:', extensionPath);

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  await new Promise(r => setTimeout(r, 3000));

  const page = context.pages()[0];

  // Extension ID from previous run
  const extensionId = 'gjcmljnkpiklclkibgfepefmeaglgghi';
  const newtabUrl = `chrome-extension://${extensionId}/newtab.html`;
  console.log('Navigating to:', newtabUrl);

  // Set up console logging before navigation
  page.on('console', msg => console.log('Console:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('Page error:', err.message));

  await page.goto(newtabUrl);
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'extension-screenshot.png', fullPage: true });
  console.log('Extension newtab screenshot saved');

  const title = await page.title();
  console.log('Page title:', title);
  console.log('Page URL:', page.url());

  // Try to click settings
  try {
    const settingsBtn = await page.$('#settingsBtn');
    if (settingsBtn) {
      console.log('Found settings button, clicking...');
      await settingsBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'extension-settings.png', fullPage: true });
      console.log('Settings screenshot saved');

      // Try clicking Manage Categories
      const manageBtn = await page.$('#manageCategoriesBtn');
      if (manageBtn) {
        console.log('Found Manage Categories button, clicking...');
        await manageBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'extension-manage.png', fullPage: true });
        console.log('Manage categories screenshot saved');
      }
    } else {
      console.log('Settings button not found');
    }
  } catch (e) {
    console.log('Error:', e.message);
  }

  console.log('\nBrowser open for inspection. Press Ctrl+C to close.');
  await new Promise(() => {});
})();
