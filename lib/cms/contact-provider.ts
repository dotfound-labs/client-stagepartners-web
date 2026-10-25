// Configuration is evaluated on the server. A standard Web3Forms access key is
// intentionally a public browser form identifier, not a server Secret API key.
export function contactProvider(env:Record<string,string|undefined>=process.env){
 if(env.VERCEL_ENV==="preview"||env.CONTACT_INTAKE_ENABLED!=="true"||!env.SUPABASE_SECRET_KEY?.startsWith("sb_secret_"))return null;
 const mode=env.WEB3FORMS_MODE??"server";
 if(mode==="browser"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(env.WEB3FORMS_ACCESS_KEY??""))return {mode:"browser" as const,accessKey:env.WEB3FORMS_ACCESS_KEY!};
 if(mode==="server"&&env.WEB3FORMS_SECRET_KEY?.startsWith("w3f_live_")&&env.WEB3FORMS_FORM_ID)return {mode:"server" as const,secret:env.WEB3FORMS_SECRET_KEY,formId:env.WEB3FORMS_FORM_ID};
 return null;
}
