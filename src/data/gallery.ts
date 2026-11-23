import type { LocalizedText } from "@/lib/i18n";

export type GalleryCategoryKey =
  | "all"
  | "savoury"
  | "sweet"
  | "mains"
  | "craft";

export const galleryCategoryLabels: Record<GalleryCategoryKey, LocalizedText> = {
  all: { en: "All", zh: "全部" },
  savoury: { en: "Savoury Jian Bing", zh: "招牌咸味煎饼" },
  sweet: { en: "Sweet & Lace Crepes", zh: "花式甜煎饼" },
  mains: { en: "Mains & Snacks", zh: "热菜与小吃" },
  craft: { en: "Craft & Brand", zh: "手艺与品牌" },
};

export interface GalleryItem {
  id: string;
  src: string;
  alt: LocalizedText;
  caption: LocalizedText;
  category: Exclude<GalleryCategoryKey, "all">;
  width: number;
  height: number;
}

export const galleryCategories: GalleryCategoryKey[] = [
  "all",
  "savoury",
  "sweet",
  "mains",
  "craft",
];

export const galleryItems: GalleryItem[] = [
  {
    id: "hero-platter",
    src: "/images/hero-jianbing-platter.jpg",
    alt: {
      en: "Herb-studded savoury Jian Bing crepe sliced on a white plate beside the Jian Bing Liu kraft sleeve",
      zh: "刚出锅对半切开的招牌果蔬咸味煎饼，旁放印有煎饼刘字样的牛皮纸袋",
    },
    caption: {
      en: "Signature savoury Jian Bing, fresh off the griddle",
      zh: "招牌果蔬咸味煎饼——热气腾腾刚出锅",
    },
    category: "savoury",
    width: 1600,
    height: 1067,
  },
  {
    id: "chef-lace-crepe",
    src: "/images/chef-lace-crepe.jpg",
    alt: {
      en: "Chef at Jian Bing Liu smiling in branded black apron while lifting a freshly cooked lacy pink-edged crepe",
      zh: "煎饼刘主厨身穿印有煎饼刘字样的黑色围裙，面带微笑举起刚摊好的粉色蕾丝边煎饼",
    },
    caption: {
      en: "Handmade fancy lace crepes lifted hot from the griddle",
      zh: "铁板现摊的手工花式蕾丝煎饼",
    },
    category: "craft",
    width: 1200,
    height: 1600,
  },
  {
    id: "beef-crepe-sleeve",
    src: "/images/beef-crepe-sleeve.jpg",
    alt: {
      en: "Sesame-crusted savoury Jian Bing loaded with crispy fried layers and fresh lettuce inside a warm kraft sleeve",
      zh: "撒满黑芝麻、夹满酥脆配料与生菜的咸味煎饼装在暖黄色牛皮纸袋里",
    },
    caption: {
      en: "Black sesame crust & golden crunch in our signature sleeve",
      zh: "黑芝麻焦香饼皮，装进标志性牛皮纸袋",
    },
    category: "savoury",
    width: 1600,
    height: 1067,
  },
  {
    id: "nutella-strawberry-crepe",
    src: "/images/nutella-strawberry-crepe.jpg",
    alt: {
      en: "Sweet folded crepe topped with fresh sliced strawberries, banana, whipped cream, and dark chocolate drizzle on a wooden heart board",
      zh: "心形木盘上的折叠甜煎饼，铺满鲜草莓、香蕉片、淡奶油与巧克力酱",
    },
    caption: {
      en: "Fresh strawberry, banana & chocolate sweet crepe",
      zh: "鲜草莓香蕉巧克力甜煎饼",
    },
    category: "sweet",
    width: 1600,
    height: 1200,
  },
  {
    id: "veggie-crepe-griddle",
    src: "/images/veggie-crepe-griddle.jpg",
    alt: {
      en: "Naturally tinted pink and green fruit-and-vegetable batter crepe topped with herbs on the hot cast-iron griddle",
      zh: "热圆铁板上自然调色的粉绿双色果蔬面糊煎饼，铺满鲜嫩蔬菜与香葱",
    },
    caption: {
      en: "Naturally coloured fruit & veg batter on the griddle",
      zh: "天然果蔬双色面糊，铁板现场摊制",
    },
    category: "savoury",
    width: 1200,
    height: 1600,
  },
  {
    id: "beef-dumplings-plate",
    src: "/images/beef-dumplings-plate.jpg",
    alt: {
      en: "Crispy pan-fried golden dumplings served on a red lacquer-style plate with dipping sauce and fresh salad leaves",
      zh: "红盘上金黄酥脆的牛肉煎饺，搭配秘制蘸料与新鲜生菜",
    },
    caption: {
      en: "Golden pan-fried beef dumplings with house dipping sauce",
      zh: "金黄脆底牛肉煎饺配秘制蘸汁",
    },
    category: "mains",
    width: 1200,
    height: 1600,
  },
  {
    id: "jianbing-apron-hero",
    src: "/images/jianbing-apron-hero.jpg",
    alt: {
      en: "Loaded savoury Jian Bing crepe held in a kraft wrapper in front of the embroidered Pancake Liu 煎饼刘 apron",
      zh: "牛皮纸袋中满满当当的咸味煎饼，背景为印有煎饼刘与爱民印章的黑色围裙",
    },
    caption: {
      en: "Packed with crisp greens, shredded potato & golden crunch",
      zh: "满满生菜、爽脆土豆丝与金黄薄脆",
    },
    category: "craft",
    width: 1200,
    height: 1600,
  },
  {
    id: "fancy-lace-dessert-cone",
    src: "/images/fancy-lace-dessert-cone.jpg",
    alt: {
      en: "Hand-piped pink lace crepe cone overflowing with whipped cream, fresh fruit, matcha biscuit sticks, and bear biscuits",
      zh: "粉色蕾丝边甜筒煎饼，装满奶油、鲜草莓、抹茶饼干棒与可爱小熊饼干",
    },
    caption: {
      en: "Fancy lace sweet crepe cone with cream & biscuit sticks",
      zh: "花式蕾丝奶油水果甜筒煎饼",
    },
    category: "sweet",
    width: 1200,
    height: 1600,
  },
  {
    id: "golden-sesame-jianbing",
    src: "/images/golden-sesame-jianbing.jpg",
    alt: {
      en: "Close-up of a golden egg-brushed Jian Bing speckled with black sesame seeds and sliced to reveal shredded fillings",
      zh: "金黄蛋香饼皮撒满黑芝麻，切开露出脆嫩蔬菜与满满内馅",
    },
    caption: {
      en: "Egg-brushed golden batter with toasted black sesame",
      zh: "焦香蛋皮撒黑芝麻，口口酥脆",
    },
    category: "savoury",
    width: 1600,
    height: 1067,
  },
  {
    id: "braised-beef-rice",
    src: "/images/braised-beef-rice.jpg",
    alt: {
      en: "Slow-braised beef with carrots and potatoes served alongside heart-shaped steamed white rice on a white platter",
      zh: "白瓷长盘上软烂入味的土豆胡萝卜炖牛肉配心形白米饭",
    },
    caption: {
      en: "Slow-braised beef with potatoes, carrots & steamed rice",
      zh: "慢炖土豆胡萝卜牛肉配热白米饭",
    },
    category: "mains",
    width: 1200,
    height: 1600,
  },
  {
    id: "vegan-japanese-curry",
    src: "/images/vegan-japanese-curry.jpg",
    alt: {
      en: "Rich golden vegan Japanese curry with chunky potatoes and carrots paired with heart-shaped steamed white rice",
      zh: "浓郁金黄的土豆胡萝卜纯素日式咖喱搭配心形热米饭",
    },
    caption: {
      en: "Hearty Vegan Japanese Curry with steamed rice",
      zh: "浓香纯素日式咖喱配白米饭",
    },
    category: "mains",
    width: 1600,
    height: 1200,
  },
  {
    id: "brand-kraft-sleeve",
    src: "/images/brand-kraft-sleeve.jpg",
    alt: {
      en: "Close-up of the Jian Bing Liu kraft paper sleeve featuring red script, black calligraphy 煎饼刘, and our vermilion 爱民 seal",
      zh: "煎饼刘牛皮纸袋近景，印有毛笔书法煎饼刘与朱红爱民印章",
    },
    caption: {
      en: "Our signature kraft sleeve calligraphy & 爱民 seal",
      zh: "招牌牛皮纸袋书法「煎饼刘」与「爱民」印章",
    },
    category: "craft",
    width: 1600,
    height: 1600,
  },
  {
    id: "veg-spring-rolls",
    src: "/images/veg-spring-rolls.jpg",
    alt: {
      en: "Crispy golden-brown vegetarian spring rolls cut diagonally on a white heart-shaped plate with fresh herbs",
      zh: "心形白盘上斜切摆盘的金黄酥炸素春卷与鲜绿点缀",
    },
    caption: {
      en: "Crispy golden vegetarian spring rolls",
      zh: "外酥里嫩的传统酥炸素春卷",
    },
    category: "mains",
    width: 1200,
    height: 1600,
  },
  {
    id: "folded-rainbow-crepe",
    src: "/images/folded-rainbow-crepe.jpg",
    alt: {
      en: "Colourful fruit-and-vegetable crepe partially folded over savoury sauce and fresh herbs on a hot round griddle",
      zh: "圆铁板上刚刷好秘制酱、撒满青菜并折起一半的果蔬煎饼",
    },
    caption: {
      en: "Folding the crisp fruit-and-vegetable Jian Bing to order",
      zh: "刷酱叠饼，趁热锁住香气",
    },
    category: "savoury",
    width: 1200,
    height: 1600,
  },
  {
    id: "spiced-tea-eggs",
    src: "/images/spiced-tea-eggs.jpg",
    alt: {
      en: "Whole tea eggs gently simmering in a stainless steel pan filled with dark aromatic tea and soy marinade",
      zh: "不锈钢保温盆里浸泡在深色五香红茶卤汁中的整颗茶叶蛋",
    },
    caption: {
      en: "Classic aromatic tea eggs steeped in whole spices",
      zh: "红茶整粒香料慢卤五香茶叶蛋",
    },
    category: "mains",
    width: 1600,
    height: 1200,
  },
  {
    id: "lace-crepe-sheet",
    src: "/images/lace-crepe-sheet.jpg",
    alt: {
      en: "Delicate golden crepe bordered with hand-piped pink lattice lace edges held vertically in the Camden kitchen",
      zh: "在厨房里展示的整张金黄甜饼皮，边缘带有手工挤出的粉色蕾丝花边",
    },
    caption: {
      en: "Hand-piped lace edges before rolling",
      zh: "手工细心挤制的花式蕾丝脆边",
    },
    category: "sweet",
    width: 1200,
    height: 1600,
  },
  {
    id: "griddle-batter-egg",
    src: "/images/griddle-batter-egg.jpg",
    alt: {
      en: "Fresh egg and swirling fruit-and-vegetable batter cooking evenly across a round cast-iron griddle",
      zh: "圆铁板上刚摊开的彩色果蔬面糊与鲜蛋",
    },
    caption: {
      en: "Swirling fresh batter & egg onto a hot cast-iron griddle",
      zh: "面糊与鲜蛋在热铁板上均匀摊开",
    },
    category: "craft",
    width: 1200,
    height: 1600,
  },
  {
    id: "crispy-dumplings-row",
    src: "/images/crispy-dumplings-row.jpg",
    alt: {
      en: "Row of golden crisp pan-fried dumplings neatly arranged on a bright orange carrot-shaped serving dish",
      zh: "橙色胡萝卜造型长盘上整齐排列的金黄酥脆煎饺",
    },
    caption: {
      en: "Crisp pan-fried dumplings served golden and piping hot",
      zh: "现煎出锅的金黄脆皮煎饺",
    },
    category: "mains",
    width: 1600,
    height: 1200,
  },
];
