import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
test('Instagram setup reports missing configuration without disclosing secrets',()=>{
 const env:Record<string,string>={},exports:Record<string,unknown>={};
 vm.runInNewContext(ts.transpileModule(readFileSync('lib/cms/instagram-oauth.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:()=>({}),process:{env},URL});
 const status=exports.instagramSetupStatus as (origin:string)=>{checks:Record<string,boolean>;storageMode:string};
 const config=exports.instagramOAuthConfig as ()=>unknown;
 expect(status('http://localhost:3102').checks.appId).toBe(false);expect(config()).toBeNull();
 Object.assign(env,{INSTAGRAM_APP_ID:'123456',INSTAGRAM_APP_SECRET:'synthetic-private-app-secret',INSTAGRAM_REDIRECT_URI:'https://fixture.example/api/admin/instagram/oauth',INSTAGRAM_API_VERSION:'v25.0',INSTAGRAM_TOKEN_STORE:'encrypted-db',INSTAGRAM_TOKEN_ENCRYPTION_KEY:'a'.repeat(64),SUPABASE_SECRET_KEY:'synthetic-private-server-key',INSTAGRAM_OAUTH_ENABLED:'true'});
 expect(status('https://fixture.example').checks.origin).toBe(true);expect(config()).not.toBeNull();
 expect(JSON.stringify(status('https://fixture.example'))).not.toMatch(/synthetic-private|aaaaaaaa|123456/);
 expect(status('http://localhost:3102').checks.origin).toBe(false);
 env.INSTAGRAM_REDIRECT_URI='https://fixture.example/api/admin/instagram/oauth?secret=do-not-display';
 expect(status('https://fixture.example').checks.redirect).toBe(false);expect(config()).toBeNull();
 env.VERCEL_ENV='preview';expect(status('https://fixture.example').checks.environment).toBe(false);expect(config()).toBeNull();
});

for(const width of [1280,375])test(`Instagram setup worksheet ${width} never activates integration`,async({page})=>{
 let posts=0;
 await page.route('**/api/admin/**',route=>{if(route.request().method()==='POST')posts++;return route.abort();});
 await page.setViewportSize({width,height:720});
 await page.goto('http://127.0.0.1:3102/admin-design-preview');
 await page.getByRole('button',{name:'07 設定',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Instagram連携',exact:true})).toBeVisible();
  await expect(page.getByLabel('接続するInstagramユーザー名',{exact:true})).toHaveValue('');
  await page.getByLabel('接続するInstagramユーザー名',{exact:true}).fill('@another_business');
  await expect(page.getByLabel('接続するInstagramユーザー名',{exact:true})).toHaveValue('@another_business');
 await page.getByLabel('InstagramアプリID',{exact:true}).fill('123456');
 await page.getByLabel('HTTPSの認証戻り先',{exact:true}).fill('https://fixture.example/api/admin/instagram/oauth');
 await page.getByLabel('APIバージョン',{exact:true}).fill('v25.0');
 await page.getByRole('button',{name:'設定用の内容を確認',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('まだサーバーには保存されていません');
 await expect(page.getByLabel('サーバー設定に転記する内容')).toHaveValue(/INSTAGRAM_APP_ID=123456/);
 await expect(page.getByRole('button',{name:'Instagramで認可する・再接続'})).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByLabel('HTTPSの認証戻り先',{exact:true}).fill('http://fixture.example/api/admin/instagram/oauth');
 await page.getByRole('button',{name:'設定用の内容を確認',exact:true}).click();
  await expect(page.locator('.admin-instagram-setup').getByRole('alert')).toContainText('HTTPS');expect(posts).toBe(0);
});

test('Instagram account switch refuses the old token before fetching posts',async()=>{
 const require=createRequire(process.cwd()+'/package.json'),exports:Record<string,unknown>={};let fetches=0,imports=0;
 const config={enabled:true,account_id:'222'};
 const db={from:()=>({select:()=>({eq:()=>({single:async()=>({data:config,error:null})})})}),rpc:async(name:string)=>{if(name==='cms_import_instagram')imports++;return {data:true,error:null};}};
 const mods:Record<string,unknown>={
  '@/lib/cms/trusted-server':{trustedServerClient:()=>db},
  '@/lib/cms/instagram-worker':{syncInstagram:async()=>{fetches++;return {}; }},
  '@/lib/cms/integration-config':{integrationEnabled:()=>true,safeInstagramImage:()=>true},
  '@/lib/cms/instagram-token-store':{storedInstagramToken:async()=>({status:'ok',token:{accountId:'111',accessToken:'synthetic-old-account-token'}})},
 };
 vm.runInNewContext(ts.transpileModule(readFileSync('app/api/jobs/instagram/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:(n:string)=>mods[n]??require(n),process:{env:{CRON_SECRET:'s'.repeat(32),INSTAGRAM_API_VERSION:'v25.0',INSTAGRAM_TOKEN_STORE:'encrypted-db'}},Response,Buffer,fetch:async()=>{throw Error('Unexpected external fetch');}});
 const get=exports.GET as (r:Request)=>Promise<Response>;
 const result=await get(new Request('https://fixture.example/api/jobs/instagram',{headers:{authorization:'Bearer '+'s'.repeat(32)}}));
 expect(result.status).toBe(503);expect(await result.json()).toEqual({status:'account-mismatch-reauthorization-required'});expect(fetches).toBe(0);expect(imports).toBe(0);
});
