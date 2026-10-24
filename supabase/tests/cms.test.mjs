import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
process.on('uncaughtException',error=>{console.error('FAIL',error.message,error.where??'',error.position??'',error.query?.slice(Math.max(0,Number(error.position)-100),Number(error.position)+100)??'');process.exit(1);});

// Real PostgreSQL SQL/RLS execution in WASM; Auth/Storage schemas are local
// fixtures, not the live Supabase services. All addresses are test-only.
const db = new PGlite();
await db.exec(`
  create role anon; create role authenticated; create role service_role bypassrls;
  create schema auth; create schema storage;
  create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
  create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id));
`);
await db.exec(`
  create function auth.uid() returns uuid language sql stable as
    $$ select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid $$;
  create function auth.jwt() returns jsonb language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb) $$;
  grant usage on schema auth,storage,public to anon,authenticated,service_role;
  grant execute on function auth.uid(),auth.jwt() to anon,authenticated,service_role;
  create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text,metadata jsonb,unique(bucket_id,name));
  alter table storage.objects enable row level security;
  grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;
`);
for (const file of (await readdir(new URL('../migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort()) {
  await db.exec(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8'));
  console.log('APPLIED',file);
}
const users = {};
for (const name of ['owner','editor','publisher','manager','outsider','invitee','pageeditor']) {
  users[name] = { id:randomUUID(),sid:randomUUID(),email:name+'@example.test' };
  await db.query('insert into auth.users values($1,$2,now())',[users[name].id,users[name].email]);
  await db.query('insert into auth.sessions values($1,$2)',[users[name].sid,users[name].id]);
  if(!['outsider','invitee'].includes(name)) await db.query('insert into public.cms_members(user_id,email,is_owner) values($1,$2,$3)',[users[name].id,users[name].email,name==='owner']);
}
for(const [name,module,cap] of [['editor','news','read'],['editor','news','edit'],['publisher','news','read'],['publisher','news','publish'],['manager','users','manage'],['manager','news','read'],['manager','news','edit']])
  await db.query('insert into public.cms_permissions values($1,$2,$3)',[users[name].id,module,cap]);
const actor = async (name) => {
  await db.exec('reset role');
  const u = users[name];
  await db.query("select set_config('request.jwt.claims',$1,false)",[u?JSON.stringify({sub:u.id,session_id:u.sid,user_metadata:{is_owner:true}}):'{}']);
  await db.exec('set role '+(name==='anon'?'anon':name==='service'?'service_role':'authenticated'));
};
let passed=0;
async function test(label,fn){await fn();passed++;console.log('PASS',label);}
async function denied(sql,args=[],match=/CMS_|permission denied|row-level security/){await assert.rejects(db.query(sql,args),match);}
const verifiedPath = id => `verified/${id}/${randomUUID()}.webp`;
const digestA = 'a'.repeat(64), digestB = 'b'.repeat(64);
async function finalizeFixture(id, actorId) {
  const path = verifiedPath(id);
  await db.query("insert into storage.objects(bucket_id,name,metadata) values('cms-media',$1,jsonb_build_object('mimetype','image/webp','size',100))",[path]);
  await db.query('select public.cms_finalize_verified_media($1,100,$2,$3,$4)',[id,actorId,path,digestA]);
  return path;
}
await test('every seeded page passes the final typed validator',async()=>{
  await db.exec('reset role');
  const rows=(await db.query("select module,slug,draft from public.cms_documents where module in ('pages','settings')")).rows;
  assert.ok(rows.length >= 8);
  for(const row of rows) await db.query('select cms_private.validate_content($1,$2,$3)',[row.module,row.slug,JSON.stringify(row.draft)]);
});
const news = {title:'Test news',category:'info',date:'2026-01-01',excerpt:'Excerpt',body:['Paragraph']};
const id = randomUUID();
const mutate = (action,version,data=news,request=randomUUID(),revision=null,module='news',slug='test-news') =>
  db.query('select public.cms_mutate_content($1,$2,$3,$4,$5,$6,$7,$8) result',[id,module,slug,action,JSON.stringify(data),version,request,revision]);
await test('anon cannot read drafts or call content mutation',async()=>{
  await actor('anon');await denied('select * from public.cms_documents');await assert.rejects(mutate('save',0));
});
await test('user_metadata owner spoofing gives outsider no privileges',async()=>{
  await actor('outsider');assert.equal((await db.query('select * from public.cms_documents')).rows.length,0);
  await assert.rejects(mutate('save',0),/CMS_FORBIDDEN/);
});
await test('editor saves draft; repeated identical command is idempotent',async()=>{
  await actor('editor');const request=randomUUID();const first=await mutate('save',0,news,request);
  const retry=await mutate('save',0,news,request);assert.deepEqual(first.rows,retry.rows);
  await assert.rejects(mutate('save',0,{...news,title:'changed'},request),/CMS_REQUEST_REUSED/);
});
await test('draft absent from public projection and editor cannot publish',async()=>{
  await actor('anon');assert.equal((await db.query('select * from public.cms_published where document_id=$1',[id])).rows.length,0);
  await actor('editor');await assert.rejects(mutate('publish',1),/CMS_FORBIDDEN/);
});
await test('module permission and direct SQL bypasses are rejected',async()=>{
  await actor('editor');await assert.rejects(mutate('save',0,news,randomUUID(),null,'works'),/CMS_FORBIDDEN/);
  await denied("update public.cms_members set is_owner=true where user_id=$1",[users.editor.id]);
  await denied("insert into public.cms_published(document_id,module,slug,data,version,source) values($1,'news','bad','{}',1,'manual')",[id]);
});
await test('publisher can publish but cannot edit; public receives only snapshot',async()=>{
  await actor('publisher');await assert.rejects(mutate('save',1),/CMS_FORBIDDEN/);await mutate('publish',1);
  await actor('editor');await mutate('save',2,{...news,title:'Unpublished change'});
  await actor('anon');assert.equal((await db.query('select data from public.cms_published where document_id=$1',[id])).rows[0].data.title,'Test news');
});
await test('stale edit conflicts; restore creates a new draft without publishing',async()=>{
  await actor('editor');await assert.rejects(mutate('save',2),/CMS_VERSION_CONFLICT/);
  const rev=(await db.query('select id from public.cms_revisions where document_id=$1 and version=1',[id])).rows[0].id;
  await mutate('restore',3,news,randomUUID(),rev);
  assert.equal((await db.query('select version from public.cms_documents where id=$1',[id])).rows[0].version,4);
});
await test('unpublish removes public snapshot',async()=>{
  await actor('publisher');await mutate('unpublish',4);await actor('anon');
  assert.equal((await db.query('select * from public.cms_published where document_id=$1',[id])).rows.length,0);
});
await test('self privilege changes and last owner self-disable rejected',async()=>{
  await actor('owner');await denied('select public.cms_set_member($1,false,false,\'[]\')',[users.owner.id],/CMS_SELF_PERMISSION_CHANGE/);
  await actor('manager');await denied('select public.cms_set_member($1,true,true,\'[]\')',[users.manager.id],/CMS_SELF_PERMISSION_CHANGE/);
  await denied('select public.cms_set_member($1,false,false,\'[]\')',[users.owner.id],/CMS_OWNER_REQUIRED/);
});
await test('user manager cannot grant owner or permissions they lack',async()=>{
  await actor('manager');await denied('select public.cms_set_member($1,true,true,\'[]\')',[users.editor.id],/CMS_OWNER_REQUIRED/);
  await denied('select public.cms_set_member($1,false,true,$2)',[users.editor.id,JSON.stringify([{module:'news',capability:'publish'}])],/CMS_CANNOT_DELEGATE_PERMISSION/);
});
await test('membership revocation immediately blocks an existing JWT',async()=>{
  await actor('owner');await db.query('select public.cms_set_member($1,false,false,\'[]\')',[users.editor.id]);
  await actor('editor');await assert.rejects(mutate('save',5),/CMS_FORBIDDEN/);
});
await test('invitation matches verified email and grants only stored permissions',async()=>{
  await actor('manager');const permissions=JSON.stringify([{module:'news',capability:'edit'}]);
  const a=await db.query('select public.cms_reserve_invitation($1,false,$2) id',[users.invitee.email,permissions]);
  const b=await db.query('select public.cms_reserve_invitation($1,false,$2) id',[users.invitee.email,permissions]);assert.deepEqual(a.rows,b.rows);
  await actor('outsider');assert.equal((await db.query('select public.cms_accept_invitation() ok')).rows[0].ok,false);
  await actor('invitee');assert.equal((await db.query('select public.cms_accept_invitation() ok')).rows[0].ok,true);
  assert.equal((await db.query("select cms_private.allowed('news','publish') ok")).rows[0].ok,false);
});
await test('revoked Auth session cannot use remaining membership',async()=>{
  await db.exec('reset role');await db.query('delete from auth.sessions where id=$1',[users.invitee.sid]);
  await actor('invitee');assert.equal((await db.query("select cms_private.allowed('news','edit') ok")).rows[0].ok,false);
});
const mid=randomUUID();let path;
await test('media reserve, authorized upload, finalize, private-by-default',async()=>{
  await actor('owner');path=(await db.query("select public.cms_mutate_media($1,'reserve','image.jpg','Description','image/webp',100) result",[mid])).rows[0].result.object_path;
  await actor('anon');await denied("insert into storage.objects(bucket_id,name,metadata) values('cms-media',$1,jsonb_build_object('mimetype','image/webp','size',100))",[path]);
  await actor('owner');await db.query("insert into storage.objects(bucket_id,name,metadata) values('cms-media',$1,jsonb_build_object('mimetype','image/webp','size',100))",[path]);
  await denied("select public.cms_mutate_media($1,'finalize')",[mid],/CMS_TRUSTED_VERIFIER_REQUIRED/); await denied("select public.cms_finalize_verified_media($1,100,$2,$3,$4)",[mid,users.owner.id,verifiedPath(mid),digestA]); await actor('service'); path=await finalizeFixture(mid,users.owner.id);
  await actor('anon');assert.equal((await db.query('select * from storage.objects where name=$1',[path])).rows.length,0);
});
const wid=randomUUID();const work={title:'Test work',category:'store',type:'Renovation',summary:'Summary',cover:{media_id:mid,alt:'Cover'},shots:[{media_id:mid,alt:'After',state:'after'}]};
const workMutation=(action,version,data=work)=>db.query('select public.cms_mutate_content($1,\'works\',\'test-work\',$2,$3,$4,$5)',[wid,action,JSON.stringify(data),version,randomUUID()]);
await test('private media UUID cannot grant its own access through a new reference',async()=>{
  await db.exec('reset role');
  await db.query("insert into public.cms_permissions values($1,'works','read'),($1,'works','edit')",[users.publisher.id]);
  await actor('publisher');
  await assert.rejects(workMutation('save',0),/CMS_MEDIA_FORBIDDEN/);
  assert.equal((await db.query('select id from public.cms_documents where id=$1',[wid])).rows.length,0);
  assert.equal((await db.query('select id from storage.objects where name=$1',[path])).rows.length,0);
});
await test('extra JSON keys cannot smuggle authorization-bearing media references',async()=>{
  await actor('manager');
  await assert.rejects(mutate('save',5,{...news,hidden:{media_id:mid}}),/CMS_UNKNOWN_FIELD/);
  await actor('owner');
  await assert.rejects(workMutation('save',0,{...work,cover:{...work.cover,hidden:{media_id:mid}}}),/CMS_INVALID_IMAGE/);
});
await test('published media becomes visible; image overwrites are impossible',async()=>{
  await actor('owner');await workMutation('save',0);await workMutation('publish',1);
  await actor('anon');assert.equal((await db.query('select * from storage.objects where name=$1',[path])).rows.length,1);
  await actor('owner');assert.equal((await db.query("update storage.objects set metadata='{}' where name=$1 returning id",[path])).rows.length,0);
});
await test('media referenced by draft/publication/history cannot be deleted',async()=>{
  await actor('owner');await denied("select public.cms_mutate_media($1,'delete')",[mid],/CMS_MEDIA_IN_USE/);
  await workMutation('unpublish',2);await actor('anon');assert.equal((await db.query('select * from storage.objects where name=$1',[path])).rows.length,0);
  await actor('owner');await denied("select public.cms_mutate_media($1,'delete')",[mid],/CMS_MEDIA_IN_USE/);
});
await test('RPC rejects NULL identity and cross-work legacy paths',async()=>{
  await actor('owner');
  const bad={...work,cover:{legacy_path:'/works/other-work/after-01.jpg',alt:'Wrong work'}};
  await denied('select public.cms_mutate_content($1,\'works\',null,\'save\',$2,3,$3)',[wid,JSON.stringify(bad),randomUUID()],/CMS_INVALID_IDENTITY/);
  await denied('select public.cms_mutate_content($1,null,\'test-work\',\'save\',$2,3,$3)',[wid,JSON.stringify(bad),randomUUID()],/CMS_INVALID_IDENTITY/);
  await assert.rejects(workMutation('save',3,bad),/CMS_INVALID_IMAGE/);
});
await test('RPC photo fields require JSON strings and known keys',async()=>{
  await actor('owner');
  for(const patch of [{alt:42},{media_id:42},{media_id:null},{alt:{value:'Caption'}},{media_id:undefined,legacy_path:42}]){
    await assert.rejects(workMutation('save',3,{...work,cover:{...work.cover,...patch}}),/CMS_INVALID_IMAGE/);
  }
});
await test('public and regular admins cannot invoke Instagram import',async()=>{
  const q="select public.cms_import_instagram('123','456','https://www.instagram.com/p/test/','Caption',now())";
  await actor('anon');await denied(q);await actor('owner');await denied(q);
  await actor('service');await denied(q,[],/CMS_INSTAGRAM_DISABLED/);
});
await test('explicitly enabled Instagram import deduplicates and respects manual hiding',async()=>{
  await actor('owner');await db.query("select public.cms_configure_instagram('123','test_account',true,true)");
  await actor('service');const q="select public.cms_import_instagram('123','456','https://www.instagram.com/p/test/','Caption',now()) result";
  const first=(await db.query(q)).rows[0].result;assert.equal(first.created,true);
  assert.equal((await db.query(q)).rows[0].result.created,false);
  await actor('owner');await db.query("select public.cms_mutate_content($1,'news','instagram-456','unpublish',null,1,$2)",[first.id,randomUUID()]);
  await actor('service');await db.query(q);await actor('anon');
  assert.equal((await db.query('select * from public.cms_published where document_id=$1',[first.id])).rows.length,0);
});
await test('inquiry data and audit logs are unavailable to anonymous visitors',async()=>{
  await actor('anon');await denied('select * from public.cms_inquiries');await denied('select * from public.cms_audit');
  await denied("insert into public.cms_inquiries(name,email,subject,message) values('Test','test@example.test','Test','Test') returning *");
  await actor('publisher');assert.equal((await db.query('select * from public.cms_inquiries')).rows.length,0);
});
await test('unused media supports safe two-phase deletion through Storage RLS',async()=>{
  await actor('owner');const unused=randomUUID();
  const objectPath=(await db.query("select public.cms_mutate_media($1,'reserve','unused.jpg','Unused','image/webp',100) result",[unused])).rows[0].result.object_path;
  await db.query("insert into storage.objects(bucket_id,name,metadata) values('cms-media',$1,jsonb_build_object('mimetype','image/webp','size',100))",[objectPath]);
  await actor('service'); const finalObjectPath=await finalizeFixture(unused,users.owner.id); await actor('owner');
  await db.query("select public.cms_mutate_media($1,'delete')",[unused]);
  await denied("select public.cms_mutate_media($1,'purge')",[unused],/CMS_REMOVE_STORAGE_FIRST/);
  assert.equal((await db.query('delete from storage.objects where name=$1 returning id',[finalObjectPath])).rows.length,1);
  await db.query("select public.cms_mutate_media($1,'purge')",[unused]);
});
await test('Instagram disabled state and invalid attribution reject imports',async()=>{
  await actor('service');await denied("select public.cms_import_instagram('123','789','https://evil.example/post','Caption',now())",[],/check constraint/);
  await actor('owner');await db.query("select public.cms_configure_instagram('123','test_account',false,true)");
  await actor('service');await denied("select public.cms_import_instagram('123','789','https://www.instagram.com/p/test/','Caption',now())",[],/CMS_INSTAGRAM_DISABLED/);
});
await test('deleting an Auth owner cannot bypass membership protection',async()=>{
  await db.exec('reset role');await assert.rejects(db.query('delete from auth.users where id=$1',[users.owner.id]),/foreign key/);
});
await test('all CMS exposed tables have RLS; privileged functions have fixed search paths',async()=>{
  await db.exec('reset role');
  assert.equal((await db.query("select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and relname like 'cms_%' and not relrowsecurity")).rows.length,0);
  assert.equal((await db.query("select proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='cms_private' and prosecdef and proconfig is null")).rows.length,0);
});
await test('published site policy uses corrected domain and stable editor field',async()=>{
  await actor('anon');
  const {rows}=await db.query("select data->'fields'->>'site-policy.text_c02d9817' lead from public.cms_published where module='pages' and slug='site-policy'");
  const source=await readFile(new URL('../../app/site-policy/page.tsx',import.meta.url),'utf8');
  assert.equal(rows[0].lead,source.match(/lead="([^"]+)"/)[1]);
  assert.match(rows[0].lead,/www\.stagepartners\.co\.jp/);
  assert.doesNotMatch(rows[0].lead,/stagepartners-hp1/);
  assert.match(source,/leadFieldId="text_c02d9817"/);
  assert.match(source,/canonical: "\/site-policy"/);
});
await test('typed page RPC rejects wrong scope, unsafe links and arbitrary image slots',async()=>{
  await actor('owner');
  const row=(await db.query("select * from public.cms_documents where module='pages' and slug='home'")).rows[0];
  const call=data=>db.query('select public.cms_mutate_content($1,$2,$3,$4,$5,$6,$7)',[row.id,'pages','home','save',JSON.stringify(data),row.version,randomUUID()]);
  await assert.rejects(call({...row.draft,fields:{'common.text_123':'Wrong scope'}}),/CMS_UNKNOWN_FIELD/);
  const link=Object.keys(row.draft.fields).find(key=>key.includes('.link_'));
  assert.ok(link);await assert.rejects(call({...row.draft,fields:{...row.draft.fields,[link]:'javascript:alert(1)'}}),/CMS_INVALID_LINK/);
  await assert.rejects(call({...row.draft,images:{arbitrary:{media_id:mid,alt:'Photo'}}}),/CMS_INVALID_IMAGE/);
  await assert.rejects(call({...row.draft,images:{image_text_ab7d0563:{legacy_path:'/company-hero.jpg',alt:'Photo'}}}),/CMS_INVALID_IMAGE/);
});
await test('unverified direct uploads cannot become ready or published through RPC',async()=>{
  await actor('owner');const unverified=randomUUID();
  const path=(await db.query("select public.cms_mutate_media($1,'reserve','unverified.webp','Unverified','image/webp',100) result",[unverified])).rows[0].result.object_path;
  await db.query("insert into storage.objects(bucket_id,name,metadata) values('cms-media',$1,jsonb_build_object('mimetype','image/webp','size',100))",[path]);
  await denied("select public.cms_mutate_media($1,'finalize')",[unverified],/CMS_TRUSTED_VERIFIER_REQUIRED/);
  await denied('select public.cms_finalize_verified_media($1,100,$2,$3,$4)',[unverified,users.owner.id,verifiedPath(unverified),digestA]);
  const row=(await db.query("select * from public.cms_documents where module='pages' and slug='home'")).rows[0];
  await assert.rejects(db.query('select public.cms_mutate_content($1,$2,$3,$4,$5,$6,$7)',[row.id,'pages','home','save',JSON.stringify({...row.draft,images:{image_text_ab7d0563:{media_id:unverified,alt:'Unverified'}}}),row.version,randomUUID()]),/CMS_MEDIA_NOT_READY/);
});
await test('page image slots cannot self-authorize another private media UUID',async()=>{
  await actor('owner');const privateId=randomUUID();
  const path=(await db.query("select public.cms_mutate_media($1,'reserve','private.webp','Private','image/webp',100) result",[privateId])).rows[0].result.object_path;
  await actor('service');await db.query("insert into storage.objects(bucket_id,name,metadata) values('cms-media',$1,jsonb_build_object('mimetype','image/webp','size',100))",[path]);
  await finalizeFixture(privateId,users.owner.id);
  await db.exec('reset role');await db.query("insert into public.cms_permissions values($1,'pages','read'),($1,'pages','edit')",[users.pageeditor.id]);
  await actor('pageeditor');const row=(await db.query("select * from public.cms_documents where module='pages' and slug='home'")).rows[0];
  await assert.rejects(db.query('select public.cms_mutate_content($1,$2,$3,$4,$5,$6,$7)',[row.id,'pages','home','save',JSON.stringify({...row.draft,images:{image_text_ab7d0563:{media_id:privateId,alt:'Private'}}}),row.version,randomUUID()]),/CMS_MEDIA_FORBIDDEN/);
  assert.equal((await db.query('select * from storage.objects where name=$1',[path])).rows.length,0);
});
await test('interleaved upload attempts cannot replace ready or published bytes',async()=>{
  await actor('owner');const id=randomUUID();
  await db.query("select public.cms_mutate_media($1,'reserve','race.webp','Race','image/webp',100)",[id]);
  const a=verifiedPath(id), b=verifiedPath(id), retry=verifiedPath(id);
  await denied("insert into storage.objects(bucket_id,name) values('cms-media',$1)",[a]);
  await actor('service');
  const upload=path=>db.query("insert into storage.objects(bucket_id,name,metadata) values('cms-media',$1,jsonb_build_object('mimetype','image/webp','size',100))",[path]);
  const finish=(path,digest)=>db.query('select public.cms_finalize_verified_media($1,100,$2,$3,$4) path',[id,users.owner.id,path,digest]);
  await upload(a);await finish(a,digestA);
  await actor('owner');const docId=randomUUID();
  const data={...work,cover:{media_id:id,alt:'Race'},shots:[{media_id:id,alt:'Race',state:'after'}]};
  await db.query("select public.cms_mutate_content($1,'works','race-work','save',$2,0,$3)",[docId,JSON.stringify(data),randomUUID()]);
  await db.query("select public.cms_mutate_content($1,'works','race-work','publish',$2,1,$3)",[docId,JSON.stringify(data),randomUUID()]);
  await actor('service');
  // B resumes after A is ready: equal size/MIME, different sanitized bytes.
  await upload(b);await assert.rejects(finish(b,digestB),/CMS_MEDIA_ALREADY_VERIFIED/);
  await assert.rejects(upload(a),/duplicate key/);
  await upload(retry);assert.equal((await finish(retry,digestA)).rows[0].path,a);
  await db.exec('reset role');
  const winner=(await db.query('select object_path,verified_sha256 from public.cms_media where id=$1',[id])).rows[0];
  assert.equal(winner.object_path,a);assert.equal(winner.verified_sha256,digestA);
});
await test('inquiry intake is service-only, idempotent and rate limited',async()=>{
 const id=randomUUID(),args=[id,'Visitor','visitor@example.test','','Question','Message'];
 const sql='select public.cms_receive_inquiry($1,$2,$3,$4,$5,$6) created';
 await actor('anon');await denied(sql,args);
 await actor('owner');await denied(sql,args);
 await actor('service');assert.equal((await db.query(sql,args)).rows[0].created,true);
 assert.equal((await db.query(sql,args)).rows[0].created,false);
 await assert.rejects(db.query(sql,[id,...args.slice(1,5),'Changed']),/CMS_INQUIRY_CONFLICT/);
 for(let i=0;i<2;i++)await db.query(sql,[randomUUID(),...args.slice(1)]);
 await assert.rejects(db.query(sql,[randomUUID(),...args.slice(1)]),/CMS_INQUIRY_RATE_LIMIT/);
 await actor('anon');await denied('select * from public.cms_inquiries');
});
await test('Instagram image URLs are private and disappear from published lookup when hidden',async()=>{
 await actor('owner');await db.query("select public.cms_configure_instagram('123','official',true,true)");
 await actor('service');
 const imported=(await db.query("select public.cms_import_instagram('123','999','https://www.instagram.com/p/TEST999/','Image post',now()) result")).rows[0].result;
 await db.query("insert into public.cms_instagram_images(document_id,image_url) values($1,'https://scontent.cdninstagram.com/image.jpg')",[imported.id]);
 assert.ok((await db.query("select public.cms_instagram_image('instagram-999') url")).rows[0].url);
 await actor('anon');await denied("select public.cms_instagram_image('instagram-999')");await denied('select * from public.cms_instagram_images');
 await actor('owner');await db.query("select public.cms_mutate_content($1,'news','instagram-999','unpublish',null,1,$2)",[imported.id,randomUUID()]);
 await actor('service');assert.equal((await db.query("select public.cms_instagram_image('instagram-999') url")).rows[0].url,null);
 await db.exec('reset role');await db.exec("update public.cms_instagram_config set next_attempt_at=null");await actor('service');
 assert.equal((await db.query('select public.cms_claim_instagram_sync() claimed')).rows[0].claimed,true);
 assert.equal((await db.query('select public.cms_claim_instagram_sync() claimed')).rows[0].claimed,false);
});
await test('invitation delivery claim is service-only and never retries an uncertain send',async()=>{
 await actor('owner');const id=(await db.query("select public.cms_reserve_invitation('delivery@example.test',false,'[]') id")).rows[0].id;
 await denied('select public.cms_claim_invitation_delivery($1,$2)',[id,users.owner.id]);
 await actor('service');await denied('select public.cms_claim_invitation_delivery($1,$2)',[id,users.outsider.id]);
 assert.equal((await db.query('select public.cms_claim_invitation_delivery($1,$2) email',[id,users.owner.id])).rows[0].email,'delivery@example.test');
 assert.equal((await db.query('select public.cms_claim_invitation_delivery($1,$2) email',[id,users.owner.id])).rows[0].email,null);
});
console.log(`${passed} database tests passed. LOCAL PGlite; no hosted Supabase calls.`);
await db.close();
