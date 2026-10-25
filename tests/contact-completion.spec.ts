import {test,expect} from '@playwright/test';

for(const outcome of ['accepted','provider-failure','db-only'] as const){
  for(const mobile of [false,true])test(`contact completion ${outcome} ${mobile?'mobile':'desktop'}`,async({page})=>{
    await page.setViewportSize(mobile?{width:375,height:667}:{width:1280,height:720});
    let receipts=0,notifications=0;
    let release!:()=>void;
    const pending=new Promise<void>(resolve=>release=resolve);
    await page.route('**/api/contact',async route=>{
      if(route.request().method()==='GET')return route.fulfill({json:{enabled:true}});
      receipts++;await pending;
      return route.fulfill({json:outcome==='db-only'?{success:false,saved:true}:{success:false,saved:true,mode:'browser',attemptAllowed:true,accessKey:'00000000-0000-4000-8000-000000000001'}});
    });
    await page.route('https://api.web3forms.com/submit',route=>{notifications++;return route.fulfill({status:outcome==='accepted'?200:429,json:{success:outcome==='accepted'}});});
    await page.goto('/contact');
    await page.locator('input[name="name"]').fill('Synthetic fixture');
    await page.locator('input[name="email"]').fill('fixture@example.test');
    await page.locator('textarea[name="message"]').fill('Mocked only; never delivered');
    const submit=page.getByRole('button',{name:'この内容で送信する'});
    await expect(submit).toBeEnabled();
    await page.locator('form').evaluate(form=>{(form as HTMLFormElement).requestSubmit();(form as HTMLFormElement).requestSubmit();});
    await expect(page.getByRole('button',{name:'送信中...'})).toBeDisabled();
    release();
    const dialog=page.getByRole('dialog',{name:'お問い合わせありがとうございます'});
    if(outcome==='accepted'){
      await expect(dialog).toBeVisible();
      const close=dialog.getByRole('button',{name:'閉じる'});
      await expect(close).toBeFocused();
      await page.keyboard.press('Tab');await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      const box=await dialog.boundingBox();
      expect(box).not.toBeNull();expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x+box!.width).toBeLessThanOrEqual(mobile?375:1280);
      expect(box!.y+box!.height).toBeLessThanOrEqual(mobile?667:720);
      if(mobile)await close.click();else await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      const status=page.getByRole('status').filter({hasText:'お問い合わせありがとうございます'});
      await expect(status).toBeVisible();await expect(status).toBeFocused();
    }else{
      await expect(page.locator('form').getByRole('alert')).toBeVisible();
      await expect(dialog).not.toBeVisible();await expect(submit).toBeDisabled();
    }
    expect(receipts).toBe(1);expect(notifications).toBe(outcome==='db-only'?0:1);
  });
}
