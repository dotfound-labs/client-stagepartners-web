import {test,expect} from '@playwright/test';
for(const accepted of [true,false])test(`contact browser delivery ${accepted?'accepted':'uncertain'} is explicit and single-attempt`,async({page})=>{
 let receipts=0,notifications=0;
 await page.route('**/api/contact',route=>route.request().method()==='GET'?route.fulfill({json:{enabled:true}}):(receipts++,route.fulfill({json:{success:false,saved:true,mode:'browser',attemptAllowed:true,accessKey:'00000000-0000-4000-8000-000000000001'}})));
 await page.route('https://api.web3forms.com/submit',async route=>{notifications++;await route.fulfill({status:accepted?200:429,json:{success:accepted}});});
 await page.goto('http://127.0.0.1:3101/contact');
 await page.locator('input[name="name"]').fill('Synthetic fixture');await page.locator('input[name="email"]').fill('fixture@example.test');await page.locator('textarea[name="message"]').fill('Synthetic browser test, never delivered');
 const button=page.getByRole('button',{name:'この内容で送信する'});await expect(button).toBeEnabled();await page.locator("form").evaluate(form=>{(form as HTMLFormElement).requestSubmit();(form as HTMLFormElement).requestSubmit();});
 if(accepted)await expect(page.getByRole('status').filter({hasText:'送信サービス'})).toBeVisible();
 else {await expect(page.locator('form').getByRole('alert')).toContainText('内容は受付済み');await expect(button).toBeDisabled();}
 expect(receipts).toBe(1);expect(notifications).toBe(1);
});
