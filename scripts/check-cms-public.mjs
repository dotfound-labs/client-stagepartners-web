// Read-only verification. Run with node --env-file=.env.local.
import assert from 'node:assert/strict';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert.equal(url,'https://apkfyxfmsndwqjfetdad.supabase.co');
assert.ok(key?.startsWith('sb_publishable_'));
const headers={apikey:key};
const response=await fetch(`${url}/rest/v1/cms_published?select=module,slug`,{headers});
assert.equal(response.status,200);const rows=await response.json();
console.log('Published counts:',JSON.stringify(Object.fromEntries(['works','news','pages','settings'].map(kind=>[kind,rows.filter(row=>row.module===kind).length]))));
for(const table of ['cms_documents','cms_members','cms_inquiries']){
  const result=await fetch(`${url}/rest/v1/${table}?select=*&limit=1`,{headers});
  assert.ok([401,403].includes(result.status),`Anonymous ${table} must be rejected`);
  console.log(`Anonymous ${table}: rejected (${result.status})`);
}
console.log('Read-only new-project verification complete. No Auth, write or Storage actions.');
