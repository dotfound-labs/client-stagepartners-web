import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import sharp from 'sharp';
import {createElement,type ReactNode} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as settings from '../lib/cms/site-settings';
import * as model from '../lib/cms/model';
import {PAGE_TEMPLATES} from '../content/page-fields';
import {PAGE_ASSETS} from '../content/page-assets';
import {safeHref,resolvePageMetadata} from '../lib/cms/page-values';
import {textKey} from '../lib/cms/text-key';

const require=createRequire(process.cwd()+'/package.json');
function load<T>(file:string,mocks:Record<string,unknown>={},env:Record<string,string>={}){
 const exports:Record<string,unknown>={};
 const source=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(source,{exports,require:(name:string)=>name==='server-only'?{}:Object.hasOwn(mocks,name)?mocks[name]:require(name),process:{env,cwd:()=>process.cwd()},URL,Response,Request,Buffer,Uint8Array,TextEncoder,console});
 return exports as T;
}
const common=(fields:Record<string,string>={},images?:model.PageData['images']):model.PageData=>({title:'共通設定',fields,...(images?{images}:{})});

test('SEO settings preserve existing defaults and normalize only valid published values',()=>{
 expect(settings.resolveSiteSettings()).toEqual(settings.SITE_DEFAULTS);
 expect(settings.SITE_DEFAULTS.siteName).toBe('STAGE PARTNERS');
 expect(settings.SITE_DEFAULTS.url).toBe('https://www.stagepartners.co.jp');
 const result=settings.resolveSiteSettings(common({'common.seo_site_name':' 新サイト名 ','common.seo_title':' 新タイトル ','common.seo_description':' 新しい説明 ','common.seo_url':'https://Example.test/','common.seo_indexing':'noindex'}));
 expect(result).toMatchObject({siteName:'新サイト名',title:'新タイトル',description:'新しい説明',url:'https://example.test',indexing:'noindex'});
 expect(settings.resolveSiteSettings(common({'common.seo_site_name':' ','common.seo_title':'x'.repeat(201),'common.seo_description':'','common.seo_url':'javascript:alert(1)','common.seo_indexing':'unexpected'}))).toEqual(settings.SITE_DEFAULTS);
});

test('SEO validation rejects invalid origins, blank fields and invalid indexing settings',()=>{
 for(const url of ['http://example.test','https://user:pass@example.test','https://example.test:8080','https://example.test/path','https://example.test?q=1','https://example.test/#fragment','https://localhost','https://127.0.0.1','//example.test','javascript:alert(1)',' https://example.test','https://example.test\n','https://example.test\\path','https://'+'a'.repeat(64)+'.test']){
  expect(settings.validSiteOrigin(url),url).toBe(false);
  expect(()=>settings.validateSiteFields({'common.seo_url':url}),url).toThrow();
 }
 for(const [key,max] of [['common.seo_site_name',100],['common.seo_title',200],['common.seo_description',500]] as const){
  expect(()=>settings.validateSiteFields({[key]:' '})).toThrow();
  expect(()=>settings.validateSiteFields({[key]:'x'.repeat(max+1)})).toThrow();
  expect(()=>settings.validateSiteFields({[key]:'x'.repeat(max)})).not.toThrow();
 }
 expect(()=>settings.validateSiteFields({'common.seo_indexing':'anything'})).toThrow();
 expect(()=>settings.validateSiteFields({})).not.toThrow();
});

