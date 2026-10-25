// This expected project is fixed deliberately: never silently reuse another project.
export const EXPECTED_PROJECT = "apkfyxfmsndwqjfetdad";
export function cmsConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url && !key) return null;
  if (!url || !key || url !== `https://${EXPECTED_PROJECT}.supabase.co` || !key.startsWith("sb_publishable_")) {
    throw new Error("CMS_CONFIGURATION_INVALID");
  }
  return { url, key };
}
