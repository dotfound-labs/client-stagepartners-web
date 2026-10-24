import ts from 'typescript';
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
const target=process.argv[2];
if (!/^supabase\/migrations\/\d+_cms_page_content\.sql$/.test(target??'')) throw new Error('Pass the CLI-created page migration.');
const exports={};
vm.runInNewContext(ts.transpileModule(readFileSync('content/page-fields.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});
const q=s=>"'"+s.replaceAll("'","''")+"'";
const sql=['-- Existing public page text; no accounts, secrets or external side effects.','begin;'];
for (const [slug,page] of Object.entries(exports.PAGE_TEMPLATES)) {
  const contentModule=slug==='common'?'settings':'pages';
  const data=q(JSON.stringify({title:page.title,fields:Object.fromEntries(page.fields.map(f=>[f.id,f.value]))}))+'::jsonb';
  const identity=`module=${q(contentModule)} and slug=${q(slug)}`;
  sql.push(`select cms_private.validate_content(${q(contentModule)},${q(slug)},${data});`, `insert into public.cms_documents(module,slug,draft) values(${q(contentModule)},${q(slug)},${data});`, `insert into public.cms_published(document_id,module,slug,data,version,source) select id,module,slug,draft,version,source from public.cms_documents where ${identity};`, `insert into public.cms_revisions(document_id,version,action,data) select id,version,'baseline.import',draft from public.cms_documents where ${identity};`);
}
sql.push('commit;','');writeFileSync(target,sql.join('\n'));
