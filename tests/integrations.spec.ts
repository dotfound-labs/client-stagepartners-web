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
 const dependencies={fetch:async()=>{calls++;return Response.json({data:[{id:'456',caption:'#お知らせ',media_type:'IMAGE',media_url:'https://scontent.cdninstagram.com/photo.jpg',permalink:'https://www.instagram.com/p/ABC/',timestamp:'2026-01-01T00:00:00Z'}]});},importPost:async(post:unknown)=>{posts.push(post);},health:async(status:string)=>{health=status;}};
 expect((await sync({...config,enabled:false},dependencies)).status).toBe('skipped');expect(calls).toBe(0);
 expect((await sync(config,dependencies)).status).toBe('ok');expect(posts).toHaveLength(1);expect(posts[0]).toHaveProperty('imageUrl','https://scontent.cdninstagram.com/photo.jpg');
 await sync(config,{...dependencies,fetch:async()=>Response.json({error:{code:190}},{status:401})});expect(health).toBe('token-expired');
 await sync(config,{...dependencies,fetch:async()=>Response.json({error:{code:4}},{status:429})});expect(health).toBe('rate-limited');
});

test("invitation readiness and labels agree for disabled, Preview and enabled fixtures",async()=>{
 const {invitationDeliveryConfig,invitationIntentMatches}=await import('../lib/cms/invitation-readiness');
 const {invitationPresentation}=await import('../lib/cms/invitation-presentation');
 const fixture={CMS_INVITATIONS_ENABLED:'true',NEXT_PUBLIC_SUPABASE_URL:'https://apkfyxfmsndwqjfetdad.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',SUPABASE_SECRET_KEY:'sb_secret_fixture',CMS_AUTH_CALLBACK_URL:'https://preview.example.test/auth/callback'};
 for(const env of [{...fixture,CMS_INVITATIONS_ENABLED:'false'},{...fixture,VERCEL_ENV:'preview'},{...fixture,SUPABASE_SECRET_KEY:undefined},{...fixture,CMS_AUTH_CALLBACK_URL:'https://example.test/other'}]){
  const enabled=Boolean(invitationDeliveryConfig(env));expect(enabled).toBe(false);expect(invitationPresentation(enabled).label).toContain('メール送信なし');
 }
 const enabled=Boolean(invitationDeliveryConfig(fixture));expect(enabled).toBe(true);expect(invitationPresentation(enabled).label).toBe('招待メールを送信');expect(invitationPresentation(enabled).notice).toContain('送信します');
 expect(invitationIntentMatches(false,true)).toBe(false);expect(invitationIntentMatches(true,false)).toBe(false);
});
test("password page uses verified server email and rejects unverified identity",async()=>{
 const require=createRequire(process.cwd()+"/package.json");let email='verified@example.test',confirmed=true;
 const exports:Record<string,unknown>={};
 vm.runInNewContext(ts.transpileModule(readFileSync('app/auth/set-password/page.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:(name:string)=>name==='@/lib/cms/server'?{sessionClient:async()=>({auth:{getUser:async()=>({data:{user:{email,email_confirmed_at:confirmed?'verified':null}},error:null})}})}:name==='next/navigation'?{redirect:()=>{throw new Error('REDIRECT');}}:name==='@/components/admin/AccountSetup'?{default:()=>null}:require(name)});
 const page=exports.default as ()=>Promise<{props:{verifiedEmail:string}}>;
 expect((await page()).props.verifiedEmail).toBe('verified@example.test');
 email='other-verified@example.test';expect((await page()).props.verifiedEmail).toBe(email);
 confirmed=false;expect(await page().then(()=>'',error=>error.message)).toBe('REDIRECT');
});


test("Instagram exact news hashtag boundaries and ten-post selection",async()=>{
 const exports:Record<string,unknown>={};const require=createRequire(process.cwd()+"/package.json");
 vm.runInNewContext(ts.transpileModule(readFileSync('lib/cms/instagram-worker.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:(n:string)=>n==='server-only'?{}:require(n),URL,AbortSignal,Date});
 const match=exports.isNewsCaption as (s:string)=>boolean;
 for(const s of ['#お知らせ','本文 #お知らせ。','📣#お知らせ\n'])expect(match(s)).toBe(true);
 for(const s of ['お知らせ','＃お知らせ','#お知らせ一覧','#お知らせ_','#お知らせ1','本文#お知らせ','##お知らせ','#お知らせ\u0301'])expect(match(s)).toBe(false);
 const sync=exports.syncInstagram as typeof import('../lib/cms/instagram-worker').syncInstagram;
 const imported:string[]=[];const data=Array.from({length:10},(_,i)=>({id:String(i+1),caption:i<2?'#お知らせ':'日常',media_type:'IMAGE',permalink:'https://www.instagram.com/p/ABC/',timestamp:'2026-01-01T00:00:00Z'}));
 const result=await sync({enabled:true,accountId:'123',apiVersion:'v25.0',accessToken:'fixture'},{fetch:async()=>Response.json({data}),importPost:async p=>{imported.push(p.mediaId);},health:async()=>{}});
 expect(result.imported).toBe(2);expect(imported).toEqual(['1','2']);
});

test("Instagram long-lived refresh saves rotation before use and refuses unsupported tokens",async()=>{
 const exports:Record<string,unknown>={};const require=createRequire(process.cwd()+"/package.json");
 vm.runInNewContext(ts.transpileModule(readFileSync('lib/cms/instagram-token.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:(n:string)=>n==='server-only'?{}:require(n),URL,AbortSignal,Date});
 const maintain=exports.maintainInstagramToken as typeof import('../lib/cms/instagram-token').maintainInstagramToken;
 const now=Date.parse('2026-10-25T00:00:00Z'),token={accessToken:'fixture-old',kind:'instagram-login-long-lived' as const,issuedAt:'2026-09-01T00:00:00Z',expiresAt:'2026-10-30T00:00:00Z'};
 let saved='';let calls=0;const deps={now:()=>now,fetch:async()=>{calls++;return Response.json({access_token:'fixture-new',expires_in:5184000});},save:async(t:typeof token)=>{saved=t.accessToken;}};
 expect((await maintain(token,deps)).status).toBe('refreshed');expect(saved).toBe('fixture-new');expect(calls).toBe(1);
 expect((await maintain({...token,expiresAt:'2026-10-24T00:00:00Z'},deps)).status).toBe('reauthorization-required');expect(calls).toBe(1);
 expect((await maintain({...token,issuedAt:'2026-10-24T12:00:00Z'},deps)).status).toBe('expiring');expect(calls).toBe(1);
 expect((await maintain(token,{...deps,save:async()=>{throw Error('fixture');}})).token).toBeUndefined();
 expect((await maintain(token,{...deps,fetch:async()=>Response.json({error:{code:190}},{status:401})})).status).toBe('reauthorization-required');
 const limited=await maintain(token,{...deps,fetch:async()=>Response.json({error:{code:4}},{status:429,headers:{'retry-after':'7200'}})});expect(limited.status).toBe('rate-limited');expect(limited.retrySeconds).toBe(7200);
 expect((await maintain(token,{...deps,fetch:async()=>{throw Error('fixture');}})).status).toBe('refresh-error');
});

 test("design fixture route is unavailable in production",async({request})=>{expect((await request.get(base+'/admin-design-preview')).status()).toBe(404);});

 test("Instagram OAuth verifies target identity and gates durable Vercel setup",async()=>{
 const exports:Record<string,unknown>={};const require=createRequire(process.cwd()+"/package.json");const env:Record<string,string>={INSTAGRAM_OAUTH_ENABLED:'true',INSTAGRAM_TOKEN_STORE:'local-file',INSTAGRAM_APP_ID:'123',INSTAGRAM_APP_SECRET:'fixture',INSTAGRAM_REDIRECT_URI:'https://test.example/api/admin/instagram/oauth',INSTAGRAM_API_VERSION:'v25.0'};
 vm.runInNewContext(ts.transpileModule(readFileSync('lib/cms/instagram-oauth.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:(n:string)=>n==='server-only'?{}:require(n),URL,URLSearchParams,AbortSignal,Date,process:{env}});
 const config=exports.instagramOAuthConfig as typeof import('../lib/cms/instagram-oauth').instagramOAuthConfig;
 expect(config()).not.toBeNull();env.VERCEL='1';expect(config()).toBeNull();delete env.VERCEL;
 env.INSTAGRAM_REDIRECT_URI='http://test.example/api/admin/instagram/oauth';expect(config()).toBeNull();env.INSTAGRAM_REDIRECT_URI='https://test.example/api/admin/instagram/oauth';
 const exchange=exports.exchangeInstagramCode as typeof import('../lib/cms/instagram-oauth').exchangeInstagramCode;
 let i=0;const responses=[{access_token:'fixture-short'},{access_token:'fixture-long',expires_in:5184000},{user_id:'123',username:'aim_architecture'}];
 const result=await exchange('fixture-code',config()!,async()=>Response.json(responses[i++]));expect(result.username).toBe('aim_architecture');expect(result.token.kind).toBe('instagram-login-long-lived');
 env.VERCEL='1';env.INSTAGRAM_TOKEN_STORE='encrypted-db';env.INSTAGRAM_TOKEN_ENCRYPTION_KEY='11'.repeat(32);env.SUPABASE_SECRET_KEY='synthetic-server-config';expect(config()).not.toBeNull();env.VERCEL_ENV='preview';expect(config()).toBeNull();delete env.VERCEL_ENV;delete env.VERCEL;env.INSTAGRAM_TOKEN_STORE='local-file';
 i=0;responses[2]={user_id:'123',username:'wrong_account'};expect(await exchange('fixture-code',config()!,async()=>Response.json(responses[i++])).then(()=>'',e=>e.message)).toBe('ACCOUNT_MISMATCH');
 });

test('Instagram encrypted envelope authenticates ciphertext and wrong keys fail closed',()=>{
 const exports:Record<string,unknown>={};const require=createRequire(process.cwd()+"/package.json");
 vm.runInNewContext(ts.transpileModule(readFileSync('lib/cms/instagram-token-crypto.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:(n:string)=>n==='server-only'?{}:require(n),Buffer,Date,process:{env:{}}});
 const seal=exports.sealInstagramToken as typeof import('../lib/cms/instagram-token-crypto').sealInstagramToken;
 const open=exports.openInstagramToken as typeof import('../lib/cms/instagram-token-crypto').openInstagramToken;
 const key=Buffer.alloc(32,17),token={accessToken:'synthetic-test-token',kind:'instagram-login-long-lived' as const,issuedAt:'2026-01-01T00:00:00Z',expiresAt:'2026-02-01T00:00:00Z'};
 const a=seal(token,key),b=seal(token,key);expect(a).not.toBe(b);expect(a).not.toContain(token.accessToken);expect(open(a,key)).toEqual(token);
 expect(()=>open(a,Buffer.alloc(32,18))).toThrow('TOKEN_DECRYPTION_FAILED');
 const parts=a.split('.');parts[3]=(parts[3][0]==='a'?'b':'a')+parts[3].slice(1);expect(()=>open(parts.join('.'),key)).toThrow('TOKEN_DECRYPTION_FAILED');
 expect(()=>open('v2.'+a.slice(3),key)).toThrow('TOKEN_DECRYPTION_FAILED');
 const parse=exports.tokenEncryptionKey as typeof import('../lib/cms/instagram-token-crypto').tokenEncryptionKey;expect(()=>parse('short')).toThrow('TOKEN_KEY_UNCONFIGURED');
});

test('Instagram durable adapter saves ciphertext, sanitizes status and blocks Preview',async()=>{
 const require=createRequire(process.cwd()+"/package.json"),env:Record<string,string>={VERCEL:'1',VERCEL_ENV:'production',INSTAGRAM_TOKEN_STORE:'encrypted-db',INSTAGRAM_TOKEN_ENCRYPTION_KEY:'11'.repeat(32),SUPABASE_SECRET_KEY:'synthetic-server-config'};
 let ciphertext:string|null=null,calls=0,failCommit=false;
 const rpc=async(_name:string,args:{p_action:string;p_ciphertext:string})=>{calls++;if(args.p_action==='commit'){if(failCommit)return {data:null,error:{message:'fixture lease expired'}};ciphertext=args.p_ciphertext;}return {data:args.p_action==='claim'?{lease:'fixture-lease',ciphertext}:args.p_action==='read'?{ciphertext}:{},error:null};};
 const modules:Record<string,unknown>={};
 const load=(file:string)=>{const exports:Record<string,unknown>={};vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:(n:string)=>n==='server-only'?{}:modules[n]??require(n),Buffer,Date,URL,AbortSignal,fetch,process:{env}});return exports;};
 modules['./instagram-token']=load('lib/cms/instagram-token.ts');modules['./instagram-token-crypto']=load('lib/cms/instagram-token-crypto.ts');modules['./trusted-server']={trustedServerClient:()=>({rpc})};modules['./instagram-token-file']={};
 const store=load('lib/cms/instagram-token-store.ts') as unknown as typeof import('../lib/cms/instagram-token-store');
 const token={accessToken:'synthetic-fixture-token',kind:'instagram-login-long-lived' as const,issuedAt:new Date(Date.now()-86400000).toISOString(),expiresAt:new Date(Date.now()+30*86400000).toISOString()};
 await store.saveInstagramConnection(token);expect(ciphertext).not.toContain(token.accessToken);expect((await store.storedInstagramToken()).token).toEqual(token);
 const metadata=await store.instagramTokenMetadata();expect(metadata).toEqual({state:'connected',expiresAt:token.expiresAt});expect(JSON.stringify(metadata)).not.toContain(token.accessToken);
 failCommit=true;expect(await store.saveInstagramConnection(token).then(()=>'',e=>e.message)).toBe('TOKEN_STORE_FAILED');
 env.VERCEL_ENV='preview';const before=calls;expect(await store.instagramTokenMetadata()).toEqual({state:'unconnected',expiresAt:null});expect(await store.saveInstagramConnection(token).then(()=>'',e=>e.message)).toBe('STORE_UNAVAILABLE');expect((await store.storedInstagramToken()).token).toBeUndefined();expect(calls).toBe(before);
});
