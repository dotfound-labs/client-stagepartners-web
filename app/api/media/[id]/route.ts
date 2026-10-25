import { publicClient, sessionClient } from "@/lib/cms/server";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex" };
  try {
    const id = z.uuid().parse((await params).id);
    // An anonymous client first ensures visitors never need an admin session.
    for (const client of [publicClient(), await sessionClient()]) {
      if (!client) continue;
      const { data, error } = await client.from("cms_media").select("id,object_path,mime_type").eq("id", id).maybeSingle();
      if (error || !data) continue;
      const image = await client.storage.from("cms-media").download(data.object_path);
      if (!image.error && image.data) return new Response(image.data, { headers: { ...headers, "Content-Type": data.mime_type } });
    }
    return new Response("Not found", { status: 404, headers });
  } catch { return new Response("Not found", { status: 404, headers }); }
}
