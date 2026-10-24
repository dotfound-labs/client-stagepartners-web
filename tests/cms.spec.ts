import { test, expect } from "@playwright/test";
import { can, workSchema, newsSchema } from "../lib/cms/model";
const base = "http://127.0.0.1:3101";
test("module permissions and strict input schemas", () => {
  const editor = { id: "fixture", email: "editor@example.test", owner: false, permissions: [{ module: "news" as const, capability: "edit" as const }] };
  expect(can(editor, "news", "edit")).toBe(true);
  expect(can(editor, "news", "publish")).toBe(false);
  expect(can(editor, "works", "edit")).toBe(false);
  expect(newsSchema.safeParse({ title: "News", date: "2026-01-01", category: "info", excerpt: "", body: ["Content"], arbitrary: "private image" }).success).toBe(false);
  expect(workSchema.safeParse({ title: "Work", category: "store", type: "Renovation", summary: "", cover: {legacy_path:"/works/test/a.jpg",alt:"Photo"}, shots: [{legacy_path:"/works/test/a.jpg",alt:"Photo",state:"after"}] }).success).toBe(true);
});
test("unconfigured login is honest and protected routes fail closed", async ({ page, request }) => {
  await page.goto(`${base}/admin`);
  await expect(page.getByRole("heading", { name: "管理画面にログイン" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ログイン" })).toBeDisabled();
  await expect(page.getByText("接続設定の準備中です。", { exact: false })).toBeVisible();
  expect((await request.get(`${base}/api/admin/documents?module=news`)).status()).toBe(503);
  expect((await request.post(`${base}/api/admin/document`, { data: {} })).status()).toBe(403);
  expect((await request.post(`${base}/api/admin/auth/login`, { headers: { Origin: base }, data: { email: "fixture@example.test", password: "not-a-real-password" } })).status()).toBe(503);
  expect((await request.get(`${base}/api/media/00000000-0000-4000-8000-000000000000`)).status()).toBe(404);
  const preview = await request.get(`${base}/admin/preview/00000000-0000-4000-8000-000000000000`);
  expect(preview.status()).toBe(404);
  await page.screenshot({ path: "test-results/admin-login.png", fullPage: true });
  await page.setViewportSize({width:390,height:844});
  await expect(page.getByRole("heading", {name:"管理画面にログイン"})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:"test-results/admin-login-mobile.png",fullPage:true});
});
test("public SEO, existing content and disabled contact delivery", async ({ page, request }) => {
  const robots = await request.get(`${base}/robots.txt`); expect(robots.status()).toBe(200); expect(await robots.text()).toContain("Disallow: /admin");
  const sitemap = await request.get(`${base}/sitemap.xml`); expect(sitemap.status()).toBe(200); expect((await sitemap.text()).match(/<url>/g)).toHaveLength(48);
  for (const path of ["/", "/company", "/contact", "/privacy", "/business/real-estate", "/business/architecture"]) {
    await page.goto(base + path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.stagepartners.co.jp${path === "/" ? "" : path}`);
    await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(0);
  }
  await page.goto(base);
  await expect(page.getByText("REAL ESTATE &amp; ARCHITECTURE",{exact:true})).toHaveCount(0);
  await page.goto(`${base}/contact`);
  await expect(page.getByRole("button", {name:"この内容で送信する"})).toBeDisabled();
  await page.goto(`${base}/works`);
  await expect(page.locator('a[href^="/works/"]')).toHaveCount(30);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-hero-title]')!).opacity === "1");
  await page.locator('[data-card]').first().scrollIntoViewIfNeeded();
  await expect(page.locator('[data-card]').first()).toHaveCSS("opacity", "1");
  await page.screenshot({path:"test-results/works.png"});
});
