import {contactProvider} from "./contact-provider";
// Never activate integrations implicitly in Vercel Preview.
export function integrationEnabled(name:"INSTAGRAM_SYNC_ENABLED"|"CONTACT_INTAKE_ENABLED"){
 return process.env.VERCEL_ENV!=="preview"&&process.env[name]==="true";
}
export function safeInstagramImage(value:string){
 try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password&&!u.port&&/^[a-z0-9.-]+\.(cdninstagram\.com|fbcdn\.net)$/.test(u.hostname);}catch{return false;}
}

export function instagramReady(){return integrationEnabled("INSTAGRAM_SYNC_ENABLED")&&((!process.env.VERCEL&&process.env.INSTAGRAM_TOKEN_STORE==="local-file")||(process.env.INSTAGRAM_TOKEN_STORE==="encrypted-db"&&/^[0-9a-f]{64}$/i.test(process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY??"")))&&Boolean(process.env.INSTAGRAM_API_VERSION)&&Boolean(process.env.CRON_SECRET)&&Boolean(process.env.SUPABASE_SECRET_KEY);}
export function contactReady(){return Boolean(contactProvider());}
