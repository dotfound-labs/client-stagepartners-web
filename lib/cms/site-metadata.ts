import 'server-only';
import type {Metadata} from 'next';
import {getPageContent} from './public';
import {resolveSiteSettings} from './site-settings';
export async function getSiteSettings(){return resolveSiteSettings(await getPageContent('common'));}
export async function siteMetadata():Promise<Metadata>{
 const s=await getSiteSettings();const noindex=process.env.VERCEL_ENV==='preview'||s.indexing==='noindex';
 return {metadataBase:new URL(s.url),title:s.title,description:s.description,robots:{index:!noindex,follow:!noindex},icons:{icon:[{url:'/site-assets/icon',type:'image/png',sizes:'512x512'}],apple:[{url:'/site-assets/icon',sizes:'512x512',type:'image/png'}]},openGraph:{title:s.title,description:s.description,siteName:s.siteName,type:'website',locale:'ja_JP',images:[{url:'/site-assets/og',width:1200,height:630,alt:s.siteName}]},twitter:{card:'summary_large_image',title:s.title,description:s.description,images:['/site-assets/og']}};
}
