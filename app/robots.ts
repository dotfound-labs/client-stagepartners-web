import type {MetadataRoute} from 'next';
import {getSiteSettings} from '@/lib/cms/site-metadata';
export const dynamic='force-dynamic';
export default async function robots():Promise<MetadataRoute.Robots>{const s=await getSiteSettings();if(process.env.VERCEL_ENV==='preview'||s.indexing==='noindex')return {rules:{userAgent:'*',disallow:'/'}};return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/api/','/auth/']},sitemap:s.url+'/sitemap.xml'};}
