import {test,expect} from "@playwright/test";
test.skip(process.env.CMS_DESIGN_QA!=="true","Explicit local-only synthetic design QA");
for(const viewport of [{width:1280,height:500},{width:768,height:600},{width:390,height:650},{width:320,height:480}]){
 test(`admin navigation and editor ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto('http://127.0.0.1:3102/admin-design-preview');
  const settings=page.getByRole('button',{name:'07 設定',exact:true});await settings.scrollIntoViewIfNeeded();await expect(settings).toBeInViewport();await settings.focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'設定',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'02 お知らせ',exact:true}).click();await page.getByRole('button',{name:'開く →',exact:true}).click();
  await expect(page.getByRole('heading',{name:'内容を編集'})).toBeVisible();
  const fonts=await page.evaluate(()=>['.admin-app h1','.admin-sidebar nav button','.admin-app input'].map(s=>getComputedStyle(document.querySelector(s)!).fontFamily));
  expect(new Set(fonts).size).toBe(1);expect(fonts[0]).not.toMatch(/Mincho|(?:^|,\s*)serif(?:,|$)/i);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'← 一覧に戻る',exact:true}).click();await expect(page.getByRole('heading',{name:'お知らせ',exact:true})).toBeVisible();
 });
}
