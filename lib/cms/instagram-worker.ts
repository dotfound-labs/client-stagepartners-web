import "server-only";
import { z } from "zod";
// Exact ASCII # and Unicode hashtag boundaries. No NFKC/fullwidth conversion.
export function isNewsCaption(caption:string){return /(?<![\p{L}\p{M}\p{N}_#＃])#お知らせ(?![\p{L}\p{M}\p{N}_])/u.test(caption);}
// Runs only through the explicitly enabled server job; tokens never reach the browser.
const media = z.object({ id: z.string().regex(/^\d+$/), caption: z.string().max(20000).optional(), media_type:z.enum(["IMAGE","VIDEO","CAROUSEL_ALBUM"]), media_url:z.url().optional(), thumbnail_url:z.url().optional(), permalink: z.url().refine(url => /^https:\/\/www\.instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?$/.test(url)), timestamp: z.iso.datetime({ offset: true }) });
export type InstagramDependencies = {
  fetch: typeof fetch;
  importPost: (post: { accountId: string; mediaId: string; permalink: string; caption: string; timestamp: string; imageUrl?:string }) => Promise<void>;
  health: (status: "ok" | "token-expired" | "rate-limited" | "error", retrySeconds: number) => Promise<void>;
};
export async function syncInstagram(config: { enabled: boolean; accountId: string; apiVersion: string; accessToken: string; nextAttemptAt?: string }, dependencies: InstagramDependencies) {
  if (!config.enabled || (config.nextAttemptAt && Date.parse(config.nextAttemptAt) > Date.now())) return { status: "skipped", imported: 0 };
  if (!/^\d+$/.test(config.accountId) || !/^v\d+\.0$/.test(config.apiVersion) || !config.accessToken) throw new Error("INSTAGRAM_CONFIGURATION_INVALID");
  let imported = 0;
  try {
    // Official Instagram Login API; no scraping, embeds or outbound posting.
    const url = new URL(`https://graph.instagram.com/${config.apiVersion}/${config.accountId}/media`);
    url.searchParams.set("fields", "id,caption,permalink,timestamp,media_type,media_url,thumbnail_url"); url.searchParams.set("limit", "50");
    const response = await dependencies.fetch(url, { headers: { Authorization: `Bearer ${config.accessToken}` }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) });
    const body = await response.json();
    if (!response.ok) {
      const code = body?.error?.code;
      const status = code === 190 || response.status === 401 ? "token-expired" : response.status === 429 || [4, 17, 32, 613].includes(code) ? "rate-limited" : "error";
      const retry = Math.max(3600, Math.min(Number(response.headers.get("retry-after")) || 3600, 86400));
      await dependencies.health(status, retry); return { status, imported };
    }
    const posts = z.object({ data: z.array(media).max(50) }).parse(body);
    for (const post of posts.data) {
      if(!isNewsCaption(post.caption??""))continue;
      await dependencies.importPost({ accountId: config.accountId, mediaId: post.id, permalink: post.permalink, caption: post.caption ?? "", timestamp: post.timestamp, imageUrl:post.media_type==="VIDEO"?post.thumbnail_url:post.media_url }); imported++;
    }
    await dependencies.health("ok", 3600); return { status: "ok", imported };
  } catch {
    // Never log API errors: URLs/error bodies can contain credentials.
    await dependencies.health("error", 3600); return { status: "error", imported };
  }
}