test('SEO metadata reads only common published settings and always excludes Preview from indexing',async()=>{
 for(const preview of [false,true])for(const indexing of ['index','noindex']){
  const reads:string[]=[];
  const api=load<typeof import('../lib/cms/site-metadata')>('lib/cms/site-metadata.ts',{'./public':{getPageContent:async(slug:string)=>{reads.push(slug);return common({'common.seo_site_name':'公開サイト','common.seo_title':'公開タイトル','common.seo_description':'公開説明','common.seo_url':'https://published.example','common.seo_indexing':indexing});}},'./site-settings':settings},preview?{VERCEL_ENV:'preview'}:{});
  const metadata=await api.siteMetadata();
  expect(reads).toEqual(['common']);expect(new URL(String(metadata.metadataBase)).origin).toBe('https://published.example');
  expect(metadata).toMatchObject({title:'公開タイトル',description:'公開説明',robots:{index:!preview&&indexing==='index',follow:!preview&&indexing==='index'},openGraph:{title:'公開タイトル',description:'公開説明',siteName:'公開サイト'},twitter:{card:'summary_large_image',title:'公開タイトル'}});
  expect(JSON.stringify(metadata.icons)).toContain('/site-assets/icon');expect(JSON.stringify(metadata.openGraph)).toContain('/site-assets/og');
 }
 const failed=load<typeof import('../lib/cms/site-metadata')>('lib/cms/site-metadata.ts',{'./public':{getPageContent:async()=>{throw Error('Published read failed');}},'./site-settings':settings});
 expect(await failed.siteMetadata().then(()=>'',error=>String(error))).toContain('Published read failed');
});

test('SEO child metadata keeps published social assets while using the page title and canonical',async()=>{
 const site=load<typeof import('../lib/cms/site-metadata')>('lib/cms/site-metadata.ts',{'./public':{getPageContent:async()=>common({'common.seo_site_name':'公開サイト'})},'./site-settings':settings});
 const api=load<typeof import('../lib/cms/metadata')>('lib/cms/metadata.ts',{'./public':{getPageFields:async()=>({[`company.${textKey('Company')}`]:'公開ページ名',[`company.${textKey('Description')}`]:'公開ページ説明'})},'./page-values':{resolvePageMetadata},'./site-metadata':{publicPageMetadata:site.publicPageMetadata}});
 const result=await api.pageMetadata('company',{title:'Company',description:'Description',alternates:{canonical:'/company'}});
 expect(result).toMatchObject({title:'公開ページ名',description:'公開ページ説明',alternates:{canonical:'/company'},openGraph:{title:'公開ページ名',description:'公開ページ説明',siteName:'公開サイト',url:'/company'},twitter:{title:'公開ページ名',description:'公開ページ説明'}});
 expect(result.openGraph).toHaveProperty('images',expect.arrayContaining([expect.objectContaining({url:'/site-assets/og'})]));
 expect(result.twitter).toHaveProperty('images',expect.arrayContaining([expect.objectContaining({url:'/site-assets/og'})]));
});

test('SEO page metadata retains shared OGP images and mirrors page-specific social overrides',async()=>{
 const api=load<typeof import('../lib/cms/site-metadata')>('lib/cms/site-metadata.ts',{'./public':{getPageContent:async()=>common({'common.seo_site_name':'公開サイト','common.seo_url':'https://published.example'}, {seo_og:{legacy_path:'/stagepartners-hero.jpg',alt:'既存のメイン画像'}})},'./site-settings':settings});
 const result=await api.publicPageMetadata({title:'個別ページ',description:'個別説明',alternates:{canonical:'/works/example'},openGraph:{type:'article',title:'共有専用タイトル'}});
 expect(result).toMatchObject({openGraph:{title:'共有専用タイトル',description:'個別説明',siteName:'公開サイト',type:'article',url:'/works/example'},twitter:{card:'summary_large_image',title:'共有専用タイトル',description:'個別説明'}});
 expect(result.openGraph).toHaveProperty('images',expect.arrayContaining([expect.objectContaining({url:'/site-assets/og',alt:'既存のメイン画像'})]));
 expect(result.twitter).toHaveProperty('images',expect.arrayContaining([expect.objectContaining({url:'/site-assets/og',alt:'既存のメイン画像'})]));
 const detail=await api.publicPageMetadata({title:'施工実績',openGraph:{images:[{url:'/works/existing/photo.jpg',alt:'施工写真'}]}});
 expect(detail.twitter).toHaveProperty('images',[{url:'/works/existing/photo.jpg',alt:'施工写真'}]);
 expect(new URL(String(detail.metadataBase)).origin).toBe('https://published.example');
});

