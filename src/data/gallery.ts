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
  sweet: { en: "Sweet Crepes & Drinks", zh: "可丽饼与特调饮品" },
  mains: { en: "Mains & Snacks", zh: "热菜与小吃" },
  craft: { en: "Kitchen & Camden Shop", zh: "铁板手艺与门店" },
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
    id: "roast-duck-jianbing",
    src: "/images/roast-duck-jianbing.webp",
    alt: {
      en: "Crisp-skinned roast duck carved generously onto a freshly griddled green vegetable-batter Jian Bing crepe",
      zh: "翠绿果蔬煎饼皮上铺满现切片的金黄脆皮烤鸭",
    },
    caption: {
      en: "Signature Roast Duck Jian Bing (£12) — carved warm onto natural green batter",
      zh: "新品招牌烤鸭煎饼（£12）——现切脆皮烤鸭铺满果蔬皮",
    },
    category: "savoury",
    width: 1280,
    height: 960,
  },
  {
    id: "beef-jianbing-stack",
    src: "/images/beef-jianbing-stack.webp",
    alt: {
      en: "Stacked savoury Beef Jian Bing sliced in half beneath the branded Jian Bing Liu kraft sleeve",
      zh: "印有煎饼刘与爱民朱印的牛皮纸袋下，对半叠放的满馅招牌牛肉煎饼",
    },
    caption: {
      en: "Halal Beef Jian Bing — packed thick and wrapped in our 爱民 kraft sleeve",
      zh: "招牌清真牛肉煎饼——切开全是扎实肉馅与鲜蔬",
    },
    category: "savoury",
    width: 960,
    height: 1280,
  },
  {
    id: "creme-brulee-crepe",
    src: "/images/creme-brulee-crepe.webp",
    alt: {
      en: "Caramelised Crème Brûlée & Mascarpone sweet crepe cone ringed with fresh strawberries and chocolate rolls",
      zh: "围满新鲜草莓与巧克力脆卷的现烤焦糖布蕾蛋糕可丽饼",
    },
    caption: {
      en: "Crème Brûlée & Mascarpone Crepe (£11) — torched golden with fresh strawberries",
      zh: "焦糖布蕾蛋糕可丽饼（£11）——现烤焦糖脆壳配鲜草莓",
    },
    category: "sweet",
    width: 960,
    height: 1280,
  },
  {
    id: "matcha-pistachio-crepe",
    src: "/images/matcha-pistachio-crepe.webp",
    alt: {
      en: "Green tea matcha crepe cone piled with pistachio matcha crumble and a cute bunny sweet topper",
      zh: "铺满细腻抹茶开心果碎与可爱小兔点缀的抹茶布蕾可丽饼",
    },
    caption: {
      en: "Matcha & Pistachio Crème Brûlée Crepe (£12)",
      zh: "抹茶开心果布蕾蛋糕可丽饼（£12）",
    },
    category: "sweet",
    width: 960,
    height: 1280,
  },
  {
    id: "mrs-liu-rainbow-griddle",
    src: "/images/mrs-liu-rainbow-griddle.webp",
    alt: {
      en: "Mrs Liu in her Jian Bing Liu apron spreading naturally pink dragon-fruit and green spinach batter on the round cast-iron griddle",
      zh: "刘阿姨身穿煎饼刘围裙，在热圆铁板上摊匀红心火龙果粉与菠菜绿双色天然果蔬面糊",
    },
    caption: {
      en: "Mrs Liu swirling fresh dragon-fruit & spinach batter — never food dye",
      zh: "刘阿姨亲手现摊红心火龙果与菠菜双色果蔬饼皮（零色素）",
    },
    category: "craft",
    width: 960,
    height: 1280,
  },
  {
    id: "dragonfruit-pink-jianbing",
    src: "/images/dragonfruit-pink-jianbing.webp",
    alt: {
      en: "Thick cross-section of a naturally pink dragon-fruit batter Jian Bing stacked high on the griddle",
      zh: "热铁板上红心火龙果粉色果蔬皮煎饼的扎实切面",
    },
    caption: {
      en: "Natural dragon-fruit pink Jian Bing, stacked high with greens & meat",
      zh: "天然火龙果粉色煎饼，料足实在",
    },
    category: "savoury",
    width: 1280,
    height: 960,
  },
  {
    id: "brulee-boba-milk-tea",
    src: "/images/brulee-boba-milk-tea.webp",
    alt: {
      en: "Two cups of iced Hong Kong boba milk tea topped with caramelised pudding and glossy black pearls",
      zh: "两杯顶着焦糖布丁与晶莹黑糖珍珠的冰爽港式奶茶",
    },
    caption: {
      en: "Iced Hong Kong Boba Milk Tea (£6) — silky tea, chewy pearls & custard topping",
      zh: "港式奶茶撞珍珠（£6）——茶香顺滑配软糯珍珠",
    },
    category: "sweet",
    width: 960,
    height: 1280,
  },
  {
    id: "pork-hock-jianbing",
    src: "/images/pork-hock-jianbing.webp",
    alt: {
      en: "Crisp golden Jian Bing packed thickly with tender slow-braised pork hock",
      zh: "外皮焦黄酥脆、裹满厚实卤肘子的猪酱肘子煎饼",
    },
    caption: {
      en: "Braised Pork Hock Jian Bing (£11) — tender spiced meat & golden crunch",
      zh: "猪酱肘子煎饼（£11）——老卤入味、外酥里软",
    },
    category: "savoury",
    width: 1280,
    height: 960,
  },
  {
    id: "strawberry-animal-crepe",
    src: "/images/strawberry-animal-crepe.webp",
    alt: {
      en: "Fresh strawberry sweet crepe cone with whipped cream, cute bunny topper and chocolate wafer rolls",
      zh: "装满新鲜红草莓、轻奶油与可爱小兔造型的草莓可丽饼",
    },
    caption: {
      en: "Strawberry Sweet Crepe — Cute Character Edition (£10)",
      zh: "草莓可丽饼 · 小动物造型版（£10）",
    },
    category: "sweet",
    width: 960,
    height: 1280,
  },
  {
    id: "mrs-liu-sweet-cones",
    src: "/images/mrs-liu-sweet-cones.webp",
    alt: {
      en: "Mrs Liu smiling warmly behind the Camden counter holding two freshly made strawberry sweet crepe cones",
      zh: "刘阿姨在卡姆登档口后微笑举起两份刚做好的鲜草莓甜煎饼",
    },
    caption: {
      en: "Warm smiles behind our Camden Road counter every day",
      zh: "每天守在卡姆登路档口里的熟悉笑脸与烟火气",
    },
    category: "craft",
    width: 960,
    height: 1280,
  },
  {
    id: "char-siu-jianbing",
    src: "/images/char-siu-jianbing.webp",
    alt: {
      en: "Thick sliced Char Siu Pork Jian Bing stacked warm on the hot griddle",
      zh: "热铁板上对半切开、馅料饱满的叉烧肉煎饼",
    },
    caption: {
      en: "Char Siu Pork Jian Bing (£12) — sweet-savoury glaze & crisp lettuce",
      zh: "叉烧肉煎饼（£12）——蜜汁叉烧配鲜脆时蔬",
    },
    category: "savoury",
    width: 960,
    height: 1280,
  },
  {
    id: "herbal-soup-bowl",
    src: "/images/herbal-soup-bowl.webp",
    alt: {
      en: "Steaming bowl of slow-simmered Chinese herbal soup with red dates and wild mushrooms",
      zh: "热气腾腾的红枣菌菇慢熬中式养生热汤",
    },
    caption: {
      en: "Slow-Simmered Herbal Soup (£5 / £10) — red dates, wild mushrooms & comfort",
      zh: "现熬养生热汤（小份 £5 / 大份 £10）——红枣菌菇清润暖身",
    },
    category: "mains",
    width: 1280,
    height: 960,
  },
  {
    id: "roujiamo-burger",
    src: "/images/roujiamo-burger.webp",
    alt: {
      en: "Crisp flaky Chinese Roujiamo bun generously stuffed with slow-braised meat and spring onions",
      zh: "金黄起酥、满满塞着慢炖卤肉与香葱的热乎肉夹馍",
    },
    caption: {
      en: "Crispy Chinese Roujiamo — choose Halal Beef or Classic Braised Pork",
      zh: "酥脆肉夹馍——可选清真卤牛肉或老卤猪肉，外酥里嫩、趁热最香",
    },
    category: "mains",
    width: 1280,
    height: 960,
  },
  {
    id: "mrs-liu-adding-filling",
    src: "/images/mrs-liu-adding-filling.webp",
    alt: {
      en: "Mrs Liu scooping generous tender meat fillings onto a sizzling pink-and-green natural batter crepe",
      zh: "刘阿姨往红绿双色果蔬煎饼上铺满厚实肉馅",
    },
    caption: {
      en: "Generous scoops of warm savoury filling on natural rainbow batter",
      zh: "实打实铺满热肉馅，每一张都舍得给料",
    },
    category: "craft",
    width: 960,
    height: 1280,
  },
  {
    id: "matcha-crepe-closeup",
    src: "/images/matcha-crepe-closeup.webp",
    alt: {
      en: "Close-up of rich green matcha pistachio fluff and golden custard tucked inside a warm matcha crepe cone",
      zh: "抹茶开心果布蕾可丽饼近景特写，满杯细腻抹茶奶酥与金黄布蕾",
    },
    caption: {
      en: "Close-up: Matcha & Pistachio Fluff Crème Brûlée Crepe",
      zh: "近景实拍：抹茶开心果布蕾可丽饼",
    },
    category: "sweet",
    width: 960,
    height: 1280,
  },
  {
    id: "storefront-camden",
    src: "/images/storefront-camden.webp",
    alt: {
      en: "Storefront exterior of Jian Bing Liu at 124 Camden Road, London NW1 9EE with its hanging red Chinese crepe banner",
      zh: "伦敦卡姆登路 124 号煎饼刘门店外景，门口挂着标志性红底中式果蔬煎饼旗帜",
    },
    caption: {
      en: "Find us at 124 Camden Road, NW1 9EE — look for the red Jian Bing banner",
      zh: "卡姆登路 124 号实景门面——认准门口红底果蔬煎饼旗帜",
    },
    category: "craft",
    width: 960,
    height: 1280,
  },
  {
    id: "purple-rice-roll",
    src: "/images/purple-rice-roll.webp",
    alt: {
      en: "Sliced purple sticky rice roll packed with salted egg yolk, crispy fillings and savoury meat floss",
      zh: "对半切开的饱满紫米饭团，露出咸蛋黄、酥脆配料与扎实内馅",
    },
    caption: {
      en: "Hearty purple sticky rice rolls stuffed with salted egg yolk & crunch",
      zh: "满满咸蛋黄与脆料的扎实紫米饭团",
    },
    category: "mains",
    width: 1280,
    height: 960,
  },
  {
    id: "chocolate-strawberry-triangle",
    src: "/images/chocolate-strawberry-triangle.webp",
    alt: {
      en: "Warm triangle-folded chocolate & strawberry crepe drizzled with chocolate sauce and topped with cute biscuits",
      zh: "三角折叠的热乎巧克力草莓可丽饼，淋满浓郁巧克力酱并点缀萌趣饼干",
    },
    caption: {
      en: "Warm Chocolate Crepe (£5) & seasonal berry toppings",
      zh: "热乎巧克力可丽饼（£5）与当季鲜果搭配",
    },
    category: "sweet",
    width: 960,
    height: 1280,
  },
  {
    id: "dragonfruit-blender-prep",
    src: "/images/dragonfruit-blender-prep.webp",
    alt: {
      en: "Fresh red dragon fruit and beetroot freshly blended in the Camden kitchen for natural pink crepe batter",
      zh: "卡姆登后厨搅拌机里刚打好的新鲜红心火龙果与甜菜根原汁",
    },
    caption: {
      en: "Morning kitchen prep: real red dragon fruit & beetroot, zero food dye",
      zh: "清晨后厨实拍：真材实料红心火龙果与甜菜根现打原汁",
    },
    category: "craft",
    width: 960,
    height: 1280,
  },
  {
    id: "mrs-liu-counter-welcome",
    src: "/images/mrs-liu-counter-welcome.webp",
    alt: {
      en: "Mrs Liu welcoming guests at 124 Camden Road with our Jian Bing Liu paper sleeve and fresh sweet crepes",
      zh: "刘阿姨在卡姆登店前台微笑递出牛皮纸袋煎饼与新鲜甜可丽饼",
    },
    caption: {
      en: "From our Camden counter straight into your hands, piping hot",
      zh: "从卡姆登前台热乎递到你手里的家常滋味",
    },
    category: "craft",
    width: 960,
    height: 1280,
  },
  {
    id: "hero-platter",
    src: "/images/hero-jianbing-platter.webp",
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
    id: "beef-dumplings-plate",
    src: "/images/beef-dumplings-plate.webp",
    alt: {
      en: "Crispy pan-fried golden dumplings served on a red dish with dipping sauce and fresh salad leaves",
      zh: "红盘上金黄酥脆的牛肉煎饺，搭配秘制蘸料与新鲜生菜",
    },
    caption: {
      en: "Pan-Fried Beef Dumplings (6 pcs · £6) with house dipping sauce",
      zh: "金黄脆底牛肉煎饺（6 个 £6）配秘制蘸汁",
    },
    category: "mains",
    width: 1200,
    height: 1600,
  },
  {
    id: "braised-beef-rice",
    src: "/images/braised-beef-rice.webp",
    alt: {
      en: "Slow-braised beef with carrots and potatoes served alongside steamed white rice",
      zh: "软烂入味的萝卜土豆炖牛肉配热白米饭",
    },
    caption: {
      en: "Slow-Braised Beef & Radish Rice (£15 / £17)",
      zh: "萝卜炖牛肉饭（小份 £15 / 大份 £17）",
    },
    category: "mains",
    width: 1200,
    height: 1600,
  },
  {
    id: "creme-brulee-kitty-crepe",
    src: "/images/creme-brulee-kitty-crepe.webp",
    alt: {
      en: "Caramelised Crème Brûlée strawberry crepe cone decorated with a cute white kitten sweet and wafer sticks",
      zh: "点缀可爱小猫造型与饼干棒的焦糖布蕾草莓可丽饼",
    },
    caption: {
      en: "Cute Character Crème Brûlée Strawberry Crepe",
      zh: "萌趣小动物造型焦糖布蕾草莓可丽饼",
    },
    category: "sweet",
    width: 1280,
    height: 960,
  },
  {
    id: "veg-spring-rolls",
    src: "/images/veg-spring-rolls.webp",
    alt: {
      en: "Crispy golden vegetarian spring rolls cut diagonally on a white heart-shaped plate",
      zh: "心形白盘上斜切摆盘的金黄酥炸素春卷",
    },
    caption: {
      en: "Crispy Veggie Spring Rolls (2 pcs · £5)",
      zh: "酥炸素春卷（2 个 £5）",
    },
    category: "mains",
    width: 1200,
    height: 1600,
  },
  {
    id: "brand-kraft-sleeve",
    src: "/images/brand-kraft-sleeve.webp",
    alt: {
      en: "Close-up of the Jian Bing Liu kraft paper sleeve featuring brush calligraphy 煎饼刘 and our vermilion 爱民 seal",
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
    id: "fancy-lace-dessert-cone",
    src: "/images/fancy-lace-dessert-cone.webp",
    alt: {
      en: "Hand-piped pink lace crepe cone filled with whipped cream, fresh fruit, matcha biscuit sticks and bear biscuits",
      zh: "粉色蕾丝边甜筒煎饼，装满奶油、鲜草莓、抹茶饼干棒与可爱小熊饼干",
    },
    caption: {
      en: "Hand-piped pink lace sweet crepe cone with cream & fresh fruit",
      zh: "手工粉色蕾丝奶油水果甜筒煎饼",
    },
    category: "sweet",
    width: 1200,
    height: 1600,
  },
  {
    id: "roast-duck-whole",
    src: "/images/roast-duck-whole.webp",
    alt: {
      en: "Glistening golden-brown roast duck freshly prepared in the kitchen",
      zh: "色泽红亮油润的刚出炉金黄脆皮烤鸭",
    },
    caption: {
      en: "Crisp golden roast duck prepped fresh for our Roast Duck Jian Bing",
      zh: "为招牌烤鸭煎饼准备的油亮脆皮烤鸭",
    },
    category: "savoury",
    width: 1280,
    height: 960,
  },
];
