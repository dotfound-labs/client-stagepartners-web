import sharp from "sharp";
import { sameOrigin } from "@/lib/cms/csrf";
import { trustedServerClient } from "@/lib/cms/trusted-server";
import { z } from "zod";
import { CmsError, databaseError, requireIdentity, requirePermission } from "@/lib/cms/server";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    if (!sameOrigin(request)) throw new CmsError(403, "ページを再読み込みしてください。");
    const { client, identity } = await requireIdentity(); requirePermission(identity, "media", "edit");
    const verifier = trustedServerClient();
    if (Number(request.headers.get("content-length")) > 11 * 1024 * 1024) throw new CmsError(413, "画像は10MB以下にしてください。");
    const form = await request.formData();
    const file = form.get("file");
    const id = z.uuid().parse(form.get("id"));
    const alt = z.string().trim().min(1).max(500).parse(form.get("alt"));
    if (!(file instanceof File) || file.size > 10 * 1024 * 1024 || file.size === 0) throw new CmsError(400, "10MB以下の画像を選択してください。");
    const input = Buffer.from(await file.arrayBuffer());
    const pipeline = sharp(input, { limitInputPixels: 40000000, animated: false });
    const metadata = await pipeline.metadata();
    if (!metadata.format || !["jpeg", "png", "webp", "avif", "heif"].includes(metadata.format)) throw new CmsError(400, "JPEG・PNG・WebP・AVIF画像を選択してください。");
    const image = await pipeline.rotate().resize({ width: 3200, height: 3200, fit: "inside", withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
    if (image.length > 10 * 1024 * 1024) throw new CmsError(413, "画像が大きすぎます。");
    const reservation = await client.rpc("cms_mutate_media", { p_id: id, p_action: "reserve", p_name: file.name.slice(0, 200), p_alt: alt, p_mime: "image/webp", p_size: image.length }); databaseError(reservation.error);
    const existing = await client.from("cms_media").select("ready").eq("id", id).single(); databaseError(existing.error);
    if (!existing.data) throw new CmsError(404, "画像が見つかりません。");
    if (!existing.data.ready) {
      // Always replace any untrusted direct-upload bytes before trusted finalization.
      const upload = await verifier.storage.from("cms-media").upload(reservation.data.object_path, image, { contentType: "image/webp", upsert: true, cacheControl: "0" });
      databaseError(upload.error);
      const current = await requireIdentity(); requirePermission(current.identity,"media","edit");
      if(current.identity.id !== identity.id) throw new CmsError(403,"セッションを確認してください。");
      const finalized = await verifier.rpc("cms_finalize_verified_media", { p_id: id, p_size: image.length, p_actor: identity.id }); databaseError(finalized.error);
    }
    return Response.json({ id, alt, url: `/api/media/${id}` }, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof CmsError ? error.message : "画像を保存できませんでした。形式・容量・接続を確認してください。" }, { status: error instanceof CmsError ? error.status : 400, headers });
  }
}