test('SEO page metadata cannot weaken Preview or published site noindex with page overrides',async()=>{
 for(const [env,indexing] of [[{VERCEL_ENV:'preview'},'index'],[{},'noindex']] as const){
  const api=load<typeof import('../lib/cms/site-metadata')>('lib/cms/site-metadata.ts',{'./public':{getPageContent:async()=>common({'common.seo_indexing':indexing})},'./site-settings':settings},env);
  for(const robots of [{index:true,follow:true,googleBot:{index:true,follow:true}},'index, follow'] as const){
   const result=await api.publicPageMetadata({title:'ページ',robots,metadataBase:new URL('https://untrusted.example')});
   expect(result.robots).toMatchObject({index:false,follow:false});
   if(typeof robots==='object')expect(result.robots).toHaveProperty('googleBot',{index:false,follow:false});
   expect(new URL(String(result.metadataBase)).origin).toBe(settings.SITE_DEFAULTS.url);
  }
 }
});

test('SEO public content never reads drafts or resurrects defaults after a configured query error',async()=>{
 const tables:string[]=[],filters:unknown[][]=[];let configured=true,fail=false,empty=false,connections=0;
 const published=common({'common.seo_title':'公開タイトル'}),draft=common({'common.seo_title':'未公開タイトル'});
 const client={from:(table:string)=>{tables.push(table);return {select:()=>({eq:(...args:unknown[])=>{filters.push(args);return {limit:async()=>({data:empty?[]:[{slug:'common',data:published,draft}],error:fail?{message:'fixture'}:null})};}})};}};
 const api=load<typeof import('../lib/cms/public')>('lib/cms/public.ts',{'react':{cache:(fn:unknown)=>fn},'next/navigation':{notFound:()=>{throw Error('not-found');}},'next/server':{connection:async()=>{connections++;}},'./server':{publicClient:()=>configured?client:null},'@/content/works':{WORKS:[]},'@/content/news':{NEWS:[]},'@/content/page-fields':{PAGE_TEMPLATES},'./model':model});
 expect((await api.getPageContent('common')).fields['common.seo_title']).toBe('公開タイトル');
 expect(tables).toEqual(['cms_published']);expect(filters).toEqual([['module','settings']]);expect(connections).toBe(1);
 fail=true;expect(await api.getPageContent('common').then(()=>'',error=>String(error))).toContain('公開コンテンツ');
 fail=false;empty=true;expect(await api.getPageContent('common').then(()=>'',error=>String(error))).toContain('not-found');
 configured=false;expect((await api.getPageContent('common')).fields['common.seo_title']).toBe(settings.SITE_DEFAULTS.title);
});

function assetRoute(options:{data?:model.PageData;env?:Record<string,string>;mediaError?:boolean;storageError?:boolean;publicError?:boolean}={}){
 const calls:{reads:string[];tables:string[];filters:unknown[][];downloads:string[];cms:number}={reads:[],tables:[],filters:[],downloads:[],cms:0};
 const bytes=sharp({create:{width:160,height:120,channels:4,background:{r:70,g:90,b:120,alpha:1}}}).png().toBuffer();
 const client={from:(table:string)=>{calls.tables.push(table);const chain={select:()=>chain,eq:(...args:unknown[])=>{calls.filters.push(args);return chain;},maybeSingle:async()=>({data:options.mediaError?null:{object_path:'published/media.png'},error:options.mediaError?{message:'fixture'}:null})};return chain;},storage:{from:(bucket:string)=>{expect(bucket).toBe('cms-media');return {download:async(file:string)=>{calls.downloads.push(file);return {error:options.storageError?{message:'fixture'}:null,data:options.storageError?null:{arrayBuffer:async()=>new Uint8Array(await bytes).buffer}};}};}}};
 const api=load<typeof import('../app/site-assets/[slot]/route')>('app/site-assets/[slot]/route.ts',{'node:fs/promises':{readFile:async(file:string)=>{calls.reads.push(file);return bytes;}},'@/lib/cms/public':{getPageContent:async(slug:string)=>{expect(slug).toBe('common');calls.cms++;if(options.publicError)throw Error('fixture');return options.data??common();}},'@/lib/cms/server':{publicClient:()=>client}},options.env);
 return {calls,get:(slot:string)=>api.GET(new Request('https://fixture.example/site-assets/'+slot),{params:Promise.resolve({slot})})};
}

