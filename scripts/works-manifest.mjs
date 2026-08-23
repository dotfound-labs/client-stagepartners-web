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
  "memorial-garden": "after-02.jpg",
  "memorial-garden-site": "after-04.jpg",
  "mansion-renovation": "after-04.jpg"
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
  { slug: "memorial-garden", title: "メモリアルガーデン 管理棟", type: "管理棟 / 新築", category: "store",
    before: "建築/メモリアルガーデン管理棟(施工前)", after: "建築/メモリアルガーデン管理棟" },
  { slug: "karumen-susono", title: "黄金トマトのカル麺 裾野店", type: "飲食店 / 新装", category: "store",
    before: "建築/黄金トマトのカル麺裾野店(施工前)", after: "建築/黄金トマトのカル麺裾野店" },
  { slug: "karumen-numazu", title: "黄金トマトのカル麺 沼津店", type: "飲食店 / 居抜き改装", category: "store",
    before: "建築/黄金トマトのカル麺沼津店(施工前居抜物件)", after: "建築/黄金トマトのカル麺沼津店" },
  { slug: "karumen-mishima", title: "黄金トマトのカル麺 三島スカイウォーク店", type: "飲食店 / 新装", category: "store",
    before: "建築/黄金トマトのカル麺三島スカイウォーク店(施工前)", after: "建築/黄金トマトのカル麺三島スカイウォーク店" },
  { slug: "laseed", title: "La.seed", type: "美容室 / 新装", category: "store",
    before: "建築/La.seed(施工前)", after: "建築/La.seed" },
  { slug: "laviola", title: "Laviola", type: "店舗 / 新装", category: "store",
    before: "建築/Laviola(施工前)", after: "建築/Laviola" },
  { slug: "okaeru", title: "Lounge Bar THE OKAERU", type: "飲食店 / 新装", category: "store",
    before: "建築/lounge bar THE OKAERU(施工前)", after: "建築/lounge bar THE OKAERU" },
  { slug: "ph-komazawa", title: "ピタットハウス 駒澤大学店", type: "事務所 / 新装", category: "store",
    before: "建築/ピタットハウス駒澤大学店(施工前)", after: "建築/ピタットハウス駒澤大学店" },
  { slug: "whitening-shop", title: "ホワイトニングショップ", type: "クリニック / 新装", category: "store",
    before: "建築/ホワイトニングショップ(施工前)", after: "建築/ホワイトニングショップ" },
  { slug: "mobile-shop", title: "携帯ショップ", type: "物販店 / 改装", category: "store",
    before: "建築/携帯ショップ(施工前)", after: "建築/携帯ショップ" },
  { slug: "koryoriya", title: "小料理屋", type: "飲食店 / 新装", category: "store",
    before: "建築/小料理屋(施工前)", after: "建築/小料理屋" },
  { slug: "shibuya-daidokoroya", title: "渋谷 台所屋", type: "飲食店 / 新装", category: "store",
    before: "建築/渋谷台所屋(施工前)", after: "建築/渋谷台所屋" },
  { slug: "pachinko-renewal", title: "パチンコ店 改装", type: "遊技場 / 改装", category: "store",
    before: "建築/パチンコ店改装前", after: "建築/パチンコ店改装後" },
  { slug: "sports-lounge", title: "スポーツ施設ラウンジ", type: "スポーツ施設 / 改装", category: "store",
    before: "建築/スポーツ施設ラウンジ(施工前)", after: "建築/スポーツ施設ラウンジ施工" },
  { slug: "atami-mansion", title: "熱海マンション", type: "住宅 / リノベーション", category: "store",
    before: "建築/熱海マンション(施工前)", after: "建築/熱海マンション" },
  { slug: "mansion-renovation", title: "マンションリノベーション", type: "住宅 / リノベーション", category: "store",
    before: "建築/マンションリノベーション(施工前)", after: "建築/マンションリノベーション" },

  // --- 施工後のみ ---
  { slug: "deltaring-gym", title: "DELTARING GYM", type: "スポーツ施設 / 新装", category: "store",
    after: "建築/DELTARING GYM/デルタリングジム" },
  { slug: "yokohama-kohoku", title: "横浜港北区 住宅リノベーション", type: "住宅 / リノベーション", category: "store",
    after: "建築/横浜港北区住宅リノベーション" },
  { slug: "yokohama-tachinomi", title: "横浜 立ち飲み屋", type: "飲食店 / 新装", category: "store",
    after: "建築/横浜立ち飲み屋店舗" },
  { slug: "memorial-garden-site", title: "メモリアルガーデン", type: "霊園 / 整備", category: "store",
    after: "建築/メモリアルガーデン(施工中)" },

  // --- 施設営繕・解体 ---
  { slug: "roppongi-kaitai", title: "六本木飲食店 解体工事", type: "飲食店 / 解体", category: "facility",
    before: "解体/六本木飲食店解体前", after: "解体/六本木飲食店解体後" },
  { slug: "pachinko-kaitai", title: "パチンコ店 解体工事", type: "遊技場 / 解体", category: "facility",
    after: "解体/解体工事(パチンコ店)" },
  { slug: "namakon-kaitai", title: "静岡生コン 解体工事", type: "プラント / 解体", category: "facility",
    after: "解体/解体工事(静岡生コン)" },
  { slug: "viva-genjokaifuku", title: "ビバモール甲斐敷島 テナント原状回復工事", type: "商業施設 / 原状回復", category: "facility",
    after: "解体/ビバモール甲斐敷島テナント原状回復工事" },
];
