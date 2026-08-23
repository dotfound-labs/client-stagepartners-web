/**
 * 施工実績の写真を web 用に書き出す。
 *
 *   node scripts/build-works-images.mjs
 *
 * 素材は撮って出しの4000px級・HEIC混在で、そのままでは配信できない。
 * ここで「選ぶ → 変換する → 縮める」の3段を通し、public/works/<slug>/ に置く。
 *
 * - HEIC はブラウザが表示できないため sips で JPEG に変換する
 *   (Next.js同梱の sharp は libvips が HEIC 非対応のビルドのため使えない)
 * - 選別は「横向き優先・ファイルサイズ上位」の機械判定。最終的な絵の良し悪しは
 *   人の目で見て manifest 側で差し替える前提の下ごしらえ。
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { PROJECTS, SRC_ROOT, COVER_OVERRIDE } from "./works-manifest.mjs";

const OUT_ROOT = path.join(process.cwd(), "public/works");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "works-"));
const MAX_SHOTS = 5;      // BEFORE群・AFTER群それぞれの上限
const LONG_EDGE = 1400;   // 表示は最大でも約1000px。実解像度に対して十分な余裕がある
const QUALITY = 78;

const IMG = /\.(jpe?g|png|heic)$/i;

function listImages(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && IMG.test(e.name) && !e.name.startsWith("."))
    .map((e) => path.join(dir, e.name));
}

/** HEIC は sips でしか寸法を読めない。JPEG/PNG は sharp のほうが速い。 */
function dimensions(file) {
  if (/\.heic$/i.test(file)) {
    const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file], {
      encoding: "utf8",
    });
    const w = +(out.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0);
    const h = +(out.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0);
    return { w, h };
  }
  return null; // sharp 側で読む
}

async function measure(file) {
  const bytes = fs.statSync(file).size;
  let dim = dimensions(file);
  if (!dim) {
    try {
      const meta = await sharp(file).metadata();
      dim = { w: meta.width ?? 0, h: meta.height ?? 0 };
    } catch {
      return null;
    }
  }
  if (!dim.w || !dim.h) return null;
  return { file, bytes, ...dim, landscape: dim.w >= dim.h };
}

/** 横向きを先に、その中でファイルサイズが大きい順。 */
function rank(a, b) {
  if (a.landscape !== b.landscape) return a.landscape ? -1 : 1;
  return b.bytes - a.bytes;
}

async function emit(src, destPath) {
  let input = src;
  if (/\.heic$/i.test(src)) {
    input = path.join(TMP, path.basename(src).replace(/\.heic$/i, ".jpg"));
    execFileSync("sips", ["-s", "format", "jpeg", src, "--out", input], { stdio: "ignore" });
  }
  await sharp(input)
    .rotate() // Exif の向きを焼き込む
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(destPath);
  return fs.statSync(destPath).size;
}

const summary = [];
let totalBytes = 0;

for (const project of PROJECTS) {
  const outDir = path.join(OUT_ROOT, project.slug);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const pick = async (rel) => {
    if (!rel) return [];
    const measured = (await Promise.all(listImages(path.join(SRC_ROOT, rel)).map(measure)))
      .filter(Boolean)
      .sort(rank);
    return measured.slice(0, MAX_SHOTS);
  };

  const afters = await pick(project.after);
  const befores = await pick(project.before);

  if (afters.length === 0) {
    console.warn(`! ${project.slug}: 施工後の写真が無い`);
    continue;
  }

  const written = { before: [], after: [] };
  for (const [i, m] of afters.entries()) {
    const name = `after-${String(i + 1).padStart(2, "0")}.jpg`;
    totalBytes += await emit(m.file, path.join(outDir, name));
    written.after.push(name);
  }
  for (const [i, m] of befores.entries()) {
    const name = `before-${String(i + 1).padStart(2, "0")}.jpg`;
    totalBytes += await emit(m.file, path.join(outDir, name));
    written.before.push(name);
  }
  // カバーは施工後の一番手を流用する(別ファイルにせずディスク容量を増やさない)
  summary.push({
    slug: project.slug,
    title: project.title,
    type: project.type,
    category: project.category,
    cover: COVER_OVERRIDE[project.slug] ?? written.after[0],
    before: written.before,
    after: written.after,
  });
  console.log(
    `✓ ${project.slug.padEnd(24)} after ${String(written.after.length).padStart(2)} / before ${String(written.before.length).padStart(2)}`,
  );
}

fs.writeFileSync(path.join(OUT_ROOT, "manifest.json"), JSON.stringify(summary, null, 2));
fs.rmSync(TMP, { recursive: true, force: true });

console.log(`\n案件 ${summary.length}件 / 画像 ${summary.reduce((n, s) => n + s.before.length + s.after.length, 0)}枚 / 合計 ${(totalBytes / 1024 / 1024).toFixed(1)}MB`);