test('SEO asset routes reject unknown and prototype slots before reading CMS',async()=>{
 const route=assetRoute();
 for(const slot of ['unknown','../icon','__proto__','constructor','toString'])expect((await route.get(slot)).status,slot).toBe(404);
 expect(route.calls.cms).toBe(0);expect(route.calls.reads).toEqual([]);expect(route.calls.tables).toEqual([]);
});

test('SEO asset routes normalize existing defaults with private-data-safe response headers',async()=>{
 const route=assetRoute({env:{VERCEL_ENV:'preview'}});
 for(const [slot,width,height,mime,file] of [['icon',512,512,'image/png','icon.png'],['og',1200,630,'image/jpeg','stagepartners-hero.jpg'],['logo',160,120,'image/png','logo-color-footer.png']] as const){
  const response=await route.get(slot);expect(response.status).toBe(200);expect(response.headers.get('Content-Type')).toBe(mime);expect(response.headers.get('Cache-Control')).toBe('no-store');expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');expect(response.headers.get('X-Robots-Tag')).toContain('noindex');
  const metadata=await sharp(Buffer.from(await response.arrayBuffer())).metadata();expect(metadata).toMatchObject({width,height});expect(route.calls.reads.at(-1)).toBe(process.cwd()+'/public/'+file);
 }
 expect(route.calls.tables).toEqual([]);expect(route.calls.downloads).toEqual([]);
});

test('SEO uploaded assets use anonymous RLS and fail closed without falling back to old images',async()=>{
 const id='00000000-0000-4000-8000-000000000001',data=common({}, {seo_icon:{media_id:id,alt:'公開アイコン'}});
 const route=assetRoute({data});expect((await route.get('icon')).status).toBe(200);
 expect(route.calls.tables).toEqual(['cms_media']);expect(route.calls.filters).toEqual([['id',id],['ready',true]]);expect(route.calls.downloads).toEqual(['published/media.png']);expect(route.calls.reads).toEqual([]);
 for(const failure of [{mediaError:true},{storageError:true},{publicError:true}]){const denied=assetRoute({data,...failure}),response=await denied.get('icon');expect(response.status).toBe(503);expect(response.headers.get('Cache-Control')).toBe('no-store');expect(await response.text()).toBe('');expect(denied.calls.reads).toEqual([]);}
});

