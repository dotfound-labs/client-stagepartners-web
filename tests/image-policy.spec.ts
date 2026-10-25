import { test, expect } from "@playwright/test";
import type { IncomingMessage } from "node:http";
import { ImageOptimizerCache } from "next/dist/server/image-optimizer";
import type { NextConfigComplete } from "next/dist/server/config-shared";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import nextConfig from "../next.config";

const request = { headers: { accept: "image/webp" } } as IncomingMessage;
const config = { images: { ...imageConfigDefault, ...nextConfig.images } } as NextConfigComplete;
const validate = (url: string) => ImageOptimizerCache.validateParams(request, { url, w: "640", q: "75" }, config, false);

test("SEO direct optimizer requests reject revocable CMS and site image routes", () => {
  for (const url of [
    "/api/media/00000000-0000-4000-8000-000000000001",
    "/api/instagram-image/instagram-123",
    "/site-assets/icon", "/site-assets/og", "/site-assets/logo",
    "/admin/preview/00000000-0000-4000-8000-000000000001",
    "/works/../api/media/00000000-0000-4000-8000-000000000001",
    "/works/%2e%2e/site-assets/og",
    "/icon.png?url=/api/media/example",
    "https://example.invalid/private.png",
  ]) {
    expect(validate(url), url).toHaveProperty("errorMessage", '"url" parameter is not allowed');
  }
});

test("SEO optimizer retains permanent public images while rejecting unlisted paths and queries", () => {
  for (const url of [
    "/icon.png", "/logo-color-footer.png", "/logo-mono-white.png",
    "/stagepartners-hero.jpg", "/company-hero.jpg", "/room.PNG",
    "/moc%20image%202.png", "/works/zentoku/after-01.jpg",
  ]) {
    const result = validate(url);
    expect(result, url).not.toHaveProperty("errorMessage");
    expect(result, url).toHaveProperty("width", 640);
  }
  for (const url of ["/unlisted-image.png", "/stagepartners-hero.jpg?version=1", "/works/zentoku/after-01.jpg?private=1"]) {
    expect(validate(url), url).toHaveProperty("errorMessage");
  }
  expect(nextConfig.images?.localPatterns?.every(pattern => pattern.search === "")).toBe(true);
  expect(nextConfig.images!.localPatterns!.length).toBeLessThanOrEqual(25);
});
