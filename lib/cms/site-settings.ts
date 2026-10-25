import type {PageData} from './model';
export const SITE_DEFAULTS={siteName:'STAGE PARTNERS',title:'STAGE PARTNERS | 株式会社ステージパートナーズ',description:'土地と建物に、次の価値を。STAGE PARTNERSは不動産の仲介・管理から建物のリフォームまで、オーナー様の資産の可能性を一貫して引き出すパートナーです。',url:'https://www.stagepartners.co.jp',indexing:'index'};
export function validSiteOrigin(value:string){try{if(!value.startsWith('https://'))return false;if(!/^https:\/\/(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}\/?$/i.test(value))return false;const u=new URL(value);return u.hostname.split('.').every(label=>label.length<=63)&& u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.pathname==='/'&&!u.search&&!u.hash&&/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(u.hostname);}catch{return false;}}
export function validateSiteFields(fields:Record<string,string>){
 for(const [key,max] of [['common.seo_site_name',100],['common.seo_title',200],['common.seo_description',500]] as const){const value=fields[key];if(value!==undefined&&(!value.trim()||value.length>max))throw Error('サイト名・タイトル・説明の文字数を確認してください。');}
 if(fields['common.seo_url']!==undefined&&!validSiteOrigin(fields['common.seo_url']))throw Error('正式URLはHTTPSのドメインだけを指定してください。');
 if(fields['common.seo_indexing']!==undefined&&!['index','noindex'].includes(fields['common.seo_indexing']))throw Error('検索掲載の設定を確認してください。');
}
export function resolveSiteSettings(data?:PageData){
 const f=data?.fields??{};
 const text=(key:string,fallback:string,max:number)=>f[key]?.trim()&&f[key].length<=max?f[key].trim():fallback;
 return {siteName:text('common.seo_site_name',SITE_DEFAULTS.siteName,100),title:text('common.seo_title',SITE_DEFAULTS.title,200),description:text('common.seo_description',SITE_DEFAULTS.description,500),url:validSiteOrigin(f['common.seo_url']??'')?new URL(f['common.seo_url']).origin:SITE_DEFAULTS.url,indexing:f['common.seo_indexing']==='noindex'?'noindex':'index'};
}
