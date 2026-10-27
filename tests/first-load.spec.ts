import { test, expect } from '@playwright/test';

// Headless Chromium normally hides scrollbars, concealing the Windows width jump.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

for (const viewport of [{ width: 1365, height: 768 }, { width: 390, height: 844 }]) {
  test(`first load and reload preserve layout width at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      const samples: { width: number; headerWidth: number; overflow: string; headingHeight: number }[] = [];
      Object.assign(window, { layoutSamples: samples });
      const sample = () => {
        const heading = document.querySelector('h1');
        const header = document.querySelector('header');
        if (heading && header && document.body) {
          samples.push({ width: document.body.getBoundingClientRect().width,
            headerWidth: header.getBoundingClientRect().width,
            overflow: document.body.style.overflow,
            headingHeight: heading.getBoundingClientRect().height });
        }
        if (performance.now() < 20000) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    for (const reload of [false, true]) {
      if (reload) await page.reload();
      else await page.goto('http://127.0.0.1:3101/');
      await expect(page.locator('.page-loader')).toBeHidden();
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const samples = await page.evaluate(() => (window as unknown as {
        layoutSamples: { width: number; headerWidth: number; overflow: string; headingHeight: number }[]
      }).layoutSamples);
      expect(samples.some(sample => sample.overflow === 'hidden')).toBe(true);
      expect(samples.some(sample => sample.overflow === '')).toBe(true);
      for (const key of ['width', 'headerWidth', 'headingHeight'] as const) {
        expect(Math.max(...samples.map(sample => sample[key])) - Math.min(...samples.map(sample => sample[key])), key).toBeLessThan(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page).toHaveTitle('株式会社STAGE PARTNERS｜ステージパートナーズ');
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', '株式会社STAGE PARTNERS｜ステージパートナーズ');
    }
    expect(errors).toEqual([]);
  });
}