function draftApi({deny=false,iconSize}:{deny?:boolean;iconSize?:{width:number;height:number}}={}){
 class CmsError extends Error{constructor(public status:number,message:string){super(message);}}
 const calls:{permissions:unknown[][];mutations:{name:string;input:Record<string,unknown>}[]}={permissions:[],mutations:[]};
 let saved:unknown=common({'common.seo_title':'保存前のタイトル'});
 const client={rpc:async(name:string,input:Record<string,unknown>)=>{calls.mutations.push({name,input});if(input.p_action==='save')saved=input.p_data;return {data:{version:2},error:null};},from:(table:string)=>{
  if(table==='cms_documents')return {select:()=>({eq:()=>({order:()=>({limit:async()=>({data:[{id:'00000000-0000-4000-8000-000000000001',module:'settings',slug:'common',draft:saved,version:2}],error:null})})})})};
  if(table==='cms_published')return {select:()=>({eq:async()=>({data:[{document_id:'00000000-0000-4000-8000-000000000001',version:1}],error:null})})};
  expect(table).toBe('cms_media');const chain={select:()=>chain,eq:()=>chain,maybeSingle:async()=>({data:{object_path:'private/icon.png'},error:null})};return chain;
 },storage:{from:()=>({download:async()=>({data:{arrayBuffer:async()=>new Uint8Array(await sharp({create:{width:iconSize?.width??96,height:iconSize?.height??96,channels:4,background:'#ffffff'}}).png().toBuffer()).buffer},error:null})})}};
 const noops:Record<string,unknown>={'@/lib/cms/instagram-oauth':{},'@/lib/cms/instagram-token-store':{},'@/app/api/jobs/instagram/route':{},'@/lib/cms/invitation-readiness':{},'@/lib/cms/invitation-delivery':{},'@/lib/cms/integration-config':{}};
 const api=load<typeof import('../app/api/admin/[...path]/route')>('app/api/admin/[...path]/route.ts',{...noops,'@/lib/cms/site-settings':settings,'@/lib/cms/csrf':{sameOrigin:()=>true},'@/lib/cms/server':{CmsError,databaseError:(error:unknown)=>{if(error)throw Error('database error');},requireIdentity:async()=>({client,identity:{owner:false}}),requirePermission:(_identity:unknown,...permission:unknown[])=>{calls.permissions.push(permission);if(deny)throw new CmsError(403,'No permission');}},'@/lib/cms/model':model,'@/content/page-fields':{PAGE_TEMPLATES},'@/content/page-assets':{PAGE_ASSETS},'@/lib/cms/page-values':{safeHref}});
 return {calls,get:()=>api.GET(new Request('https://fixture.example/api/admin/documents?module=settings'),{params:Promise.resolve({path:['documents']})}),post:(action:string,data?:model.PageData)=>api.POST(new Request('https://fixture.example/api/admin/document',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:'00000000-0000-4000-8000-000000000001',module:'settings',slug:'common',action,data,version:1,requestId:'00000000-0000-4000-8000-000000000002'})}),{params:Promise.resolve({path:['document']})})};
}

test('SEO draft save preserves submitted content and performs no publish side effect',async()=>{
 const route=draftApi(),response=await route.post('save',common({'common.seo_title':'未公開の編集タイトル','common.text_9a3cbf23':'既存の会社名'}));
 expect(response.status).toBe(200);expect(response.headers.get('Cache-Control')).toBe('private, no-store');expect(response.headers.get('X-Robots-Tag')).toContain('noindex');
 expect(route.calls.permissions).toEqual([['settings','edit']]);expect(route.calls.mutations).toHaveLength(1);
 expect(route.calls.mutations[0]).toMatchObject({name:'cms_mutate_content',input:{p_action:'save',p_expected_version:1,p_request_id:'00000000-0000-4000-8000-000000000002',p_data:{fields:{'common.seo_title':'未公開の編集タイトル','common.text_9a3cbf23':'既存の会社名','common.seo_site_name':settings.SITE_DEFAULTS.siteName}}}});
});

test('SEO save refuses invalid values and missing permissions before mutation',async()=>{
 for(const data of [common({'common.seo_title':''}),common({'common.seo_url':'https://malicious.example/path'}),common({'common.seo_indexing':'yes'}),common({'common.unknown':'value'})]){const route=draftApi();expect((await route.post('save',data)).status).toBe(400);expect(route.calls.mutations).toEqual([]);}
 const denied=draftApi({deny:true});expect((await denied.post('save',common())).status).toBe(403);expect(denied.calls.mutations).toEqual([]);
 const publication=draftApi();expect((await publication.post('publish')).status).toBe(200);expect(publication.calls.mutations[0]).toMatchObject({name:'cms_mutate_content',input:{p_action:'publish',p_data:null,p_expected_version:1}});
});

