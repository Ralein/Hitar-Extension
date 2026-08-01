import { test as base, chromium, expect, type BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const extensionPath = path.resolve('.output/chrome-mv3');

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use: (r: BrowserContext) => Promise<void>) => {
    const pathToExtension = extensionPath;
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }: { context: BrowserContext }, use: (r: string) => Promise<void>) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

test.describe('Hitar Extension E2E Test Suite', () => {
  test('loads unpacked extension and options page successfully', async ({ page, extensionId }: { page: any; extensionId: string }) => {
    const optionsUrl = `chrome-extension://${extensionId}/options.html`;
    await page.goto(optionsUrl);

    await expect(page.locator('h1')).toHaveText('Hitar Settings');
    await expect(page.locator('#add-endpoint-btn')).toBeVisible();
    await expect(page.locator('#clear-cache-btn')).toBeVisible();
  });

  test('injects content script into test fixture page', async ({ page }: { page: any }) => {
    const fixturePath = path.resolve('tests/e2e/fixture.html');
    fs.writeFileSync(
      fixturePath,
      `<!DOCTYPE html>
       <html>
         <head><title>Test Page</title></head>
         <body>
           <h1 id="heading">Welcome to the Hitar Test Page</h1>
           <p id="paragraph">This is a sample paragraph for testing live in-place translation.</p>
         </body>
       </html>`,
    );

    await page.goto(`file://${fixturePath}`);
    const heading = page.locator('#heading');
    await expect(heading).toHaveText('Welcome to the Hitar Test Page');

    if (fs.existsSync(fixturePath)) {
      fs.unlinkSync(fixturePath);
    }
  });
});
