import {test,expect} from "@playwright/test";
import {safeInstagramImage,integrationEnabled} from "../lib/cms/integration-config";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import vm from "node:vm";
import ts from "typescript";
const base="http://127.0.0.1:3101";
test("disabled integration endpoints do not accept real intake or jobs",async({request})=>{
 expect((await request.get(`${base}/api/contact`)).status()).toBe(200);
 expect(await (await request.get(`${base}/api/contact`)).json()).toEqual({enabled:false});
 expect((await request.post(`${base}/api/contact`,{data:{}})).status()).toBe(503);
 expect((await request.get(`${base}/api/jobs/instagram`)).status()).toBe(503);
 expect((await request.get(`${base}/api/instagram-image/instagram-123`)).status()).toBe(404);
});
test("callback clears tokens and ignores external redirect, without submitting until confirmed",async({page})=>{
 let calls=0;
 await page.route('**/api/auth/callback',route=>{calls++;return route.fulfill({status:401,json:{error:"Fixture denial"}});});
 await page.goto(`${base}/auth/callback?next=https://attacker.example/#access_token=fixture-access-token-123&refresh_token=fixture-refresh-token-123&type=invite`);
 await expect(page.getByRole('button',{name:'確認してパスワード設定へ'})).toBeEnabled();
 expect(page.url()).toBe(`${base}/auth/callback`);expect(calls).toBe(0);
 await page.getByRole('button',{name:'確認してパスワード設定へ'}).click();
 await expect(page.getByRole('alert').filter({hasText:'確認できませんでした'})).toContainText('確認できませんでした');expect(calls).toBe(1);
 expect(page.url()).toBe(`${base}/auth/callback`);
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);
});
test("Instagram only permits official image hosts and Preview stays disabled",()=>{
 expect(safeInstagramImage('https://scontent.cdninstagram.com/a.jpg')).toBe(true);
 for(const url of ['http://scontent.cdninstagram.com/a','https://127.0.0.1/a','https://cdninstagram.com.attacker.test/a','https://user:pass@scontent.cdninstagram.com/a','https://scontent.cdninstagram.com:8080/a'])expect(safeInstagramImage(url)).toBe(false);
 const previous=process.env.VERCEL_ENV,enabled=process.env.INSTAGRAM_SYNC_ENABLED;
 process.env.VERCEL_ENV='preview';process.env.INSTAGRAM_SYNC_ENABLED='true';expect(integrationEnabled('INSTAGRAM_SYNC_ENABLED')).toBe(false);
 if(previous===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=previous;
 if(enabled===undefined)delete process.env.INSTAGRAM_SYNC_ENABLED;else process.env.INSTAGRAM_SYNC_ENABLED=enabled;
});
test("official Instagram adapter handles photos, expired tokens, limits and disabled state using fixtures",async()=>{
 const exports:Record<string,unknown>={};const require=createRequire(process.cwd()+"/package.json");
 vm.runInNewContext(ts.transpileModule(readFileSync('lib/cms/instagram-worker.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:(name:string)=>name==='server-only'?{}:require(name),URL,AbortSignal,Date});
 const sync=exports.syncInstagram as typeof import('../lib/cms/instagram-worker').syncInstagram;
 const config={enabled:true,accountId:'123',apiVersion:'v25.0',accessToken:'fixture-only'};
 let calls=0,health='';const posts:unknown[]=[];
 const dependencies={fetch:async()=>{calls++;return Response.json({data:[{id:'456',media_type:'IMAGE',media_url:'https://scontent.cdninstagram.com/photo.jpg',permalink:'https://www.instagram.com/p/ABC/',timestamp:'2026-01-01T00:00:00Z'}]});},importPost:async(post:unknown)=>{posts.push(post);},health:async(status:string)=>{health=status;}};
 expect((await sync({...config,enabled:false},dependencies)).status).toBe('skipped');expect(calls).toBe(0);
 expect((await sync(config,dependencies)).status).toBe('ok');expect(posts).toHaveLength(1);expect(posts[0]).toHaveProperty('imageUrl','https://scontent.cdninstagram.com/photo.jpg');
 await sync(config,{...dependencies,fetch:async()=>Response.json({error:{code:190}},{status:401})});expect(health).toBe('token-expired');
 await sync(config,{...dependencies,fetch:async()=>Response.json({error:{code:4}},{status:429})});expect(health).toBe('rate-limited');
});
