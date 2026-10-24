import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
process.on('uncaughtException',error=>{console.error('FAIL',error.message,error.where??'');process.exit(1);});

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
for (const name of ['owner','editor','publisher','manager','outsider','invitee']) {
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
  await actor('owner');path=(await db.query("select public.cms_mutate_media($1,'reserve','image.jpg','Description','image/jpeg',100) result",[mid])).rows[0].result.object_path;
  await actor('anon');await denied("insert into storage.objects(bucket_id,name) values('cms-media',$1)",[path]);
  await actor('owner');await db.query("insert into storage.objects(bucket_id,name) values('cms-media',$1)",[path]);
  await db.query("select public.cms_mutate_media($1,'finalize')",[mid]);
  await actor('anon');assert.equal((await db.query('select * from storage.objects where name=$1',[path])).rows.length,0);
});
const wid=randomUUID();const work={title:'Test work',category:'store',type:'Renovation',summary:'Summary',cover:{media_id:mid,alt:'Cover'},shots:[{media_id:mid,alt:'After',state:'after'}]};
const workMutation=(action,version,data=work)=>db.query('select public.cms_mutate_content($1,\'works\',\'test-work\',$2,$3,$4,$5)',[wid,action,JSON.stringify(data),version,randomUUID()]);
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
  const objectPath=(await db.query("select public.cms_mutate_media($1,'reserve','unused.jpg','Unused','image/jpeg',100) result",[unused])).rows[0].result.object_path;
  await db.query("insert into storage.objects(bucket_id,name) values('cms-media',$1)",[objectPath]);
  await db.query("select public.cms_mutate_media($1,'finalize')",[unused]);
  await db.query("select public.cms_mutate_media($1,'delete')",[unused]);
  await denied("select public.cms_mutate_media($1,'purge')",[unused],/CMS_REMOVE_STORAGE_FIRST/);
  assert.equal((await db.query('delete from storage.objects where name=$1 returning id',[objectPath])).rows.length,1);
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
console.log(`${passed} database tests passed. LOCAL PGlite; no hosted Supabase calls.`);
await db.close();