function settingsUi(){
 const preview=load<typeof import('../components/admin/SiteSettingsPreview')>('components/admin/SiteSettingsPreview.tsx',{'@/content/page-assets':{PAGE_ASSETS},'@/lib/cms/model':model,'@/lib/cms/site-settings':settings});
 const fields=load<typeof import('../components/admin/SiteSettingsFields')>('components/admin/SiteSettingsFields.tsx',{'@/content/page-fields':{PAGE_TEMPLATES},'./SiteSettingsPreview':preview});
 return {Preview:preview.default,Fields:fields.default};
}

test('SEO settings UI discloses unsaved defaults and enforces field-specific input limits',()=>{
 const {Fields}=settingsUi();let mutations=0;
 const html=renderToStaticMarkup(createElement(Fields,{data:common(),change:()=>{mutations++;}}));
 expect(html).toContain('未設定のSEO項目には既存サイトの初期値を表示しています');
 expect(html).toContain('下書き保存で保存され');expect(html).toContain('公開するまでは公開版を変更しません');
 expect(html).toContain('入力 → 下書き保存 → プレビュー → 公開');
 expect(html).toMatch(/type="url"[^>]*maxLength="253"[^>]*value="https:\/\/www.stagepartners.co.jp"/i);
 expect(html).toMatch(/maxLength="100"[^>]*value="STAGE PARTNERS"/i);
 expect(html).toMatch(/maxLength="200"[^>]*value="STAGE PARTNERS \| 株式会社ステージパートナーズ"/i);
 expect(html).toMatch(/textarea[^>]*maxLength="500"/i);
 expect(html).toContain('常に検索対象外');expect(mutations).toBe(0);
 const filled=Object.fromEntries(PAGE_TEMPLATES.common.fields.filter(field=>field.id.startsWith('common.seo_')).map(field=>[field.id,field.value]));
 expect(renderToStaticMarkup(createElement(Fields,{data:common(filled),change:()=>{mutations++;}}))).not.toContain('未設定のSEO項目には');
 expect(mutations).toBe(0);
});

test('SEO draft preview uses only supplied draft text and authenticated draft images without publishing',()=>{
 const {Preview}=settingsUi();
 const id='00000000-0000-4000-8000-000000000001';
 const draft=common({'common.seo_site_name':'下書きサイト名','common.seo_title':'下書き <script>alert(1)</script>','common.seo_description':'まだ公開しない説明','common.seo_indexing':'noindex'},{seo_icon:{media_id:id,alt:'下書きアイコン'},seo_og:{media_id:id,alt:'下書きOGP'}});
 const html=renderToStaticMarkup(createElement(Preview,{data:draft}));
 expect(html).toContain('検索結果の表示イメージ（下書き）');expect(html).toContain('SNS共有の表示イメージ（下書き）');
 expect(html).toContain('下書きサイト名');expect(html).toContain('まだ公開しない説明');expect(html).toContain('検索エンジンに掲載しない');
 expect(html).toContain('下書き保存だけでは公開設定は変わりません');
 expect(html).toContain(`/api/media/${id}`);expect(html).not.toContain('/site-assets/');expect(html).not.toContain('<script>');
 expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');expect(html).not.toContain('<form');
});

test('SEO field edits preserve other draft fields and never mutate the provided document',()=>{
 const {Fields}=settingsUi();const data=common({'common.seo_site_name':'既存サイト名','common.seo_title':'保持するタイトル','common.text_9a3cbf23':'保持する会社名'});
 const before=JSON.stringify(data),patches:Partial<model.PageData>[]=[];
 const tree=Fields({data,change:patch=>patches.push(patch)});
 type Element={type:unknown;props:{children?:ReactNode;value?:unknown;onChange?:(event:{target:{value:string}})=>void}};
 function elements(value:unknown):Element[]{
  if(Array.isArray(value))return value.flatMap(elements);
  if(!value||typeof value!=='object'||!('props' in value))return [];
  const element=value as Element;return [element,...elements(element.props.children)];
 }
 const input=elements(tree).find(element=>element.type==='input'&&element.props.value==='既存サイト名');
 expect(input).toBeDefined();input!.props.onChange!({target:{value:'変更したサイト名'}});
 expect(patches).toEqual([{fields:{'common.seo_site_name':'変更したサイト名','common.seo_title':'保持するタイトル','common.text_9a3cbf23':'保持する会社名'}}]);
 expect(JSON.stringify(data)).toBe(before);
});


