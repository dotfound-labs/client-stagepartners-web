"use client";

import Image from "next/image";
import { useScopedGsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults, prefersReducedMotion, staggerFadeUp } from "@/lib/animations";
import { STATE_LABEL, workImage, type Shot, type Work } from "@/content/works";

/**
 * 施工前・施工後を左右に並べて見せる。
 *
 * 施工前の i 枚目と施工後の i 枚目を1行の組にして、左に施工前・右に施工後を置く。
 * 枚数が揃っていない案件では、片側だけの行はその列だけに写真が入る。
 * モバイルは1列になるため、組の順(施工前 → 施工後)がそのまま対応を示す。
 */
type Props = { work: Work };

function Cell({
  work,
  shot,
  tone,
  index,
  priority,
}: {
  work: Work;
  shot: Shot | undefined;
  tone: "before" | "after";
  index: number;
  priority?: boolean;
}) {
  if (!shot) {
    // 対になる写真が無い行。列は空けておく(PCでは対応が縦に揃う)。
    return <div aria-hidden className="hidden lg:block" />;
  }
  return (
    <figure className="media relative aspect-[3/2] w-full overflow-hidden bg-[#161513]">
      <Image
        src={workImage(work, shot.file)}
        alt=""
        fill
        sizes="(min-width: 1024px) 46vw, 100vw"
        className="object-cover"
        priority={priority}
      />
      <figcaption className="absolute left-4 top-4 flex items-center gap-2 font-latin text-[10px] tracking-[0.25em] text-on-dark/85">
        <span>{tone === "before" ? "BEFORE" : "AFTER"}</span>
        <span className="text-on-dark/60">{String(index + 1).padStart(2, "0")}</span>
      </figcaption>
    </figure>
  );
}

function ColumnHead({ tone, count }: { tone: "before" | "after"; count: number }) {
  const isBefore = tone === "before";
  return (
    <div
      className={`flex items-end justify-between gap-6 border-b pb-4 ${
        isBefore ? "border-line" : "border-navy-mid/30"
      }`}
    >
      <span
        className={`font-latin text-[11px] tracking-[0.35em] ${
          isBefore ? "text-ink-muted" : "text-navy-mid"
        }`}
      >
        {isBefore ? "BEFORE" : "AFTER"}
        <span className="ml-3 font-display text-base tracking-normal text-ink">
          {STATE_LABEL[tone]}
        </span>
      </span>
      <span
        className={`font-latin text-xs tracking-[0.2em] ${
          isBefore ? "text-ink-muted" : "text-navy-mid"
        }`}
      >
        {String(count).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function WorkPhotoSequence({ work }: Props) {
  const before = work.shots.filter((s) => s.state === "before");
  const after = work.shots.filter((s) => s.state === "after");
  const rowCount = Math.max(before.length, after.length);
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    before: before[i],
    after: after[i],
  }));

  const rootRef = useScopedGsap<HTMLDivElement>(({ scope }) => {
    if (prefersReducedMotion()) return;
    // 行を順に1度だけフェードイン(スクロール追従はしない)。
    // WorkDetail の単カラム写真と同じ staggerFadeUp を使う。
    const rows = scope.current!.querySelectorAll("[data-seq-row]");
    if (rows.length) {
      staggerFadeUp(rows, {
        duration: 0.8,
        scrollTrigger: { trigger: scope.current, ...scrollTriggerDefaults },
      });
    }
  }, [work.slug]);

  return (
    <div ref={rootRef} className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
      <div className="hidden gap-x-14 lg:grid lg:grid-cols-2">
        <ColumnHead tone="before" count={before.length} />
        <ColumnHead tone="after" count={after.length} />
      </div>

      {rows.map((row, i) => (
        <div
          key={i}
          data-seq-row
          className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-x-14"
        >
          <Cell work={work} shot={row.before} tone="before" index={i} priority={i === 0} />
          <Cell work={work} shot={row.after} tone="after" index={i} priority={i === 0} />
        </div>
      ))}
    </div>
  );
}
