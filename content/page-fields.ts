// Baseline structured text fields. Preserve stable IDs when changing labels.
export type PageTemplate = { title: string; fields: { id: string; label: string; value: string; section: string }[] };
export const PAGE_TEMPLATES: Record<string, PageTemplate> = {
  "home": {
    "title": "ホーム",
    "fields": [
      {
        "id": "text_a124ef90",
        "label": "STAGE PARTNERSが向き合う土地と建物",
        "value": "STAGE PARTNERSが向き合う土地と建物",
        "section": "Hero"
      },
      {
        "id": "text_579bb17d",
        "label": "REAL ESTATE &amp; ARCHITECTURE",
        "value": "REAL ESTATE &amp; ARCHITECTURE",
        "section": "Hero"
      },
      {
        "id": "text_d73b6a3f",
        "label": "挑戦する人が、",
        "value": "挑戦する人が、",
        "section": "Hero"
      },
      {
        "id": "text_fc0100c0",
        "label": "輝ける場所を。",
        "value": "輝ける場所を。",
        "section": "Hero"
      },
      {
        "id": "text_6bd321c2",
        "label": "不動産の仲介・管理から、建物のリフォーム・改修まで。",
        "value": "不動産の仲介・管理から、建物のリフォーム・改修まで。",
        "section": "Hero"
      },
      {
        "id": "text_fef657d4",
        "label": "静岡・東京・神奈川を拠点に、オーナー様の資産の可能性を、一貫して引き出します。",
        "value": "静岡・東京・神奈川を拠点に、オーナー様の資産の可能性を、一貫して引き出します。",
        "section": "Hero"
      },
      {
        "id": "text_c4559d6d",
        "label": "無料で相談する",
        "value": "無料で相談する",
        "section": "Challenges"
      },
      {
        "id": "text_bb3e382c",
        "label": "SCROLL",
        "value": "SCROLL",
        "section": "Hero"
      },
      {
        "id": "text_2f94f737",
        "label": "不動産や建築を扱うということは、主役は私たちではない。",
        "value": "不動産や建築を扱うということは、主役は私たちではない。",
        "section": "Message"
      },
      {
        "id": "text_fa70ef79",
        "label": "主役は、",
        "value": "主役は、",
        "section": "Message"
      },
      {
        "id": "text_b3d0fd30",
        "label": "その場所で挑戦する人たちだ。",
        "value": "その場所で挑戦する人たちだ。",
        "section": "Message"
      },
      {
        "id": "text_b769730f",
        "label": "私たちは、その人たちが輝くための舞台を創る。",
        "value": "私たちは、その人たちが輝くための舞台を創る。",
        "section": "Message"
      },
      {
        "id": "text_1655e5b6",
        "label": "メッセージ",
        "value": "メッセージ",
        "section": "Message"
      },
      {
        "id": "text_37819144",
        "label": "MESSAGE",
        "value": "MESSAGE",
        "section": "Message"
      },
      {
        "id": "text_9323d95d",
        "label": "私たちについて",
        "value": "私たちについて",
        "section": "Message"
      },
      {
        "id": "text_9ff16c01",
        "label": "空室が埋まらない",
        "value": "空室が埋まらない",
        "section": "Challenges"
      },
      {
        "id": "text_95c07976",
        "label": "募集しても入居が決まらない、稼働率が上がらない。収益の土台が揺らいでいる。",
        "value": "募集しても入居が決まらない、稼働率が上がらない。収益の土台が揺らいでいる。",
        "section": "Challenges"
      },
      {
        "id": "text_22e7d05a",
        "label": "建物の老朽化",
        "value": "建物の老朽化",
        "section": "Challenges"
      },
      {
        "id": "text_4316e014",
        "label": "外観や設備の傷みが目立ってきた。どこから、どこまで手を入れるべきか判断がつかない。",
        "value": "外観や設備の傷みが目立ってきた。どこから、どこまで手を入れるべきか判断がつかない。",
        "section": "Challenges"
      },
      {
        "id": "text_fc674e4f",
        "label": "管理の負担",
        "value": "管理の負担",
        "section": "Challenges"
      },
      {
        "id": "text_642d8522",
        "label": "入居者対応や日々の管理に手が回らない。任せられる相手が近くにいない。",
        "value": "入居者対応や日々の管理に手が回らない。任せられる相手が近くにいない。",
        "section": "Challenges"
      },
      {
        "id": "text_14b80d87",
        "label": "改修費用が読めない",
        "value": "改修費用が読めない",
        "section": "Challenges"
      },
      {
        "id": "text_872da953",
        "label": "リフォームすべきかどうか、いくらかかり、いくら戻るのか。費用対効果が見えない。",
        "value": "リフォームすべきかどうか、いくらかかり、いくら戻るのか。費用対効果が見えない。",
        "section": "Challenges"
      },
      {
        "id": "text_ff232e9",
        "label": "資産の活かし方",
        "value": "資産の活かし方",
        "section": "Challenges"
      },
      {
        "id": "text_e4676144",
        "label": "貸すべきか、売るべきか、直して活かすべきか。土地と建物の次の一手に迷っている。",
        "value": "貸すべきか、売るべきか、直して活かすべきか。土地と建物の次の一手に迷っている。",
        "section": "Challenges"
      },
      {
        "id": "text_e361272b",
        "label": "YOUR CONCERNS",
        "value": "YOUR CONCERNS",
        "section": "Challenges"
      },
      {
        "id": "text_3469f263",
        "label": "その土地と建物の悩み、",
        "value": "その土地と建物の悩み、",
        "section": "Challenges"
      },
      {
        "id": "text_982fedeb",
        "label": "抱え込んでいませんか。",
        "value": "抱え込んでいませんか。",
        "section": "Challenges"
      },
      {
        "id": "text_b14ae90c",
        "label": "オーナー様が直面しやすい課題を、STAGE PARTNERSは不動産と建築の両面から解きほ…",
        "value": "オーナー様が直面しやすい課題を、STAGE PARTNERSは不動産と建築の両面から解きほぐします。",
        "section": "Challenges"
      },
      {
        "id": "text_d04dc443",
        "label": "CONTACT",
        "value": "CONTACT",
        "section": "ContactCta"
      },
      {
        "id": "text_2b7d32d1",
        "label": "まずは、",
        "value": "まずは、",
        "section": "Challenges"
      },
      {
        "id": "text_49a85e3e",
        "label": "話を聞いてほしい。",
        "value": "話を聞いてほしい。",
        "section": "Challenges"
      },
      {
        "id": "text_5e621c1",
        "label": "不動産ソリューション",
        "value": "不動産ソリューション",
        "section": "Business"
      },
      {
        "id": "text_30468aee",
        "label": "仲介・管理・買取再販",
        "value": "仲介・管理・買取再販",
        "section": "Business"
      },
      {
        "id": "text_3c8ff9b",
        "label": "オーナー様の「貸したい・売りたい」に応え、\n確かな価値へとつなぎます。",
        "value": "オーナー様の「貸したい・売りたい」に応え、\n確かな価値へとつなぎます。",
        "section": "Business"
      },
      {
        "id": "text_837c9db1",
        "label": "借主・買主をお探しする仲介。媒介契約を結び、募集を開始します。",
        "value": "借主・買主をお探しする仲介。媒介契約を結び、募集を開始します。",
        "section": "Business"
      },
      {
        "id": "text_88b2d675",
        "label": "オーナー様と入居者の間に立つ管理。契約・入居中の対応・原状回復まで。",
        "value": "オーナー様と入居者の間に立つ管理。契約・入居中の対応・原状回復まで。",
        "section": "Business"
      },
      {
        "id": "text_37d5a3a0",
        "label": "当社で買い取り、価値を高めて次の所有者へお渡しする買取・再販。",
        "value": "当社で買い取り、価値を高めて次の所有者へお渡しする買取・再販。",
        "section": "Business"
      },
      {
        "id": "text_c8c44591",
        "label": "建築ソリューション",
        "value": "建築ソリューション",
        "section": "Business"
      },
      {
        "id": "text_9f014c0",
        "label": "新規出店・リノベーション",
        "value": "新規出店・リノベーション",
        "section": "Business"
      },
      {
        "id": "text_d2aae866",
        "label": "店舗・オフィスの新規出店から、空室・老朽化への対応まで。\nデザインから施工まで一社で担いま…",
        "value": "店舗・オフィスの新規出店から、空室・老朽化への対応まで。\nデザインから施工まで一社で担います。",
        "section": "Business"
      },
      {
        "id": "text_13cb6feb",
        "label": "店舗・オフィス等の新規出店を、デザインから施工まで一貫対応",
        "value": "店舗・オフィス等の新規出店を、デザインから施工まで一貫対応",
        "section": "Business"
      },
      {
        "id": "text_95a327f5",
        "label": "空室対策・原状回復から本格的なリノベーションまで",
        "value": "空室対策・原状回復から本格的なリノベーションまで",
        "section": "Business"
      },
      {
        "id": "text_231b05c5",
        "label": "自社で不動産まで見通すからこそ描ける、活かす前提の設計",
        "value": "自社で不動産まで見通すからこそ描ける、活かす前提の設計",
        "section": "Business"
      },
      {
        "id": "text_f4a6dce5",
        "label": "OUR SOLUTIONS",
        "value": "OUR SOLUTIONS",
        "section": "Business"
      },
      {
        "id": "text_cc016a58",
        "label": "不動産と建築を、",
        "value": "不動産と建築を、",
        "section": "Business"
      },
      {
        "id": "text_807539a0",
        "label": "一社でつなぐ。",
        "value": "一社でつなぐ。",
        "section": "Business"
      },
      {
        "id": "text_1e2b7cf1",
        "label": "仲介で終わらせず、リフォームで価値を高め、管理まで。",
        "value": "仲介で終わらせず、リフォームで価値を高め、管理まで。",
        "section": "Business"
      },
      {
        "id": "text_2d80074f",
        "label": "事業を分けずに一気通貫で担うからこそ、土地と建物の可能性を最大限に引き出せます。",
        "value": "事業を分けずに一気通貫で担うからこそ、土地と建物の可能性を最大限に引き出せます。",
        "section": "Business"
      },
      {
        "id": "text_4293882a",
        "label": "詳細を見る",
        "value": "詳細を見る",
        "section": "Business"
      },
      {
        "id": "text_f1572d2e",
        "label": "不動産と建築の一体対応",
        "value": "不動産と建築の一体対応",
        "section": "Strengths"
      },
      {
        "id": "text_4e61863f",
        "label": "仲介・買取から改修、そして管理まで。窓口を分けずに一社で担うから、判断も対応も速い。",
        "value": "仲介・買取から改修、そして管理まで。窓口を分けずに一社で担うから、判断も対応も速い。",
        "section": "Strengths"
      },
      {
        "id": "text_b45bf55e",
        "label": "幅広い施工力",
        "value": "幅広い施工力",
        "section": "Strengths"
      },
      {
        "id": "text_e7322d58",
        "label": "小さな原状回復から一棟のリノベーションまで。住まいにも収益物件にも柔軟に応えます。",
        "value": "小さな原状回復から一棟のリノベーションまで。住まいにも収益物件にも柔軟に応えます。",
        "section": "Strengths"
      },
      {
        "id": "text_26c2a0aa",
        "label": "買って終わりにしない",
        "value": "買って終わりにしない",
        "section": "Strengths"
      },
      {
        "id": "text_9c2b3956",
        "label": "売買や改修の後も、維持管理で長く伴走。資産の価値を、その先まで守り続けます。",
        "value": "売買や改修の後も、維持管理で長く伴走。資産の価値を、その先まで守り続けます。",
        "section": "Strengths"
      },
      {
        "id": "text_b637cd77",
        "label": "OUR STRENGTHS",
        "value": "OUR STRENGTHS",
        "section": "Strengths"
      },
      {
        "id": "text_e26834a3",
        "label": "選ばれる、",
        "value": "選ばれる、",
        "section": "Strengths"
      },
      {
        "id": "text_28e47dc5",
        "label": "3つの理由。",
        "value": "3つの理由。",
        "section": "Strengths"
      },
      {
        "id": "text_2a333f37",
        "label": "不動産と建築、その両方を知る会社だからこそ提供できる価値があります。",
        "value": "不動産と建築、その両方を知る会社だからこそ提供できる価値があります。",
        "section": "Strengths"
      },
      {
        "id": "text_45416a3",
        "label": "土地と建物のこと、",
        "value": "土地と建物のこと、",
        "section": "ContactCta"
      },
      {
        "id": "text_53b12b90",
        "label": "まずは聞かせてください。",
        "value": "まずは聞かせてください。",
        "section": "ContactCta"
      },
      {
        "id": "text_cbbef164",
        "label": "売却・賃貸・リフォーム・管理まで、",
        "value": "売却・賃貸・リフォーム・管理まで、",
        "section": "ContactCta"
      },
      {
        "id": "text_a78ef19d",
        "label": "どんな段階のご相談でも構いません。",
        "value": "どんな段階のご相談でも構いません。",
        "section": "ContactCta"
      },
      {
        "id": "text_13e14d85",
        "label": "ご相談は無料です。お気軽にお問い合わせください。",
        "value": "ご相談は無料です。お気軽にお問い合わせください。",
        "section": "ContactCta"
      },
      {
        "id": "text_f68d90b6",
        "label": "お問い合わせフォームへ",
        "value": "お問い合わせフォームへ",
        "section": "ContactCta"
      },
      {
        "id": "text_413d0f9a",
        "label": "TEL",
        "value": "TEL",
        "section": "ContactCta"
      }
    ]
  },
  "real-estate": {
    "title": "不動産ソリューション",
    "fields": [
      {
        "id": "text_89aa44a6",
        "label": "取り扱い業務",
        "value": "取り扱い業務",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_71a3876d",
        "label": "オーナー様へ",
        "value": "オーナー様へ",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_36091759",
        "label": "ご相談の流れ",
        "value": "ご相談の流れ",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_466ab818",
        "label": "物件をお探しの方",
        "value": "物件をお探しの方",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_e53f7505",
        "label": "売買・賃貸の仲介",
        "value": "売買・賃貸の仲介",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_2e6dc5c0",
        "label": "土地・建物の売買、テナントや住まいの賃貸を仲介します。売りたい・貸したいというオーナー様の…",
        "value": "土地・建物の売買、テナントや住まいの賃貸を仲介します。売りたい・貸したいというオーナー様のご要望と、借りたい・買いたいという方のご希望の間に立ち、条件をすり合わせて成約まで進めます。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_f98f63d1",
        "label": "賃貸管理",
        "value": "賃貸管理",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_87272156",
        "label": "入居者の募集から契約、入居中の対応、退去時の原状回復まで引き受けます。建築部門を自社に持っ…",
        "value": "入居者の募集から契約、入居中の対応、退去時の原状回復まで引き受けます。建築部門を自社に持っているため、修繕が必要になったときも外注を挟まずそのまま動けます。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_c2d84c37",
        "label": "買取・再販",
        "value": "買取・再販",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_56a89ae2",
        "label": "土地や建物を当社で買い取り、リフォームで手を入れてから次の所有者へお渡しします。相続や住み…",
        "value": "土地や建物を当社で買い取り、リフォームで手を入れてから次の所有者へお渡しします。相続や住み替えで早く手放したい場合も、買主を探す期間を待たずに進められます。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_9ff16c01",
        "label": "空室が埋まらない",
        "value": "空室が埋まらない",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_dc0062e3",
        "label": "募集条件の見直しだけで解決しないときは、建築部門と一緒に原因を見ます。設備の古さが理由なら…",
        "value": "募集条件の見直しだけで解決しないときは、建築部門と一緒に原因を見ます。設備の古さが理由なら、費用対効果を見たうえで改修をご提案します。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_d024f2a0",
        "label": "建物が古くなってきた",
        "value": "建物が古くなってきた",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_9b8316aa",
        "label": "現状のまま貸し続けるか、手を入れて賃料を上げるか、売却するか。それぞれの収支を並べてお出し…",
        "value": "現状のまま貸し続けるか、手を入れて賃料を上げるか、売却するか。それぞれの収支を並べてお出しし、そのうえで方針を決めていただきます。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_c54474ad",
        "label": "相続した土地の使い道が決まらない",
        "value": "相続した土地の使い道が決まらない",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_c1f8a7ea",
        "label": "そのまま売る、貸す、建てて貸す。立地と法規制から現実的な選択肢を絞り、判断に必要な数字をそ…",
        "value": "そのまま売る、貸す、建てて貸す。立地と法規制から現実的な選択肢を絞り、判断に必要な数字をそろえます。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_328e7a52",
        "label": "ご相談",
        "value": "ご相談",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_426f9876",
        "label": "お電話・お問い合わせフォームからご連絡ください。所在地と現在の状況を伺います。この時点で費…",
        "value": "お電話・お問い合わせフォームからご連絡ください。所在地と現在の状況を伺います。この時点で費用はかかりません。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_1667bd55",
        "label": "現地確認・調査",
        "value": "現地確認・調査",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_be981adb",
        "label": "物件を実際に拝見し、法規制や周辺の相場を調べます。建物がある場合は、劣化の状況もあわせて確…",
        "value": "物件を実際に拝見し、法規制や周辺の相場を調べます。建物がある場合は、劣化の状況もあわせて確認します。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_cf0938f3",
        "label": "ご提案",
        "value": "ご提案",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_dda1d7b3",
        "label": "売る・貸す・手を入れて活かす。とりうる選択肢を、それぞれの想定収支と期間とともにお示ししま…",
        "value": "売る・貸す・手を入れて活かす。とりうる選択肢を、それぞれの想定収支と期間とともにお示しします。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_e4c14fca",
        "label": "契約・募集開始",
        "value": "契約・募集開始",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_af3cb111",
        "label": "方針が決まりましたら、媒介契約を結び、募集を開始します。進捗は定期的にご報告します。",
        "value": "方針が決まりましたら、媒介契約を結び、募集を開始します。進捗は定期的にご報告します。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_7faf6168",
        "label": "成約・引き渡し",
        "value": "成約・引き渡し",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_702c65e3",
        "label": "条件が整いましたら契約手続きに進みます。管理をお任せいただく場合は、ここから入居中の対応が…",
        "value": "条件が整いましたら契約手続きに進みます。管理をお任せいただく場合は、ここから入居中の対応が始まります。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_f939097b",
        "label": "REAL ESTATE SOLUTIONS",
        "value": "REAL ESTATE SOLUTIONS",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_5e621c1",
        "label": "不動産ソリューション",
        "value": "不動産ソリューション",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_8b2acc31",
        "label": "売買・賃貸の仲介から管理、買取・再販まで。建築部門を自社に持つ強みを活かし、",
        "value": "売買・賃貸の仲介から管理、買取・再販まで。建築部門を自社に持つ強みを活かし、",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_f2cf8fae",
        "label": "貸す・売る・活かすの判断からその先の手入れまでを一社でお引き受けします。",
        "value": "貸す・売る・活かすの判断からその先の手入れまでを一社でお引き受けします。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_a81b9982",
        "label": "このページの内容",
        "value": "このページの内容",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_d90c0344",
        "label": "SERVICE",
        "value": "SERVICE",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_d8030973",
        "label": "住まいから事業用の物件まで、不動産に関わる業務を一通り扱います。",
        "value": "住まいから事業用の物件まで、不動産に関わる業務を一通り扱います。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_28513531",
        "label": "仲介して終わりではなく、貸した後の管理や、必要になったときの改修まで見据えてご提案します。",
        "value": "仲介して終わりではなく、貸した後の管理や、必要になったときの改修まで見据えてご提案します。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_e74be6ec",
        "label": "FOR OWNERS",
        "value": "FOR OWNERS",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_9e68b181",
        "label": "土地や建物をお持ちの方から特に多くいただくご相談は、次の三つです。いずれも「不動産だけ」「…",
        "value": "土地や建物をお持ちの方から特に多くいただくご相談は、次の三つです。いずれも「不動産だけ」「建築だけ」では答えが出ません。私たちは両方を自社で持っているため、貸し方の見直しと建物への手入れを同じテーブルで検討できます。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_c2d16e23",
        "label": "沼津の街並みと建ち並ぶ住宅",
        "value": "沼津の街並みと建ち並ぶ住宅",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_fbb9af55",
        "label": "FLOW",
        "value": "FLOW",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_af0b5713",
        "label": "ご相談から成約まで、五つの段階を踏みます。現地確認とご提案までは費用をいただきません。方針…",
        "value": "ご相談から成約まで、五つの段階を踏みます。現地確認とご提案までは費用をいただきません。方針が決まらないうちに契約を迫ることもありません。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_e3111664",
        "label": "PROPERTY SEARCH",
        "value": "PROPERTY SEARCH",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_39b4af20",
        "label": "物件をお探しの方へ",
        "value": "物件をお探しの方へ",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_63de8333",
        "label": "現在お取り扱い中の物件は、不動産情報サイト「at home」に掲載しています。間取りや写真…",
        "value": "現在お取り扱い中の物件は、不動産情報サイト「at home」に掲載しています。間取りや写真、周辺環境まで掲載していますので、まずはこちらをご覧ください。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_3140fbbd",
        "label": "掲載されていない物件のご相談や、条件を決めてお探しすることも承ります。ご希望がお決まりでな…",
        "value": "掲載されていない物件のご相談や、条件を決めてお探しすることも承ります。ご希望がお決まりでない段階でも構いませんので、お気軽にお問い合わせください。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_3b94750a",
        "label": "at homeで掲載物件を見る",
        "value": "at homeで掲載物件を見る",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_a553baf1",
        "label": "外部サイト（at home）が新しいタブで開きます",
        "value": "外部サイト（at home）が新しいタブで開きます",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_e182966b",
        "label": "貸すか、売るか、手を入れて活かすか。",
        "value": "貸すか、売るか、手を入れて活かすか。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_21d55ea5",
        "label": "判断の材料からご一緒します。",
        "value": "判断の材料からご一緒します。",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_6eda855c",
        "label": "お問い合わせ",
        "value": "お問い合わせ",
        "section": "RealEstateSolution"
      },
      {
        "id": "text_d468a407",
        "label": "建築ソリューションを見る",
        "value": "建築ソリューションを見る",
        "section": "RealEstateSolution"
      }
    ]
  },
  "architecture": {
    "title": "建築ソリューション",
    "fields": [
      {
        "id": "text_e83d828",
        "label": "オフィス",
        "value": "オフィス",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_dd97fdcb",
        "label": "飲食店",
        "value": "飲食店",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_b98c1c54",
        "label": "美容室",
        "value": "美容室",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_837efa17",
        "label": "クリニック",
        "value": "クリニック",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_90d00915",
        "label": "スポーツ施設",
        "value": "スポーツ施設",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_d8eb82e7",
        "label": "居酒屋",
        "value": "居酒屋",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_31595b9e",
        "label": "携帯ショップ",
        "value": "携帯ショップ",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_e3d2c4e9",
        "label": "遊技場",
        "value": "遊技場",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_876a84fb",
        "label": "対応する工事",
        "value": "対応する工事",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_3d7fce61",
        "label": "店舗設計・施工",
        "value": "店舗設計・施工",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_4edf58fa",
        "label": "施設営繕",
        "value": "施設営繕",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_1c623e04",
        "label": "空きテナントのご相談",
        "value": "空きテナントのご相談",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_a6b95e",
        "label": "ヒアリング",
        "value": "ヒアリング",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_f54c36f1",
        "label": "お店のコンセプトと、譲れない条件を伺います。予算と開店希望日も、この時点で共有してください…",
        "value": "お店のコンセプトと、譲れない条件を伺います。予算と開店希望日も、この時点で共有してください。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_93cdae40",
        "label": "プランニング",
        "value": "プランニング",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_42cf4e5b",
        "label": "間取りを図面に落とし、パースで完成形をご覧いただきます。ここで大きな方向を決めます。",
        "value": "間取りを図面に落とし、パースで完成形をご覧いただきます。ここで大きな方向を決めます。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_e4a35d17",
        "label": "デザイン制作",
        "value": "デザイン制作",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_b17b923a",
        "label": "設備と什器の位置、寸法を確定します。レイアウトが決まると、働きやすさもほぼ決まります。",
        "value": "設備と什器の位置、寸法を確定します。レイアウトが決まると、働きやすさもほぼ決まります。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_a3580742",
        "label": "詳細設計・お見積もり",
        "value": "詳細設計・お見積もり",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_467efcd1",
        "label": "色や質感、家具、必要な設備を一つずつ決めます。\n費用と工期をお示しし、ご了承をいただいてか…",
        "value": "色や質感、家具、必要な設備を一つずつ決めます。\n費用と工期をお示しし、ご了承をいただいてから着工日を確定します。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_a9bf8f77",
        "label": "施工",
        "value": "施工",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_4cbd9c8c",
        "label": "解体、造作、仕上げの順に進みます。工事中は定期的に進捗をご報告し、\n変更が必要になればその…",
        "value": "解体、造作、仕上げの順に進みます。工事中は定期的に進捗をご報告し、\n変更が必要になればその都度ご相談します。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_6b553a71",
        "label": "引き渡し・検査",
        "value": "引き渡し・検査",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_ccc60bbf",
        "label": "設備の使い方をご説明し、検査を受けます。保健所や消防署の営業許可も、ここで取得します。\n引…",
        "value": "設備の使い方をご説明し、検査を受けます。保健所や消防署の営業許可も、ここで取得します。\n引き渡した後の不具合にも対応します。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_f4c507f8",
        "label": "点検",
        "value": "点検",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_438c03cb",
        "label": "建築基準法と官公法で定められた点検です。建物と敷地、昇降機、建築設備、防火設備の劣化を確認…",
        "value": "建築基準法と官公法で定められた点検です。建物と敷地、昇降機、建築設備、防火設備の劣化を確認します。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_912e97ef",
        "label": "補修",
        "value": "補修",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_d19735da",
        "label": "決まった周期ではなく、不具合が出た箇所に対して行います。実用上の問題がない状態まで戻します…",
        "value": "決まった周期ではなく、不具合が出た箇所に対して行います。実用上の問題がない状態まで戻します。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_1726ad9d",
        "label": "メンテナンス",
        "value": "メンテナンス",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_7eee0f5c",
        "label": "日々の清掃、設備の点検、リニューアル工事。空調が効いて水が出る、その当たり前を保ちます。",
        "value": "日々の清掃、設備の点検、リニューアル工事。空調が効いて水が出る、その当たり前を保ちます。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_9ea1ac4a",
        "label": "ARCHITECTURE SOLUTIONS",
        "value": "ARCHITECTURE SOLUTIONS",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_c8c44591",
        "label": "建築ソリューション",
        "value": "建築ソリューション",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_fd10d3b5",
        "label": "店舗・オフィス等の新規出店から、住まいの改修、建てた後の維持管理まで。図面を引くところから…",
        "value": "店舗・オフィス等の新規出店から、住まいの改修、建てた後の維持管理まで。図面を引くところから引き渡した先まで、一社で受けます。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_a81b9982",
        "label": "このページの内容",
        "value": "このページの内容",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_a17dd30b",
        "label": "SCOPE",
        "value": "SCOPE",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_43e8b769",
        "label": "店舗・オフィス等の新規出店は、デザインから施工まで一貫してお引き受けします。壁紙の張り替え…",
        "value": "店舗・オフィス等の新規出店は、デザインから施工まで一貫してお引き受けします。壁紙の張り替えやエアコンの交換といった一日で終わる工事から、フロアをまるごと変える大型リニューアルまで扱います。業種が変われば必要な設備も動線も変わるので、図面はいつも一から引き直します。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_3a777a03",
        "label": "住まいも同じです。二世帯住宅への間取り変更、マンションのリノベーション。家族の人数が変われ…",
        "value": "住まいも同じです。二世帯住宅への間取り変更、マンションのリノベーション。家族の人数が変われば、必要な部屋の数も位置も変わります。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_28d08777",
        "label": "INDUSTRIES",
        "value": "INDUSTRIES",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_2c8b195c",
        "label": "STORE DESIGN",
        "value": "STORE DESIGN",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_1efa6596",
        "label": "私たちは、店舗デザインのプロフェッショナルとして、お客様のブランドやアイデンティティを反映…",
        "value": "私たちは、店舗デザインのプロフェッショナルとして、お客様のブランドやアイデンティティを反映させながら、魅力的で機能的な空間を創り出します。内装工事では高品質な施工を心がけ、営繕管理では施設を持続可能な状態に保ちます。そして、新しい店舗をお探しの方には、適切な空き店舗の提案も行います。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_3756cc20",
        "label": "テナント施設を紹介し、作り、守ることで、店舗設計における三拍子が揃ったスペシャリストとして…",
        "value": "テナント施設を紹介し、作り、守ることで、店舗設計における三拍子が揃ったスペシャリストとして、お客様のビジネス成功に向けて全力でサポートします。私たちは、お客様とともに成長し、繁栄する未来を築くために、真摯かつ専門的なサービスを提供いたします。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_463504dd",
        "label": "店舗ができるまで",
        "value": "店舗ができるまで",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_8e4be6cd",
        "label": "ご相談から引き渡しまで、六つの段階を踏みます。",
        "value": "ご相談から引き渡しまで、六つの段階を踏みます。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_ee6bbc5a",
        "label": "どの段階でも図面と見積もりをご覧いただき、合意してから次へ進みます。",
        "value": "どの段階でも図面と見積もりをご覧いただき、合意してから次へ進みます。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_be50439e",
        "label": "建物の劣化状況を点検する現場担当者",
        "value": "建物の劣化状況を点検する現場担当者",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_9b714d20",
        "label": "MAINTENANCE",
        "value": "MAINTENANCE",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_92312a4c",
        "label": "施設はお客様の重要な財産です。その価値を守るために、定期的な点検、必要な補修、継続的なメン…",
        "value": "施設はお客様の重要な財産です。その価値を守るために、定期的な点検、必要な補修、継続的なメンテナンスを実施いたします。私たちは、高い専門性と信頼性をもって、お客様の施設を確実に管理し、持続可能な状態を維持します。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_bb8e3f66",
        "label": "施設営繕の内容",
        "value": "施設営繕の内容",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_3958b9e1",
        "label": "VACANCY SUPPORT",
        "value": "VACANCY SUPPORT",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_fad6e42e",
        "label": "空きテナントでお困りのオーナー様へ",
        "value": "空きテナントでお困りのオーナー様へ",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_5ba99b61",
        "label": "空き店舗の修繕や改修により、ビルの価値を高め、魅力的な賃貸スペースに変貌させることが可能で…",
        "value": "空き店舗の修繕や改修により、ビルの価値を高め、魅力的な賃貸スペースに変貌させることが可能です。私たちは、これらのプロセスに関する豊富な経験と専門知識を持ち、改修後は不動産事業のノウハウを活かして事業者の募集をサポートします。特に、借り手が集まらないビルのオーナー様にとって、このサービスは大きな助けとなります。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_f8b24beb",
        "label": "私たちは、ビルの魅力を引き出し、適切なテナントの選定や効果的なマーケティング戦略を提供しま…",
        "value": "私たちは、ビルの魅力を引き出し、適切なテナントの選定や効果的なマーケティング戦略を提供します。空きスペースの有効活用はオーナー様の収益向上に直結し、私たちはそのお手伝いを致します。空き店舗にお困りのビルオーナー様は、ぜひお気軽にご相談ください。専門的なチームが全力でサポートし、ビジネスの成功をサポートいたします。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_d6d5f77",
        "label": "不動産ソリューションを見る",
        "value": "不動産ソリューションを見る",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_affa875d",
        "label": "クライアントの課題解決",
        "value": "クライアントの課題解決",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_7f0fc056",
        "label": "仕上がりは、実際の現場でご覧ください。",
        "value": "仕上がりは、実際の現場でご覧ください。",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_c0205f4e",
        "label": "施工実績を見る",
        "value": "施工実績を見る",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_db03c80e",
        "label": "工事の規模や費用の目安については、",
        "value": "工事の規模や費用の目安については、",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_6eda855c",
        "label": "お問い合わせ",
        "value": "お問い合わせ",
        "section": "ArchitectureSolution"
      },
      {
        "id": "text_1d4bfb76",
        "label": "からご相談ください。",
        "value": "からご相談ください。",
        "section": "ArchitectureSolution"
      }
    ]
  },
  "company": {
    "title": "会社概要",
    "fields": [
      {
        "id": "text_bf3e1009",
        "label": "グループ会社",
        "value": "グループ会社",
        "section": "Company"
      },
      {
        "id": "text_32696d9a",
        "label": "サンプラホールディングス株式会社",
        "value": "サンプラホールディングス株式会社",
        "section": "Company"
      },
      {
        "id": "text_191da4ce",
        "label": "株式会社サン・プランナー",
        "value": "株式会社サン・プランナー",
        "section": "Company"
      },
      {
        "id": "text_627fd425",
        "label": "株式会社ソレイユ",
        "value": "株式会社ソレイユ",
        "section": "Company"
      },
      {
        "id": "text_346e27d0",
        "label": "株式会社サンプラダイニング",
        "value": "株式会社サンプラダイニング",
        "section": "Company"
      },
      {
        "id": "text_424379a6",
        "label": "株式会社sunpla style",
        "value": "株式会社sunpla style",
        "section": "Company"
      },
      {
        "id": "text_ea5c3e6e",
        "label": "株式会社ドットファウンド",
        "value": "株式会社ドットファウンド",
        "section": "Company"
      },
      {
        "id": "text_cac0b0c",
        "label": "会社名",
        "value": "会社名",
        "section": "Company"
      },
      {
        "id": "text_798ce0af",
        "label": "本社",
        "value": "本社",
        "section": "Company"
      },
      {
        "id": "text_6a49f7db",
        "label": "事業内容",
        "value": "事業内容",
        "section": "Company"
      },
      {
        "id": "text_5309633c",
        "label": "不動産ソリューション（仲介・管理・買取再販）／ 建築ソリューション（新規出店・リノベーショ…",
        "value": "不動産ソリューション（仲介・管理・買取再販）／ 建築ソリューション（新規出店・リノベーション・営繕）",
        "section": "Company"
      },
      {
        "id": "text_b935f4c4",
        "label": "許認可",
        "value": "許認可",
        "section": "Company"
      },
      {
        "id": "text_7d769c70",
        "label": "宅地建物取引業免許　静岡県知事(1)第15176号",
        "value": "宅地建物取引業免許　静岡県知事(1)第15176号",
        "section": "Company"
      },
      {
        "id": "text_13c761f9",
        "label": "一般建設業登録　静岡県知事許可(般-6)第39891号",
        "value": "一般建設業登録　静岡県知事許可(般-6)第39891号",
        "section": "Company"
      },
      {
        "id": "text_4ab4353",
        "label": "一級建築士事務所　",
        "value": "一級建築士事務所　",
        "section": "Company"
      },
      {
        "id": "text_63f2cdff",
        "label": "STAGE PARTNERSの拠点と街並み",
        "value": "STAGE PARTNERSの拠点と街並み",
        "section": "Company"
      },
      {
        "id": "text_784b295c",
        "label": "COMPANY",
        "value": "COMPANY",
        "section": "Company"
      },
      {
        "id": "text_828b9630",
        "label": "会社概要",
        "value": "会社概要",
        "section": "Company"
      },
      {
        "id": "text_2d1e7942",
        "label": "（外部サイト・新しいタブで開きます）",
        "value": "（外部サイト・新しいタブで開きます）",
        "section": "Company"
      }
    ]
  },
  "privacy": {
    "title": "プライバシーポリシー",
    "fields": [
      {
        "id": "text_8c2e5d33",
        "label": "プライバシーポリシー | STAGE PARTNERS",
        "value": "プライバシーポリシー | STAGE PARTNERS",
        "section": "page"
      },
      {
        "id": "text_efbceb4a",
        "label": "株式会社STAGE PARTNERSの個人情報の取扱いについて。",
        "value": "株式会社STAGE PARTNERSの個人情報の取扱いについて。",
        "section": "page"
      },
      {
        "id": "text_89685dc6",
        "label": "プライバシーポリシー",
        "value": "プライバシーポリシー",
        "section": "page"
      },
      {
        "id": "text_425f89c5",
        "label": "株式会社STAGE PARTNERS（以下「当社」といいます）は、お客様の個人情報を適切に…",
        "value": "株式会社STAGE PARTNERS（以下「当社」といいます）は、お客様の個人情報を適切に取り扱うことが社会的責務であると認識し、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。",
        "section": "page"
      },
      {
        "id": "text_f0e09fe7",
        "label": "2026年8月25日",
        "value": "2026年8月25日",
        "section": "page"
      },
      {
        "id": "text_849126f",
        "label": "第1条（個人情報）",
        "value": "第1条（個人情報）",
        "section": "page"
      },
      {
        "id": "text_4105e239",
        "label": "「個人情報」とは、個人情報保護法にいう「個人情報」を指し、生存する個人に関する情報であって…",
        "value": "「個人情報」とは、個人情報保護法にいう「個人情報」を指し、生存する個人に関する情報であって、氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報、および容貌、指紋、声紋にかかるデータ、健康保険証の保険者番号など、個人識別符号が含まれる情報を指します。",
        "section": "page"
      },
      {
        "id": "text_3ad795fe",
        "label": "第2条（取得する情報と方法）",
        "value": "第2条（取得する情報と方法）",
        "section": "page"
      },
      {
        "id": "text_8696f5f6",
        "label": "当社は、お問い合わせフォームおよびお電話でのお問い合わせの際に、氏名、会社名（法人のお客様…",
        "value": "当社は、お問い合わせフォームおよびお電話でのお問い合わせの際に、氏名、会社名（法人のお客様の場合）、電話番号、メールアドレス、ご住所、お問い合わせ内容等の個人情報をお客様よりご提供いただきます。",
        "section": "page"
      },
      {
        "id": "text_32d8b6be",
        "label": "不動産の仲介・買取・管理、または建築・リフォームのご依頼にあたっては、契約手続きに必要な範…",
        "value": "不動産の仲介・買取・管理、または建築・リフォームのご依頼にあたっては、契約手続きに必要な範囲で、上記に加えて物件情報等をお伺いする場合があります。",
        "section": "page"
      },
      {
        "id": "text_4eecabd1",
        "label": "第3条（利用目的）",
        "value": "第3条（利用目的）",
        "section": "page"
      },
      {
        "id": "text_a222d8ec",
        "label": "当社は、取得した個人情報を、以下の目的の範囲内で利用します。",
        "value": "当社は、取得した個人情報を、以下の目的の範囲内で利用します。",
        "section": "page"
      },
      {
        "id": "text_eadf4382",
        "label": "お問い合わせ・ご相談への対応、および必要事項のご連絡のため",
        "value": "お問い合わせ・ご相談への対応、および必要事項のご連絡のため",
        "section": "page"
      },
      {
        "id": "text_bbd529fe",
        "label": "不動産の仲介・管理・買取再販、建築・リフォームに関するサービスの提供、見積り作成、契約手続…",
        "value": "不動産の仲介・管理・買取再販、建築・リフォームに関するサービスの提供、見積り作成、契約手続きのため",
        "section": "page"
      },
      {
        "id": "text_7ec6dcc1",
        "label": "工事・取引に関する重要事項のご連絡、アフターサービスの提供のため",
        "value": "工事・取引に関する重要事項のご連絡、アフターサービスの提供のため",
        "section": "page"
      },
      {
        "id": "text_7a15095f",
        "label": "採用選考に関するご連絡のため（採用応募の場合）",
        "value": "採用選考に関するご連絡のため（採用応募の場合）",
        "section": "page"
      },
      {
        "id": "text_ecc98470",
        "label": "上記利用目的に付随する目的のため",
        "value": "上記利用目的に付随する目的のため",
        "section": "page"
      },
      {
        "id": "text_df51b0ca",
        "label": "第4条（第三者提供）",
        "value": "第4条（第三者提供）",
        "section": "page"
      },
      {
        "id": "text_43e43d0",
        "label": "当社は、次に掲げる場合を除き、あらかじめお客様の同意を得ることなく、第三者に個人情報を提供…",
        "value": "当社は、次に掲げる場合を除き、あらかじめお客様の同意を得ることなく、第三者に個人情報を提供しません。",
        "section": "page"
      },
      {
        "id": "text_a17c3751",
        "label": "法令に基づく場合",
        "value": "法令に基づく場合",
        "section": "page"
      },
      {
        "id": "text_39eeece1",
        "label": "人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難で…",
        "value": "人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき",
        "section": "page"
      },
      {
        "id": "text_c0c7f702",
        "label": "取引の性質上、提携する金融機関・登記関係機関・保険会社等へ、契約手続きに必要な範囲で提供す…",
        "value": "取引の性質上、提携する金融機関・登記関係機関・保険会社等へ、契約手続きに必要な範囲で提供する場合",
        "section": "page"
      },
      {
        "id": "text_f55404be",
        "label": "なお、当社はグループ会社（",
        "value": "なお、当社はグループ会社（",
        "section": "page"
      },
      {
        "id": "text_ce2d4a1a",
        "label": "会社概要ページ",
        "value": "会社概要ページ",
        "section": "page"
      },
      {
        "id": "text_4c44faff",
        "label": "に掲載）と情報を共有する場合がありますが、その場合も本ポリシーに定める利用目的の範囲内で取…",
        "value": "に掲載）と情報を共有する場合がありますが、その場合も本ポリシーに定める利用目的の範囲内で取り扱います。",
        "section": "page"
      },
      {
        "id": "text_2dcb02d5",
        "label": "第5条（個人情報取扱いの委託）",
        "value": "第5条（個人情報取扱いの委託）",
        "section": "page"
      },
      {
        "id": "text_a8ee8de9",
        "label": "当社は、利用目的の達成に必要な範囲内において、個人情報の取扱いの全部または一部を委託する場…",
        "value": "当社は、利用目的の達成に必要な範囲内において、個人情報の取扱いの全部または一部を委託する場合があります。この場合、委託先に対する必要かつ適切な監督を行います。",
        "section": "page"
      },
      {
        "id": "text_8959beb9",
        "label": "第6条（Cookie等の利用）",
        "value": "第6条（Cookie等の利用）",
        "section": "page"
      },
      {
        "id": "text_af6ff189",
        "label": "本サイトは、2026年8月時点においてアクセス解析ツールおよびCookieを利用した個人情…",
        "value": "本サイトは、2026年8月時点においてアクセス解析ツールおよびCookieを利用した個人情報の取得は行っておりません。今後、サービス向上のためこれらを導入する場合は、本ポリシーを改定のうえ、その利用目的を明示します。",
        "section": "page"
      },
      {
        "id": "text_5d16781a",
        "label": "第7条（安全管理措置）",
        "value": "第7条（安全管理措置）",
        "section": "page"
      },
      {
        "id": "text_6f771d63",
        "label": "当社は、個人情報の漏えい、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適…",
        "value": "当社は、個人情報の漏えい、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。",
        "section": "page"
      },
      {
        "id": "text_94cb4f74",
        "label": "第8条（個人情報の開示・訂正・利用停止等）",
        "value": "第8条（個人情報の開示・訂正・利用停止等）",
        "section": "page"
      },
      {
        "id": "text_3b54a52f",
        "label": "当社は、お客様ご本人から個人情報の開示、訂正、追加、削除、利用停止を求められた場合には、ご…",
        "value": "当社は、お客様ご本人から個人情報の開示、訂正、追加、削除、利用停止を求められた場合には、ご本人であることを確認のうえ、法令に従い遅滞なく対応します。お手続きの詳細は、下記お問い合わせ窓口までご連絡ください。",
        "section": "page"
      },
      {
        "id": "text_215e9da3",
        "label": "第9条（本ポリシーの変更）",
        "value": "第9条（本ポリシーの変更）",
        "section": "page"
      },
      {
        "id": "text_e6d79729",
        "label": "本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、お客様に通知するこ…",
        "value": "本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、お客様に通知することなく変更することができるものとします。変更後の内容は、本サイトに掲載した時点から効力を生じるものとします。",
        "section": "page"
      },
      {
        "id": "text_9a779f43",
        "label": "第10条（お問い合わせ窓口）",
        "value": "第10条（お問い合わせ窓口）",
        "section": "page"
      },
      {
        "id": "text_34a3e7",
        "label": "本ポリシーに関するお問い合わせは、下記までご連絡ください。",
        "value": "本ポリシーに関するお問い合わせは、下記までご連絡ください。",
        "section": "page"
      },
      {
        "id": "text_136438f0",
        "label": "お問い合わせフォーム：",
        "value": "お問い合わせフォーム：",
        "section": "page"
      },
      {
        "id": "text_35d80336",
        "label": "お問い合わせページ",
        "value": "お問い合わせページ",
        "section": "page"
      }
    ]
  },
  "site-policy": {
    "title": "サイトポリシー",
    "fields": [
      {
        "id": "text_9d314779",
        "label": "サイトポリシー | STAGE PARTNERS",
        "value": "サイトポリシー | STAGE PARTNERS",
        "section": "page"
      },
      {
        "id": "text_4ef98e50",
        "label": "株式会社STAGE PARTNERSが運営する本サイトのご利用にあたっての注意事項です。",
        "value": "株式会社STAGE PARTNERSが運営する本サイトのご利用にあたっての注意事項です。",
        "section": "page"
      },
      {
        "id": "text_a0fac228",
        "label": "サイトポリシー",
        "value": "サイトポリシー",
        "section": "page"
      },
      {
        "id": "text_c02d9817",
        "label": "本サイト（stagepartners-hp1.vercel.app、以下「本サイト」といい…",
        "value": "本サイト（stagepartners-hp1.vercel.app、以下「本サイト」といいます）は、株式会社STAGE PARTNERS（以下「当社」といいます）が運営しています。本サイトのご利用にあたっては、以下の内容をご確認ください。",
        "section": "page"
      },
      {
        "id": "text_f0e09fe7",
        "label": "2026年8月25日",
        "value": "2026年8月25日",
        "section": "page"
      },
      {
        "id": "text_ed13a5f4",
        "label": "著作権について",
        "value": "著作権について",
        "section": "page"
      },
      {
        "id": "text_22903841",
        "label": "本サイトに掲載されている文章、画像、写真、ロゴ、その他すべてのコンテンツの著作権は、当社ま…",
        "value": "本サイトに掲載されている文章、画像、写真、ロゴ、その他すべてのコンテンツの著作権は、当社または正当な権利を有する第三者に帰属します。法令で認められる場合を除き、事前の許諾なく複製、転載、改変、二次利用することはできません。",
        "section": "page"
      },
      {
        "id": "text_e8f8e7c8",
        "label": "施工実績の掲載について",
        "value": "施工実績の掲載について",
        "section": "page"
      },
      {
        "id": "text_c9b42e52",
        "label": "本サイトに掲載する施工実績の一部は、グループ会社が施工したものを含みます。掲載にあたっては…",
        "value": "本サイトに掲載する施工実績の一部は、グループ会社が施工したものを含みます。掲載にあたっては、施工主体を含めた表記の正確性に努めています。",
        "section": "page"
      },
      {
        "id": "text_62031e66",
        "label": "リンクについて",
        "value": "リンクについて",
        "section": "page"
      },
      {
        "id": "text_cd64388a",
        "label": "本サイトへのリンクは、原則として自由に設定いただけます。ただし、当社または本サイトの信用を…",
        "value": "本サイトへのリンクは、原則として自由に設定いただけます。ただし、当社または本サイトの信用を損なう可能性のある形での設定はご遠慮ください。また、本サイトから他社サイトへのリンクは、リンク先の内容について当社が保証するものではありません。",
        "section": "page"
      },
      {
        "id": "text_36a0c950",
        "label": "免責事項",
        "value": "免責事項",
        "section": "page"
      },
      {
        "id": "text_f9b4f9d9",
        "label": "当社は、本サイトに掲載する情報の正確性・最新性の維持に努めていますが、その内容を保証するも…",
        "value": "当社は、本サイトに掲載する情報の正確性・最新性の維持に努めていますが、その内容を保証するものではありません。本サイトの情報を利用したことにより生じたいかなる損害についても、当社は責任を負わないものとします。",
        "section": "page"
      },
      {
        "id": "text_44ca8029",
        "label": "本サイトは、予告なく内容の変更、掲載の中止、公開の停止を行うことがあります。",
        "value": "本サイトは、予告なく内容の変更、掲載の中止、公開の停止を行うことがあります。",
        "section": "page"
      },
      {
        "id": "text_c3164f6c",
        "label": "推奨環境",
        "value": "推奨環境",
        "section": "page"
      },
      {
        "id": "text_2357e388",
        "label": "本サイトは、最新版のGoogle Chrome、Safari、Microsoft Edge…",
        "value": "本サイトは、最新版のGoogle Chrome、Safari、Microsoft Edge等の主要なブラウザでの閲覧を想定して制作しています。ブラウザの設定や機種によっては、正しく表示されない場合があります。",
        "section": "page"
      },
      {
        "id": "text_2a069080",
        "label": "アクセス解析について",
        "value": "アクセス解析について",
        "section": "page"
      },
      {
        "id": "text_cb6d693e",
        "label": "本サイトは、2026年8月時点においてアクセス解析ツールを利用していません。導入する場合は…",
        "value": "本サイトは、2026年8月時点においてアクセス解析ツールを利用していません。導入する場合は、",
        "section": "page"
      },
      {
        "id": "text_89685dc6",
        "label": "プライバシーポリシー",
        "value": "プライバシーポリシー",
        "section": "page"
      },
      {
        "id": "text_a749f35d",
        "label": "にあわせて本ページを改定します。",
        "value": "にあわせて本ページを改定します。",
        "section": "page"
      },
      {
        "id": "text_aa892fb9",
        "label": "準拠法・管轄裁判所",
        "value": "準拠法・管轄裁判所",
        "section": "page"
      },
      {
        "id": "text_b32240cf",
        "label": "本ポリシーの解釈にあたっては、日本法を準拠法とします。本サイトに関して当社とお客様との間で…",
        "value": "本ポリシーの解釈にあたっては、日本法を準拠法とします。本サイトに関して当社とお客様との間で紛争が生じた場合には、当社本店所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。",
        "section": "page"
      }
    ]
  },
  "tokushoho": {
    "title": "特定商取引法に基づく表記",
    "fields": [
      {
        "id": "text_54073f3e",
        "label": "特定商取引法に基づく表記 | STAGE PARTNERS",
        "value": "特定商取引法に基づく表記 | STAGE PARTNERS",
        "section": "page"
      },
      {
        "id": "text_d34e579b",
        "label": "株式会社STAGE PARTNERSの特定商取引法に基づく表記です。",
        "value": "株式会社STAGE PARTNERSの特定商取引法に基づく表記です。",
        "section": "page"
      },
      {
        "id": "text_8d4b30b5",
        "label": "特定商取引法に基づく表記",
        "value": "特定商取引法に基づく表記",
        "section": "page"
      },
      {
        "id": "text_26971c89",
        "label": "本サイトは、不動産の仲介・管理・買取再販、建築・リフォームに関するご相談・お問い合わせの受…",
        "value": "本サイトは、不動産の仲介・管理・買取再販、建築・リフォームに関するご相談・お問い合わせの受付を目的としており、サイト上での商品の通信販売やオンライン決済は行っておりません。特定商取引法（第11条）に基づき、以下のとおり表示します。",
        "section": "page"
      },
      {
        "id": "text_f0e09fe7",
        "label": "2026年8月25日",
        "value": "2026年8月25日",
        "section": "page"
      },
      {
        "id": "text_dc2ba448",
        "label": "事業者・所在地・連絡先",
        "value": "事業者・所在地・連絡先",
        "section": "page"
      },
      {
        "id": "text_8a948468",
        "label": "販売業者",
        "value": "販売業者",
        "section": "page"
      },
      {
        "id": "text_c62aae6b",
        "label": "運営統括責任者",
        "value": "運営統括責任者",
        "section": "page"
      },
      {
        "id": "text_372b8b13",
        "label": "代表取締役",
        "value": "代表取締役",
        "section": "page"
      },
      {
        "id": "text_922b61e0",
        "label": "※個人名の表記は、",
        "value": "※個人名の表記は、",
        "section": "page"
      },
      {
        "id": "text_ce2d4a1a",
        "label": "会社概要ページ",
        "value": "会社概要ページ",
        "section": "page"
      },
      {
        "id": "text_c9976df3",
        "label": "と同じ方針により省略しています。お問い合わせいただいた際に担当者よりご案内します。",
        "value": "と同じ方針により省略しています。お問い合わせいただいた際に担当者よりご案内します。",
        "section": "page"
      },
      {
        "id": "text_ece821ff",
        "label": "所在地",
        "value": "所在地",
        "section": "page"
      },
      {
        "id": "text_bb393442",
        "label": "電話番号",
        "value": "電話番号",
        "section": "page"
      },
      {
        "id": "text_1f2ef4c3",
        "label": "受付時間　",
        "value": "受付時間　",
        "section": "page"
      },
      {
        "id": "text_6eda855c",
        "label": "お問い合わせ",
        "value": "お問い合わせ",
        "section": "page"
      },
      {
        "id": "text_bf0ec64a",
        "label": "お問い合わせフォーム",
        "value": "お問い合わせフォーム",
        "section": "page"
      },
      {
        "id": "text_910169e3",
        "label": "よりご連絡ください。",
        "value": "よりご連絡ください。",
        "section": "page"
      },
      {
        "id": "text_6a49f7db",
        "label": "事業内容",
        "value": "事業内容",
        "section": "page"
      },
      {
        "id": "text_8ed28038",
        "label": "不動産ソリューション（仲介・管理・買取再販）、建築ソリューション（新規出店・リノベーション…",
        "value": "不動産ソリューション（仲介・管理・買取再販）、建築ソリューション（新規出店・リノベーション・営繕）。詳細は",
        "section": "page"
      },
      {
        "id": "text_28f6c7df",
        "label": "事業内容ページ",
        "value": "事業内容ページ",
        "section": "page"
      },
      {
        "id": "text_e2ff9308",
        "label": "をご覧ください。",
        "value": "をご覧ください。",
        "section": "page"
      },
      {
        "id": "text_23f137d",
        "label": "料金・お見積りについて",
        "value": "料金・お見積りについて",
        "section": "page"
      },
      {
        "id": "text_2eec4d57",
        "label": "仲介手数料、工事費用等は、物件の状況・工事内容により個別に異なります。正式なご依頼の前に、…",
        "value": "仲介手数料、工事費用等は、物件の状況・工事内容により個別に異なります。正式なご依頼の前に、必ず個別のお見積りをご提示し、ご了承をいただいたうえで契約手続きに進みます。サイト上での価格提示や、その場でのオンライン決済は行っておりません。",
        "section": "page"
      },
      {
        "id": "text_9ad02749",
        "label": "契約の成立・引渡時期",
        "value": "契約の成立・引渡時期",
        "section": "page"
      },
      {
        "id": "text_b45a0e6a",
        "label": "不動産の仲介・売買、および工事の請負契約は、それぞれの取引に定める重要事項説明・契約書の締…",
        "value": "不動産の仲介・売買、および工事の請負契約は、それぞれの取引に定める重要事項説明・契約書の締結をもって成立します。引渡し・着工・完工の時期は、個別の契約書に定めるとおりとします。",
        "section": "page"
      },
      {
        "id": "text_9bd34118",
        "label": "お支払い方法・キャンセルについて",
        "value": "お支払い方法・キャンセルについて",
        "section": "page"
      },
      {
        "id": "text_de46b6df",
        "label": "お支払い方法・お支払い時期は、契約締結時に個別にご案内します。契約後のキャンセル・変更につ…",
        "value": "お支払い方法・お支払い時期は、契約締結時に個別にご案内します。契約後のキャンセル・変更については、宅地建物取引業法・建設業法等の関係法令、および個別の契約書に定める条件に従います。",
        "section": "page"
      },
      {
        "id": "text_b935f4c4",
        "label": "許認可",
        "value": "許認可",
        "section": "page"
      },
      {
        "id": "text_7c0f463c",
        "label": "宅地建物取引業免許、一般建設業登録、一級建築士事務所登録。登録番号を含む詳細は",
        "value": "宅地建物取引業免許、一般建設業登録、一級建築士事務所登録。登録番号を含む詳細は",
        "section": "page"
      },
      {
        "id": "text_7e666eeb",
        "label": "に掲載しています。",
        "value": "に掲載しています。",
        "section": "page"
      }
    ]
  },
  "common": {
    "title": "共通設定",
    "fields": [
      {
        "id": "text_6a49f7db",
        "label": "事業内容",
        "value": "事業内容",
        "section": "Footer"
      },
      {
        "id": "text_5e621c1",
        "label": "不動産ソリューション",
        "value": "不動産ソリューション",
        "section": "Header"
      },
      {
        "id": "text_c8c44591",
        "label": "建築ソリューション",
        "value": "建築ソリューション",
        "section": "Header"
      },
      {
        "id": "text_f33cfe72",
        "label": "施工実績",
        "value": "施工実績",
        "section": "Footer"
      },
      {
        "id": "text_828b9630",
        "label": "会社概要",
        "value": "会社概要",
        "section": "Footer"
      },
      {
        "id": "text_b47a04b8",
        "label": "お知らせ",
        "value": "お知らせ",
        "section": "Footer"
      },
      {
        "id": "text_6eda855c",
        "label": "お問い合わせ",
        "value": "お問い合わせ",
        "section": "Footer"
      },
      {
        "id": "text_93229e36",
        "label": "STAGE PARTNERS トップへ",
        "value": "STAGE PARTNERS トップへ",
        "section": "Footer"
      },
      {
        "id": "text_b8c6b5cf",
        "label": "メインナビゲーション",
        "value": "メインナビゲーション",
        "section": "Header"
      },
      {
        "id": "text_ae12f962",
        "label": "メニューを開閉する",
        "value": "メニューを開閉する",
        "section": "Header"
      },
      {
        "id": "text_39f8b56",
        "label": "モバイルナビゲーション",
        "value": "モバイルナビゲーション",
        "section": "Header"
      },
      {
        "id": "text_89685dc6",
        "label": "プライバシーポリシー",
        "value": "プライバシーポリシー",
        "section": "Footer"
      },
      {
        "id": "text_a0fac228",
        "label": "サイトポリシー",
        "value": "サイトポリシー",
        "section": "Footer"
      },
      {
        "id": "text_8d4b30b5",
        "label": "特定商取引法に基づく表記",
        "value": "特定商取引法に基づく表記",
        "section": "Footer"
      },
      {
        "id": "text_5d8943a2",
        "label": "フッターナビゲーション",
        "value": "フッターナビゲーション",
        "section": "Footer"
      },
      {
        "id": "text_7303f6df",
        "label": "© STAGE PARTNERS All Rights Reserved.",
        "value": "© STAGE PARTNERS All Rights Reserved.",
        "section": "Footer"
      },
      {
        "id": "text_a2d7795e",
        "label": "法的情報",
        "value": "法的情報",
        "section": "Footer"
      },
      {
        "id": "text_9a3cbf23",
        "label": "株式会社STAGE PARTNERS",
        "value": "株式会社STAGE PARTNERS",
        "section": "company"
      },
      {
        "id": "text_a7fef455",
        "label": "静岡県沼津市高島本町16-16",
        "value": "静岡県沼津市高島本町16-16",
        "section": "company"
      },
      {
        "id": "text_dd437a7a",
        "label": "静岡オフィス",
        "value": "静岡オフィス",
        "section": "company"
      },
      {
        "id": "text_e39a527b",
        "label": "静岡県沼津市米山町1-5",
        "value": "静岡県沼津市米山町1-5",
        "section": "company"
      },
      {
        "id": "text_32ad956d",
        "label": "東京オフィス",
        "value": "東京オフィス",
        "section": "company"
      },
      {
        "id": "text_b3e247b",
        "label": "東京都港区浜松町2-7-13 Biz Feel浜松町3F",
        "value": "東京都港区浜松町2-7-13 Biz Feel浜松町3F",
        "section": "company"
      },
      {
        "id": "text_fccc3386",
        "label": "平日 9:00–18:00",
        "value": "平日 9:00–18:00",
        "section": "company"
      },
      {
        "id": "text_a9d9086a",
        "label": "不動産の購入のご相談",
        "value": "不動産の購入のご相談",
        "section": "company"
      },
      {
        "id": "text_65e1df8f",
        "label": "不動産の売却・買取のご相談",
        "value": "不動産の売却・買取のご相談",
        "section": "company"
      },
      {
        "id": "text_8035fc0a",
        "label": "賃貸・空室のご相談",
        "value": "賃貸・空室のご相談",
        "section": "company"
      },
      {
        "id": "text_3190d2b4",
        "label": "新規出店のご相談",
        "value": "新規出店のご相談",
        "section": "company"
      },
      {
        "id": "text_8e74d970",
        "label": "建物・入居者の管理のご相談",
        "value": "建物・入居者の管理のご相談",
        "section": "company"
      },
      {
        "id": "text_5d73e3e4",
        "label": "リフォーム・改修のご相談",
        "value": "リフォーム・改修のご相談",
        "section": "company"
      },
      {
        "id": "text_948d350c",
        "label": "建物・設備の営繕修繕のご相談",
        "value": "建物・設備の営繕修繕のご相談",
        "section": "company"
      },
      {
        "id": "text_938f0c1f",
        "label": "その他のお問い合わせ",
        "value": "その他のお問い合わせ",
        "section": "company"
      },
      {
        "id": "text_c507912f",
        "label": "本社郵便番号",
        "value": "410-0055",
        "section": "content/company.ts"
      },
      {
        "id": "text_bb9a5bba",
        "label": "静岡オフィス 電話番号",
        "value": "055-939-5036",
        "section": "content/company.ts"
      },
      {
        "id": "text_9fc4f9ab",
        "label": "東京オフィス 電話番号",
        "value": "03-5432-9350",
        "section": "content/company.ts"
      }
    ]
  }
};