test('SEO mock draft save and revisit keep saved content separate from the published version',async()=>{
 const route=draftApi(),draft=common({'common.seo_title':'保存して再訪する下書き','common.seo_description':'公開版にまだ反映しない文章'});
 expect((await route.post('save',draft)).status).toBe(200);
 const revisit=await route.get();expect(revisit.status).toBe(200);
 expect(await revisit.json()).toMatchObject({documents:[{version:2,draft:{fields:draft.fields},published:{version:1}}]});
 expect(route.calls.mutations.map(call=>call.input.p_action)).toEqual(['save']);
 expect(route.calls.permissions).toEqual([['settings','edit'],['settings','read']]);
});

test('SEO favicon upload validation requires a square image of at least 96 pixels before saving',async()=>{
 const data=common({}, {seo_icon:{media_id:'00000000-0000-4000-8000-000000000001',alt:'アイコン'}});
 for(const [width,height,allowed] of [[95,95,false],[100,96,false],[96,96,true],[512,512,true]] as const){
  const route=draftApi({iconSize:{width,height}}),response=await route.post('save',data);
  expect(response.status,`${width}x${height}`).toBe(allowed?200:400);
  expect(route.calls.mutations).toHaveLength(allowed?1:0);
  if(!allowed)expect(await response.text()).toContain('96px以上の正方形');
 }
});

test('SEO preview identifies invalid in-progress values instead of disguising them as defaults',()=>{
 const {Preview}=settingsUi();
 const html=renderToStaticMarkup(createElement(Preview,{data:common({'common.seo_title':''})}));
 expect(html).toContain('role="alert"');
 expect(html).not.toContain('検索結果の表示イメージ（下書き）');
 expect(html).not.toContain('STAGE PARTNERS | 株式会社ステージパートナーズ');
});

test('SEO production noindex remains crawlable while Preview and private routes stay excluded',async()=>{
 for(const indexing of ['index','noindex']){
  let reads=0;
  const site=settings.resolveSiteSettings(common({'common.seo_indexing':indexing,'common.seo_url':'https://published.example'}));
  const api=load<typeof import('../app/robots')>('app/robots.ts',{'@/lib/cms/site-metadata':{getSiteSettings:async()=>{reads++;return site;}}});
  const robots=await api.default();
  expect(robots.rules).toEqual({userAgent:'*',allow:'/',disallow:['/admin','/api/','/auth/']});
  expect(reads).toBe(1);
  if(indexing==='index')expect(robots.sitemap).toBe('https://published.example/sitemap.xml');
  else expect(robots).not.toHaveProperty('sitemap');
 }
 const preview=load<typeof import('../app/robots')>('app/robots.ts',{'@/lib/cms/site-metadata':{getSiteSettings:async()=>{throw Error('Preview must not need public settings');}}},{VERCEL_ENV:'preview'});
 expect(await preview.default()).toEqual({rules:{userAgent:'*',disallow:'/'}});
});

test('SEO noindex and Preview omit sitemap entries without reading public content',async()=>{
 for(const [env,indexing] of [[{},'noindex'],[{VERCEL_ENV:'preview'},'index']] as const){
  const site=settings.resolveSiteSettings(common({'common.seo_indexing':indexing}));
  const sitemap=load<typeof import('../app/sitemap')>('app/sitemap.ts',{'@/lib/cms/site-metadata':{getSiteSettings:async()=>site},'@/lib/cms/public':{getPublishedNews:async()=>{throw Error('Do not list noindex news');},getPublishedWorks:async()=>{throw Error('Do not list noindex works');}}},env);
  expect(await sitemap.default()).toEqual([]);
 }
});
