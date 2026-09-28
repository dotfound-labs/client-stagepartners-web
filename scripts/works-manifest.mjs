/**
 * 施工実績の案件定義。
 * デスクトップの素材フォルダ(建築/・解体/)と、サイト上の案件を対応づける。
 * ここを直して build-works-images.mjs を再実行すれば public/works が作り直される。
 */
export const SRC_ROOT = process.env.WORKS_SRC || `${process.env.HOME}/Desktop`;

// category: "store" = 店舗・住宅施工 / "facility" = 施設営繕・解体
export const COVER_OVERRIDE = {
  "kanogawa": "after-02.jpg",
  "tokuzomaru-hiroba": "after-03.jpg",
  "memorial-garden-site": "after-04.jpg"
};

export const PROJECTS = [
  // --- 施工前後が揃っている案件 ---
  { slug: "kanogawa", title: "狩野川店舗", type: "店舗 / 内外装改修", category: "store",
    before: "建築/⭐️狩野川店舗内外装改修工事施工前", after: "建築/⭐️狩野川店舗内外装改修工事施工後" },
  { slug: "shofuku", title: "松福 焼津店", type: "飲食店 / 新装", category: "store",
    before: "建築/⭐️松福焼津店施工前", after: "建築/⭐️松福焼津店施工後" },
  { slug: "tanakatei", title: "田中亭 三島スカイウォーク店", type: "飲食店 / 新装", category: "store",
    before: "建築/⭐️田中三島スカイウォーク店施工前", after: "建築/⭐️田中亭三島スカイウォーク店施工後" },
  { slug: "tokuzomaru", title: "徳造丸 沼津港店", type: "飲食店 / 新装", category: "store",
    before: "建築/⭐️徳造丸沼津港店施工前", after: "建築/⭐️徳造丸沼津港店施工後" },
  { slug: "tokuzomaru-kakoujou", title: "徳造丸 沼津港店 加工場", type: "加工場 / 新設", category: "store",
    before: "建築/⭐️徳造丸沼津港店加工場施工前", after: "建築/⭐️徳造丸沼津港店加工場施工後" },
  { slug: "tokuzomaru-omiyage", title: "徳造丸 沼津港店 御土産店", type: "物販店 / 新装", category: "store",
    before: "建築/⭐️徳造丸沼津港店御土産店施工前", after: "建築/⭐️徳造丸沼津港店御土産店施工後" },
  { slug: "tokuzomaru-hiroba", title: "徳造丸 沼津港店 広場", type: "外構 / 整備", category: "store",
    before: "建築/⭐️徳造丸沼津港店広場施工前", after: "建築/⭐️徳造丸沼津港店広場施工後" },
  { slug: "kizawakogyo", title: "木澤工業", type: "事務所 / リノベーション", category: "store",
    before: "建築/⭐️木澤工業リノベーション工事施工前", after: "建築/⭐️木澤工業リノベーション工事施工後" },
  { slug: "zentoku", title: "ゼントクコーポレーション", type: "オフィス / 改装", category: "store",
    before: "建築/ゼントクコーポレーションオフィス改装前", after: "建築/ゼントクコーポレーションオフィス改装後" },
  { slug: "level", title: "Level sis", type: "店舗 / 新装", category: "store",
    before: "建築/1224新規アップ/Level施工前", after: "建築/1224新規アップ/Level施工後" },
  { slug: "issekisancho", title: "厳選焼鳥 一石三鳥", type: "飲食店 / 新装", category: "store",
    before: "建築/一石三鳥（施工前）", after: "建築/一石三鳥" },
  { slug: "toshin-mishima", title: "東進衛星予備校 三島校", type: "学習塾 / 新装", category: "store",
    before: "建築/東進衛生予備校三島校(施工前)", after: "建築/東進衛生予備校三島校" },
  { slug: "toshin-shimizu", title: "東進衛星予備校 清水校", type: "学習塾 / 新装", category: "store",
    before: "建築/東進衛生予備校清水校(施工前)", after: "建築/東進衛生予備校清水校" },
  { slug: "baseball-studio", title: "室内野球練習場", type: "スポーツ施設 / 新装", category: "store",
    before: "建築/室内野球練習場(施工前)", after: "建築/室内野球練習場" },
  { slug: "karumen-susono", title: "黄金トマトのカル麺 裾野店", type: "飲食店 / 新装", category: "store",
    before: "建築/黄金トマトのカル麺裾野店(施工前)", after: "建築/黄金トマトのカル麺裾野店" },
  { slug: "karumen-mishima", title: "黄金トマトのカル麺 三島スカイウォーク店", type: "飲食店 / 新装", category: "store",
    before: "建築/黄金トマトのカル麺三島スカイウォーク店(施工前)", after: "建築/黄金トマトのカル麺三島スカイウォーク店" },
  { slug: "laseed", title: "La.seed", type: "スポーツバー / 改装", category: "store",
    before: "建築/La.seed(施工前)", after: "建築/La.seed" },
  { slug: "laviola", title: "Laviola", type: "店舗 / 新装", category: "store",
    before: "建築/Laviola(施工前)", after: "建築/Laviola" },
  { slug: "okaeru", title: "Lounge Bar THE OKAERU", type: "飲食店 / 新装", category: "store",
    before: "建築/lounge bar THE OKAERU(施工前)", after: "建築/lounge bar THE OKAERU" },
  { slug: "ph-komazawa", title: "ピタットハウス 駒澤大学店", type: "事務所 / 新装", category: "store",
    before: "建築/ピタットハウス駒澤大学店(施工前)", after: "建築/ピタットハウス駒澤大学店" },
  { slug: "mobile-shop", title: "携帯ショップ", type: "物販店 / 改装", category: "store",
    before: "建築/携帯ショップ(施工前)", after: "建築/携帯ショップ" },
  { slug: "shibuya-daidokoroya", title: "渋谷 台所家", type: "飲食店 / 新装", category: "store",
    before: "建築/渋谷台所屋(施工前)", after: "建築/渋谷台所屋" },
  { slug: "sports-lounge", title: "スポーツ施設ラウンジ", type: "スポーツ施設 / 改装", category: "store",
    before: "建築/スポーツ施設ラウンジ(施工前)", after: "建築/スポーツ施設ラウンジ施工" },
  // --- 施工後のみ ---
  { slug: "deltaring-gym", title: "DELTARING GYM", type: "スポーツ施設 / 新装", category: "store",
    after: "建築/DELTARING GYM/デルタリングジム" },
  { slug: "yokohama-kohoku", title: "横浜港北区 住宅リノベーション", type: "住宅 / リノベーション", category: "store",
    after: "建築/横浜港北区住宅リノベーション" },
  // 2026-09-28訂正: 旧パス"建築/メモリアルガーデン(施工中)"は未整理の生写真フォルダで、
  // 番号順に厳選済みの正しいフォルダは「管理棟」/「管理棟(施工前)」。
  { slug: "memorial-garden-site", title: "メモリアルガーデン様　管理棟", type: "霊園管理棟 / 新築", category: "store",
    before: "建築/メモリアルガーデン管理棟(施工前)", after: "建築/メモリアルガーデン管理棟" },

  // --- 施設営繕・解体 ---
  { slug: "roppongi-kaitai", title: "六本木飲食店 解体工事", type: "飲食店 / 解体", category: "facility",
    before: "解体/六本木飲食店解体前", after: "解体/六本木飲食店解体後" },
  // pachinko-kaitai/namakon-kaitai/viva-genjokaifuku: 施工前後が別フォルダに分かれておらず、
  // 同一フォルダ内に「解体前①②」「解体後①②」が混在している(2026-09-28確認)。
  { slug: "pachinko-kaitai", title: "パチンコ店 解体工事", type: "遊技場 / 解体", category: "facility",
    before: "解体/解体工事(パチンコ店)", after: "解体/解体工事(パチンコ店)" },
  { slug: "namakon-kaitai", title: "静岡生コン 解体工事", type: "プラント / 解体", category: "facility",
    before: "解体/解体工事(静岡生コン)", after: "解体/解体工事(静岡生コン)" },
  { slug: "viva-genjokaifuku", title: "ビバモール甲斐敷島 テナント原状回復工事", type: "商業施設 / 原状回復", category: "facility",
    before: "解体/ビバモール甲斐敷島テナント原状回復工事", after: "解体/ビバモール甲斐敷島テナント原状回復工事" },
];
