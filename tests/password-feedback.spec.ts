import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(process.cwd()+'/package.json');
const compile=(path:string)=>ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
test('password setup API separates committed save from membership and logout errors',async()=>{
 let active=true,readError=false,saveError=false,verified=true,signoutError=false,updates=0;
 class CmsError extends Error{constructor(public status:number,message:string){super(message);}}
 const client={auth:{getUser:async()=>({data:{user:{id:'fixture',email_confirmed_at:verified?'verified':null}},error:null}),updateUser:async()=>{updates++;return {error:saveError?{}:null};},signOut:async()=>{if(signoutError)throw Error('synthetic');return {error:null};}},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>{if(readError)throw Error('synthetic');return {data:{active},error:null};}})})})};
 const exports:Record<string,unknown>={};vm.runInNewContext(compile('app/api/auth/[action]/route.ts'),{exports,Response,require:(name:string)=>name==='@/lib/cms/server'?{CmsError,sessionClient:async()=>client}:name==='@/lib/cms/csrf'?{sameOrigin:()=>true}:name==='@/lib/cms/request-body'?{limitedText:(r:Request)=>r.text()}:require(name)});
 const post=exports.POST as (r:Request,p:unknown)=>Promise<Response>;const call=()=>post(new Request('http://localhost/api/auth/password',{method:'POST',body:JSON.stringify({password:'synthetic-only-fixture'})}),{params:Promise.resolve({action:'password'})});
 expect(await (await call()).json()).toEqual({ok:true,saved:true,access:'enabled',signedOut:true});
 active=false;expect((await (await call()).json()).access).toBe('unavailable');
 readError=true;signoutError=true;expect(await (await call()).json()).toEqual({ok:true,saved:true,access:'unknown',signedOut:false});
 saveError=true;expect((await call()).status).toBe(400);
 verified=false;const before=updates;expect((await call()).status).toBe(401);expect(updates).toBe(before);
});
for(const access of ['enabled','unavailable','unknown','failure'])test(`password setup component ${access} has honest completion and single submit`,async()=>{
 const values:unknown[]=[];let cursor=0,calls=0,resets=0;const ref={current:false};let resolve!:()=>void;const waiting=new Promise<void>(r=>resolve=r);
 const exports:Record<string,unknown>={};vm.runInNewContext(compile('components/admin/AccountSetup.tsx'),{exports,require:(name:string)=>name==='react'?{useRef:()=>ref,useState:(initial:unknown)=>{const index=cursor++;if(!(index in values))values[index]=initial;return [values[index],(value:unknown)=>values[index]=value];}}:name==='next/link'?{default:'a'}:name.endsWith('.css')?{}:require(name),FormData:class{get(){return 'synthetic-only-fixture';}},fetch:async()=>{calls++;await waiting;return {ok:access!=='failure',json:async()=>access==='failure'?{error:'Synthetic save rejected'}:{ok:true,saved:true,access,signedOut:true}};},window:{location:{replace:()=>{throw Error('Unexpected navigation');}},history:{replaceState:()=>{throw Error('Unexpected history change');}}}});
 const component=exports.default as (p:unknown)=>unknown;const render=()=>{cursor=0;return component({verifiedEmail:'fixture@example.test'});};
 type Element={type:unknown;props:{children?:unknown;onSubmit?:(e:unknown)=>Promise<void>}};
 function findForm(value:unknown):Element|undefined{if(!value||typeof value!=='object')return;const e=value as Element;if(e.type==='form')return e;for(const child of [e.props?.children].flat(Infinity)){const found=findForm(child);if(found)return found;}}
 const form=findForm(render())!;const event={preventDefault(){},currentTarget:{reset(){resets++;}}};const first=form.props.onSubmit!(event);await form.props.onSubmit!(event);resolve();await first;
 expect(calls).toBe(1);const html=require('react-dom/server').renderToStaticMarkup(render());
 if(access==='failure'){expect(html).toContain('Synthetic save rejected');expect(html).not.toContain('パスワードを設定しました');expect(resets).toBe(0);}else{expect(html).toContain('パスワードを設定しました');expect(html).toContain('ログイン画面へ');expect(html).not.toContain('type="password"');expect(resets).toBe(1);if(access==='unavailable')expect(html).toContain('利用権限がありません');if(access==='unknown')expect(html).toContain('まだ確認できていません');}
});
