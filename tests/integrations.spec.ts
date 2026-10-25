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
 const bound=await maintain({...token,accountId:'456',username:'another_business'},{...deps,fetch:async()=>Response.json({access_token:'fixture-new',expires_in:5184000})});expect(bound.token?.accountId).toBe('456');expect(bound.token?.username).toBe('another_business');
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
 const result=await exchange('fixture-code',config()!,async()=>Response.json(responses[i++]),'aim_architecture');expect(result.username).toBe('aim_architecture');expect(result.token.accountId).toBe('123');expect(result.token.kind).toBe('instagram-login-long-lived');
 env.VERCEL='1';env.INSTAGRAM_TOKEN_STORE='encrypted-db';env.INSTAGRAM_TOKEN_ENCRYPTION_KEY='11'.repeat(32);env.SUPABASE_SECRET_KEY='synthetic-server-config';expect(config()).not.toBeNull();env.VERCEL_ENV='preview';expect(config()).toBeNull();delete env.VERCEL_ENV;delete env.VERCEL;env.INSTAGRAM_TOKEN_STORE='local-file';
 i=0;responses[2]={user_id:'456',username:'another_business'};expect((await exchange('fixture-code',config()!,async()=>Response.json(responses[i++]),'another_business')).token.accountId).toBe('456');
 i=0;responses[2]={user_id:'123',username:'wrong_account'};expect(await exchange('fixture-code',config()!,async()=>Response.json(responses[i++]),'another_business').then(()=>'',e=>e.message)).toBe('ACCOUNT_MISMATCH');
 expect(await exchange('fixture-code',config()!,async()=>{throw Error('must not fetch');}).then(()=>'',e=>e.message)).toBe('TARGET_REQUIRED');
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
 expect(()=>open('v1.'+a.slice(3),key)).toThrow('TOKEN_DECRYPTION_FAILED');
 const parse=exports.tokenEncryptionKey as typeof import('../lib/cms/instagram-token-crypto').tokenEncryptionKey;expect(()=>parse('short')).toThrow('TOKEN_KEY_UNCONFIGURED');
});

test('Instagram durable adapter saves ciphertext, sanitizes status and blocks Preview',async()=>{
 const require=createRequire(process.cwd()+"/package.json"),env:Record<string,string>={VERCEL:'1',VERCEL_ENV:'production',INSTAGRAM_TOKEN_STORE:'encrypted-db',INSTAGRAM_TOKEN_ENCRYPTION_KEY:'11'.repeat(32),SUPABASE_SECRET_KEY:'synthetic-server-config'};
 let ciphertext:string|null=null,calls=0,failCommit=false,failRelease=false;
 const rpc=async(_name:string,args:{p_action:string;p_ciphertext:string})=>{calls++;if(args.p_action==='commit'){ciphertext=args.p_ciphertext;if(failCommit)return {data:null,error:{message:'fixture uncertain commit'}};}if(args.p_action==='release'&&failRelease)return {data:null,error:{message:'fixture release failure'}};return {data:args.p_action==='claim'?{lease:'fixture-lease',ciphertext}:args.p_action==='read'?{ciphertext}:{},error:null};};
 const modules:Record<string,unknown>={};
 const load=(file:string)=>{const exports:Record<string,unknown>={};vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:(n:string)=>n==='server-only'?{}:modules[n]??require(n),Buffer,Date,URL,AbortSignal,fetch,process:{env}});return exports;};
 modules['./instagram-token']=load('lib/cms/instagram-token.ts');modules['./instagram-token-crypto']=load('lib/cms/instagram-token-crypto.ts');modules['./trusted-server']={trustedServerClient:()=>({rpc})};modules['./instagram-token-file']={};
 const store=load('lib/cms/instagram-token-store.ts') as unknown as typeof import('../lib/cms/instagram-token-store');
 const token={accessToken:'synthetic-fixture-token',kind:'instagram-login-long-lived' as const,issuedAt:new Date(Date.now()-86400000).toISOString(),expiresAt:new Date(Date.now()+30*86400000).toISOString()};
 await store.saveInstagramConnection(token);expect(ciphertext).not.toContain(token.accessToken);expect((await store.storedInstagramToken()).token).toEqual(token);
 const metadata=await store.instagramTokenMetadata();expect(metadata).toEqual({state:'connected',expiresAt:token.expiresAt});expect(JSON.stringify(metadata)).not.toContain(token.accessToken);
 failCommit=true;expect(await store.saveInstagramConnection(token).then(()=>'',e=>e.message)).toBe('TOKEN_STORE_FAILED');expect((await store.instagramTokenMetadata()).state).toBe('connected');failCommit=false;failRelease=true;await store.saveInstagramConnection(token);expect((await store.instagramTokenMetadata()).state).toBe('connected');
 env.VERCEL_ENV='preview';const before=calls;expect(await store.instagramTokenMetadata()).toEqual({state:'unconnected',expiresAt:null});expect(await store.saveInstagramConnection(token).then(()=>'',e=>e.message)).toBe('STORE_UNAVAILABLE');expect((await store.storedInstagramToken()).token).toBeUndefined();expect(calls).toBe(before);
});

