import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
import { gsap } from "@/hooks/useGsap";

/**
 * 実績カードのホバー演出。
 *
 * 施工後の写真の上でポインタを止めると、波打ちながら施工前の写真へ入れ替わる。
 * 「ホバーすると過去が覗く」という一覧の仕掛け。歪みはシェーダの仕事なので、
 * DOMとCSSしか触れないGSAPでは作れない。
 *
 * WebGLコンテキストはブラウザごとに上限があるため、canvasは1枚だけ作り、
 * ホバー中のカードのDOMに差し込んで使い回す。座標の同期がいらず、
 * スクロールやレイアウト変更に勝手についてくる。
 */
const VERT = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform sampler2D tAfter;
uniform sampler2D tBefore;
uniform vec2 uCoverAfter;
uniform vec2 uCoverBefore;
uniform float uProgress;
varying vec2 vUv;

vec2 cover(vec2 uv, vec2 scale) {
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  float p = uProgress;
  // 中心から広がる波。切り替わりの途中でだけ振幅が立ち、前後では平らに戻る。
  float d = distance(vUv, vec2(0.5));
  float amp = sin(p * 3.14159265) * 0.045;
  float wave = sin(d * 16.0 - p * 9.0) * amp;

  vec4 a = texture2D(tAfter, cover(vUv + wave, uCoverAfter));
  vec4 b = texture2D(tBefore, cover(vUv - wave, uCoverBefore));
  gl_FragColor = mix(a, b, smoothstep(0.0, 1.0, p));
}
`;

type Loaded = { texture: Texture; aspect: number };

export class HoverGl {
  private renderer: Renderer;
  private mesh: Mesh;
  private program: Program;
  private canvas: HTMLCanvasElement;
  private raf = 0;
  private host: HTMLElement | null = null;
  private cache = new Map<string, Promise<Loaded>>();

  static isSupported(): boolean {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
    try {
      const probe = document.createElement("canvas");
      return Boolean(probe.getContext("webgl") || probe.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  }

  constructor() {
    this.renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 2) });
    this.canvas = this.renderer.gl.canvas as HTMLCanvasElement;
    this.canvas.className = "absolute inset-0 h-full w-full";
    this.canvas.setAttribute("aria-hidden", "true");

    this.program = new Program(this.renderer.gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        tAfter: { value: new Texture(this.renderer.gl) },
        tBefore: { value: new Texture(this.renderer.gl) },
        uCoverAfter: { value: [1, 1] },
        uCoverBefore: { value: [1, 1] },
        uProgress: { value: 0 },
      },
    });
    this.mesh = new Mesh(this.renderer.gl, {
      geometry: new Triangle(this.renderer.gl),
      program: this.program,
    });
  }

  private load(src: string): Promise<Loaded> {
    const hit = this.cache.get(src);
    if (hit) return hit;
    const task = new Promise<Loaded>((resolve, reject) => {
      const image = new window.Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const texture = new Texture(this.renderer.gl, { image, generateMipmaps: false });
        resolve({ texture, aspect: image.naturalWidth / image.naturalHeight });
      };
      image.onerror = reject;
      image.src = src;
    });
    this.cache.set(src, task);
    return task;
  }

  /** object-cover と同じ見え方になるUVの倍率を出す。 */
  private coverScale(imageAspect: number): [number, number] {
    const box = this.host?.getBoundingClientRect();
    const boxAspect = box && box.height ? box.width / box.height : 1;
    return imageAspect > boxAspect
      ? [boxAspect / imageAspect, 1]
      : [1, imageAspect / boxAspect];
  }

  private tick = () => {
    this.renderer.render({ scene: this.mesh });
    this.raf = requestAnimationFrame(this.tick);
  };

  async enter(host: HTMLElement, after: string, before: string) {
    const [a, b] = await Promise.all([this.load(after), this.load(before)]);
    this.host = host;
    host.appendChild(this.canvas);

    const rect = host.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);

    this.program.uniforms.tAfter.value = a.texture;
    this.program.uniforms.tBefore.value = b.texture;
    this.program.uniforms.uCoverAfter.value = this.coverScale(a.aspect);
    this.program.uniforms.uCoverBefore.value = this.coverScale(b.aspect);

    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
    gsap.to(this.program.uniforms.uProgress, {
      value: 1,
      duration: 1.1,
      ease: "power2.out",
      overwrite: true,
    });
  }

  leave() {
    gsap.to(this.program.uniforms.uProgress, {
      value: 0,
      duration: 0.75,
      ease: "power2.inOut",
      overwrite: true,
      onComplete: () => {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
        this.canvas.remove();
        this.host = null;
      },
    });
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    gsap.killTweensOf(this.program.uniforms.uProgress);
    this.canvas.remove();
    this.renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
