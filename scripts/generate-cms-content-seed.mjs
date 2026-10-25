// Offline, deterministic migration payload generation from committed public data.
// Run only against the empty migration created with `supabase migration new`.
import ts from 'typescript';
import vm from 'node:vm';
import { readFileSync,writeFileSync } from 'node:fs';
const target=process.argv[2];
if(!target || !/^supabase\/migrations\/\d+_cms_existing_content\.sql$/.test(target)) throw new Error('Pass the CLI-created content migration path.');
function load(path){
  const exports={};
  vm.runInNewContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});
  return exports;
}
const {WORKS}=load('content/works.ts');const {NEWS}=load('content/news.ts');
if(WORKS.length!==30 || NEWS.length!==6) throw new Error(`Review content count: ${WORKS.length} works / ${NEWS.length} news.`);
const q=value=>"'"+String(value).replaceAll("'","''")+"'";
const featured=new Set(['zentoku','issekisancho','deltaring-gym']);
const entries=[...WORKS.map(work=>{
  const image=(file,state)=>({legacy_path:`/works/${work.slug}/${file}`,alt:`${work.title} ${state==='before'?'施工前':'施工後'}`,...(state?{state}:{})});
  return {module:'works',slug:work.slug,data:{...work,cover:image(work.cover),shots:work.shots.map(s=>image(s.file,s.state)),featured:featured.has(work.slug)}};
}),...NEWS.map(post=>({module:'news',slug:post.slug,data:post}))];
const sql=['-- Existing PUBLIC content only. No users, credentials, or private data.','-- Source content files preserved; migration imports 30 works + 6 news.','begin;'];
for(const entry of entries){
  const data=q(JSON.stringify(entry.data))+'::jsonb';
  const identity=`module=${q(entry.module)} and slug=${q(entry.slug)}`;
  sql.push(`select cms_private.validate_content(${q(entry.module)},${q(entry.slug)},${data});`);
  sql.push(`insert into public.cms_documents(module,slug,draft) values(${q(entry.module)},${q(entry.slug)},${data});`);
  sql.push(`insert into public.cms_published(document_id,module,slug,data,version,source) select id,module,slug,draft,version,source from public.cms_documents where ${identity};`);
  sql.push(`insert into public.cms_revisions(document_id,version,action,data) select id,version,'baseline.import',draft from public.cms_documents where ${identity};`);
}
sql.push("insert into public.cms_audit(action,target_id,details) values('baseline.import','public-content','{\"works\":30,\"news\":6}'::jsonb);",'commit;','');
writeFileSync(target,sql.join('\n'),'utf8');
console.log(`Generated ${entries.length} public baseline records in ${target}`);