import {contactProvider} from '../lib/cms/contact-provider';
import {submitContact} from '../lib/contact-submit';
import * as contactNotification from '../lib/contact-notification';
test('Web3Forms standard browser mode needs no PRO key and Preview stays disabled',()=>{
 const env={CONTACT_INTAKE_ENABLED:'true',SUPABASE_SECRET_KEY:'sb_secret_fixture',WEB3FORMS_MODE:'browser',WEB3FORMS_ACCESS_KEY:'00000000-0000-4000-8000-000000000001'};
 expect(contactProvider(env)).toEqual({mode:'browser',accessKey:env.WEB3FORMS_ACCESS_KEY});expect(contactProvider({...env,VERCEL_ENV:'preview'})).toBeNull();expect(contactProvider({...env,WEB3FORMS_ACCESS_KEY:''})).toBeNull();
 expect(contactProvider({CONTACT_INTAKE_ENABLED:'true',SUPABASE_SECRET_KEY:'sb_secret_fixture',WEB3FORMS_SECRET_KEY:'w3f_live_fixture',WEB3FORMS_FORM_ID:'fixture'})).toMatchObject({mode:'server'});
});
test('Web3Forms browser pipeline never mistakes DB receipt for notification acceptance',async()=>{
 const fields={name:'Fixture',email:'fixture@example.test',phone:'',inquiry_type:'Fixture',message:'Synthetic',website:''},id='00000000-0000-4000-8000-000000000002';
 const start={success:false,saved:true,mode:'browser',attemptAllowed:true,accessKey:'00000000-0000-4000-8000-000000000001'};
 let calls:string[]=[];let result=await submitContact(fields,id,async url=>{calls.push(String(url));return calls.length===1?Response.json(start):Response.json({success:true});});
 expect(result).toEqual({accepted:true,saved:true});expect(calls).toEqual(['/api/contact','https://api.web3forms.com/submit']);
 calls=[];result=await submitContact(fields,id,async url=>{calls.push(String(url));return calls.length===1?Response.json(start):Response.json({success:false},{status:429});});expect(result).toEqual({accepted:false,saved:true});
 calls=[];result=await submitContact(fields,id,async url=>{calls.push(String(url));return Response.json({success:false,saved:true,notification:'unconfirmed'},{status:409});});expect(result.accepted).toBe(false);expect(calls).toHaveLength(1);
 calls=[];result=await submitContact(fields,id,async url=>{calls.push(String(url));if(calls.length===2)throw Error('fixture timeout');return Response.json(start);});expect(result).toEqual({accepted:false,saved:true});
 result=await submitContact(fields,id,async()=>Response.json({success:false,saved:true,notification:'uncertain'},{status:202}));expect(result.accepted).toBe(false);
 result=await submitContact(fields,id,async()=>Response.json({success:true,saved:true,notification:'accepted'}));expect(result.accepted).toBe(true);
});
test('Web3Forms API validates, suppresses repeat attempts and reports PRO failures honestly',async()=>{
 const require=createRequire(process.cwd()+"/package.json"),exports:Record<string,unknown>={};let provider:ReturnType<typeof contactProvider>={mode:'browser',accessKey:'00000000-0000-4000-8000-000000000001'},fresh=true,sends=0,rpcCalls=0;
 const mods:Record<string,unknown>={'@/lib/contact-notification':contactNotification,'@/lib/cms/request-body':{limitedText:async(r:Request)=>r.text()},'@/lib/cms/csrf':{sameOrigin:()=>true},'@/lib/cms/integration-config':{contactReady:()=>Boolean(provider)},'@/lib/cms/contact-provider':{contactProvider:()=>provider},'@/lib/cms/trusted-server':{trustedServerClient:()=>({rpc:async(name:string)=>{rpcCalls++;return {data:name==='cms_receive_inquiry'?fresh:null,error:null};}})}};
 vm.runInNewContext(ts.transpileModule(readFileSync('app/api/contact/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:(n:string)=>mods[n]??require(n),Response,Request,AbortSignal,TextEncoder,fetch:async()=>{sends++;return Response.json({success:false},{status:500});},process:{env:{}}});
 const post=exports.POST as (r:Request)=>Promise<Response>,fields={id:'00000000-0000-4000-8000-000000000002',name:'Fixture',email:'fixture@example.test',phone:'',inquiry_type:'Fixture',message:'Synthetic',website:''};
 const request=(value:unknown)=>new Request('https://fixture.example/api/contact',{method:'POST',body:JSON.stringify(value)});
 let response=await post(request(fields));expect(await response.json()).toMatchObject({success:false,saved:true,mode:'browser',attemptAllowed:true});expect(sends).toBe(0);
 fresh=false;response=await post(request(fields));expect(response.status).toBe(409);expect(sends).toBe(0);
 const before=rpcCalls;response=await post(request({...fields,website:'spam'}));expect(response.status).toBe(400);expect(rpcCalls).toBe(before);
 fresh=true;provider={mode:'server',secret:'w3f_live_fixture',formId:'fixture'};response=await post(request(fields));expect(response.status).toBe(202);expect(await response.json()).toEqual({success:false,saved:true,notification:'uncertain'});expect(sends).toBe(1);
 provider=null;response=await post(request(fields));expect(response.status).toBe(503);expect(sends).toBe(1);
});

test('Instagram OAuth rejects mismatched state, replay, revoked owner and uncertain persistence',async()=>{
 const require=createRequire(process.cwd()+"/package.json"),exports:Record<string,unknown>={},jar=new Map<string,string>();let revoked=false,failSave=false,exchanges=0,saves=0;
 const mods:Record<string,unknown>={'@/lib/cms/request-body':{limitedText:(r:Request)=>r.text()},'next/headers':{cookies:async()=>({get:(name:string)=>jar.has(name)?{value:jar.get(name)}:undefined,set:(name:string,value:string)=>jar.set(name,value),delete:({name}:{name:string})=>jar.delete(name)})},'next/server':{NextResponse:{redirect:(url:URL)=>new Response(null,{status:307,headers:{Location:url.href}})}},'@/lib/cms/server':{requireIdentity:async()=>{if(revoked)throw Error('fixture revoked');return {identity:{id:'fixture-owner',owner:true},client:{rpc:async()=>({error:null})}};}},'@/lib/cms/csrf':{sameOrigin:()=>true},'@/lib/cms/instagram-oauth':{instagramOAuthConfig:()=>({appId:'123',redirect:'https://fixture.example/api/admin/instagram/oauth'}),exchangeInstagramCode:async(_code:unknown,_config:unknown,_fetch:unknown,target:string)=>{expect(target).toBe('fixture_business');exchanges++;return {accountId:'123',username:'aim_architecture',token:{accessToken:'synthetic-oauth-token'}};}},'@/lib/cms/instagram-token-store':{saveInstagramConnection:async()=>{saves++;if(failSave)throw Error('fixture uncertain write');}}};
 vm.runInNewContext(ts.transpileModule(readFileSync('app/api/admin/instagram/oauth/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:(n:string)=>mods[n]??require(n),Buffer,Response,URL,URLSearchParams,fetch});
 const post=exports.POST as (r:Request)=>Promise<Response>,get=exports.GET as (r:Request)=>Promise<Response>,base='https://fixture.example/api/admin/instagram/oauth';
 const start=async()=>new URL((await (await post(new Request(base,{method:'POST',body:JSON.stringify({username:'fixture_business'})}))).json()).url).searchParams.get('state')!;
 let state=await start();expect((await get(new Request(base+'?state='+('0'.repeat(64))+'&code=fixture'))).status).toBe(400);expect(exchanges).toBe(0);
 state=await start();expect((await get(new Request(base+'?state='+state+'&code=fixture'))).status).toBe(307);expect(exchanges).toBe(1);expect(saves).toBe(1);expect((await get(new Request(base+'?state='+state+'&code=fixture'))).status).toBe(400);expect(exchanges).toBe(1);
 state=await start();revoked=true;expect((await get(new Request(base+'?state='+state+'&code=fixture'))).status).toBe(400);expect(exchanges).toBe(1);
 revoked=false;state=await start();failSave=true;const failed=await get(new Request(base+'?state='+state+'&code=fixture'));expect(failed.status).toBe(400);expect(await failed.text()).not.toContain('synthetic-oauth-token');
});


test('Web3Forms Japanese notification preserves fields and reply address without HTML templates',async()=>{
 const fields={name:'動作確認',company:'テスト会社',email:'fixture@example.test',phone:'',inquiry_type:'その他',message:'動作確認です。返信不要です。',website:''};
 let delivery:Record<string,unknown>={};let calls=0;
 const fetcher=(async(_url:unknown,init?:RequestInit)=>{calls++;if(calls===1)return Response.json({saved:true,mode:'browser',attemptAllowed:true,accessKey:'00000000-0000-4000-8000-000000000001'});delivery=JSON.parse(String(init?.body));return Response.json({success:true});}) as typeof fetch;
 expect(await submitContact(fields,'fixture-id',fetcher)).toEqual({accepted:true,saved:true});
 expect(delivery).toMatchObject({subject:'【STAGE PARTNERS】ホームページにお問い合わせがありました','氏名':fields.name,'会社名':fields.company,'メールアドレス':fields.email,'電話番号':'記載なし','お問い合わせ内容':fields.message,replyto:fields.email});
 expect(delivery).not.toHaveProperty('ccemail');expect(delivery).not.toHaveProperty('webhook');
 expect(contactNotification.storedInquiryMessage(fields)).toBe('会社名：テスト会社\n\n'+fields.message);
 expect(contactNotification.storedInquiryMessage({...fields,company:''})).toBe(fields.message);
});
