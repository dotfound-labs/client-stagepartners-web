"use client";
import CmsText from "@/components/CmsText";


import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults } from "@/lib/animations";

const STRENGTHS = [
  {
    index: "01",
    title: "不動産と建築の一体対応",
    body: "仲介・買取から改修、そして管理まで。窓口を分けずに一社で担うから、判断も対応も速い。",
  },
  {
    index: "02",
    title: "幅広い施工力",
    body: "小さな原状回復から一棟のリノベーションまで。住まいにも収益物件にも柔軟に応えます。",
  },
  {
    index: "03",
    title: "買って終わりにしない",
    body: "売買や改修の後も、維持管理で長く伴走。資産の価値を、その先まで守り続けます。",
  },
];

export default function Strengths() {
  const sectionRef = useScopedGsap<HTMLElement>(() => {
    gsap.from("[data-strength-fade]", {
      opacity: 0,
      y: 24,
      duration: 1,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: "[data-strength-head]",
        ...scrollTriggerDefaults,
      },
    });

    gsap.from("[data-strength-item]", {
      opacity: 0,
      y: 28,
      duration: 0.9,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: "[data-strength-list]",
        ...scrollTriggerDefaults,
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="on-dark w-full bg-navy px-6 py-24 text-on-dark sm:px-10 lg:px-16 lg:py-32 xl:px-24"
    >
      <div className="mx-auto grid max-w-[1520px] grid-cols-1 gap-14 lg:grid-cols-[360px_1fr] lg:gap-20">
        <div data-strength-head>
          <p
            data-strength-fade
            className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-on-dark/50 sm:text-[11px]"
          >
            <span aria-hidden className="inline-block h-px w-10 bg-on-dark/25" /><CmsText>{"OUR STRENGTHS"}</CmsText></p>
          <h2
            data-strength-fade
            className="t-heading mt-8 font-display font-normal"
          ><CmsText>{"選ばれる、"}</CmsText><br /><CmsText>{"3つの理由。"}</CmsText></h2>
          <p
            data-strength-fade
            className="t-note mt-6 max-w-sm text-on-dark/60"
          ><CmsText>{"不動産と建築、その両方を知る会社だからこそ提供できる価値があります。"}</CmsText></p>
        </div>

        <ul data-strength-list className="flex flex-col">
          <CmsText>{STRENGTHS.map((item) => (
            <li
              key={item.index}
              data-strength-item
              className="grid grid-cols-[auto_1fr] gap-6 border-t border-on-dark/10 py-10 last:border-b sm:gap-10 sm:py-12"
            >
              <span className="font-latin text-[11px] tracking-[0.3em] text-on-dark/40">
                <CmsText>{item.index}</CmsText>
              </span>
              <div>
                <h3 className="t-body font-display font-normal"><CmsText>{item.title}</CmsText></h3>
                <p className="t-note mt-4 max-w-xl text-on-dark/60">
                  <CmsText>{item.body}</CmsText>
                </p>
              </div>
            </li>
          ))}</CmsText>
        </ul>
      </div>
    </section>
  );
}
