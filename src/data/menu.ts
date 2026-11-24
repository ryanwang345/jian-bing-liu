import type { LocalizedText } from "@/lib/i18n";

export type DietaryTagKey = "halal" | "vegetarian" | "vegan";

export const dietaryLabels: Record<DietaryTagKey, LocalizedText> = {
  halal: { en: "Halal", zh: "清真" },
  vegetarian: { en: "Vegetarian", zh: "蛋奶素" },
  vegan: { en: "Vegan", zh: "纯素" },
};

export interface MenuItem {
  id: string;
  name: LocalizedText;
  chineseName: string;
  description: LocalizedText;
  /** Verified price string matched to the official in-store menu */
  price: string | null;
  secondaryPrice?: LocalizedText;
  dietary?: DietaryTagKey[];
  featured?: boolean;
  image?: string;
  imageAlt?: LocalizedText;
  note?: LocalizedText;
}

export interface MenuCategory {
  id: string;
  title: LocalizedText;
  chineseTitle: string;
  subtitle: LocalizedText;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: "savoury-crepes",
    title: { en: "Savoury Jian Bing", zh: "招牌咸味煎饼" },
    chineseTitle: "咸味煎饼",
    subtitle: {
      en: "Freshly griddled to order with natural fruit-and-veg batter, cracked egg, a crisp wonton centre and Mrs Liu's savoury house sauce.",
      zh: "鲜榨果蔬面糊上热铁板手工现摊，磕蛋刷自家慢熬咸香酱、夹上酥脆薄脆与丰富配料，趁热折好装袋。",
    },
    items: [
      {
        id: "roast-duck-crepe",
        name: { en: "Roast Duck Jian Bing", zh: "招牌烤鸭煎饼" },
        chineseName: "烤鸭卷饼煎饼",
        description: {
          en: "Crisp-skinned roast duck carved warm onto a freshly griddled natural-batter crepe with crunchy veg, spring onions and Mrs Liu's savoury sauce.",
          zh: "皮酥肉嫩的现切烤鸭铺满果蔬饼皮，配上脆生菜、香葱丝与自家咸香酱，满满一口特别香。",
        },
        price: "£12.00",
        featured: true,
        image: "/images/roast-duck-jianbing.webp",
        imageAlt: {
          en: "Sliced golden roast duck laid generously across a fresh green vegetable-batter Jian Bing crepe",
          zh: "翠绿果蔬煎饼皮上铺满现切片的金黄脆皮烤鸭",
        },
      },
      {
        id: "beef-crepe",
        name: { en: "Beef Jian Bing", zh: "招牌牛肉煎饼" },
        chineseName: "牛肉煎饼",
        description: {
          en: "Tender Halal beef folded into a hot, crisp crepe with egg, fresh lettuce, spring onions, crunchy shallots and our savoury house sauce. Properly filling.",
          zh: "热乎脆香的果蔬饼皮，裹满鲜嫩清真牛肉、鲜蛋、脆生菜、香葱和酥脆炸洋葱，刷上自家咸香酱，拿在手里沉甸甸的。",
        },
        price: "£12.00",
        secondaryPrice: { en: "£9.00 Medium", zh: "中份 £9.00" },
        dietary: ["halal"],
        featured: true,
        image: "/images/beef-jianbing-stack.webp",
        imageAlt: {
          en: "Generously stacked Beef Jian Bing sliced in half beneath the branded Jian Bing Liu kraft sleeve",
          zh: "印有煎饼刘与爱民朱印的牛皮纸袋下方，对半切开叠放的满馅招牌牛肉煎饼",
        },
      },
      {
        id: "chicken-crepe",
        name: { en: "Chicken Jian Bing", zh: "招牌鸡肉煎饼" },
        chineseName: "鸡肉煎饼",
        description: {
          en: "Savoury Halal chicken, cracked egg, fresh greens and crisp fried shallots wrapped in a warm crepe brushed with house sauce — rich, crunchy and comforting.",
          zh: "鲜嫩清真鸡肉配上鲜蛋、鲜脆生菜与金黄炸洋葱，现摊饼皮刷满秘制酱，外柔内脆、香而不腻。",
        },
        price: "£11.00",
        secondaryPrice: { en: "£8.00 Medium", zh: "中份 £8.00" },
        dietary: ["halal"],
        image: "/images/hero-jianbing-platter.webp",
        imageAlt: {
          en: "Signature herb-studded Chicken Jian Bing crepe sliced in half beside a Jian Bing Liu kraft sleeve",
          zh: "切开展示丰富内馅的招牌果蔬鸡肉煎饼，旁有煎饼刘牛皮纸袋",
        },
      },
      {
        id: "char-siu-crepe",
        name: { en: "Char Siu Pork Jian Bing", zh: "叉烧肉煎饼" },
        chineseName: "叉烧肉煎饼",
        description: {
          en: "Sweet-savoury glazed char siu pork tucked into a hot crisp crepe with crunchy veg, egg and house sauce.",
          zh: "蜜汁微甜的厚切叉烧肉遇上热乎焦香的果蔬煎饼，配脆生菜与薄脆，咸甜交织很讨喜。",
        },
        price: "£12.00",
        secondaryPrice: { en: "£9.00 Medium", zh: "中份 £9.00" },
        image: "/images/char-siu-jianbing.webp",
        imageAlt: {
          en: "Thick sliced Char Siu Pork Jian Bing stacked warm on the cast-iron griddle",
          zh: "热铁板上对半叠放、馅料扎实的叉烧肉煎饼",
        },
      },
      {
        id: "pork-hock-crepe",
        name: { en: "Braised Pork Hock Jian Bing", zh: "猪酱肘子煎饼" },
        chineseName: "猪酱肘子煎饼",
        description: {
          en: "Slow-braised spiced pork hock sliced thin and folded warm into our crisp egg crepe with fresh herbs and savoury sauce.",
          zh: "老卤慢炖入味的猪酱肘子切薄片铺进热煎饼里，酱香醇厚、肥而不腻，越嚼越香。",
        },
        price: "£11.00",
        secondaryPrice: { en: "£8.00 Medium", zh: "中份 £8.00" },
        image: "/images/pork-hock-jianbing.webp",
        imageAlt: {
          en: "Crisp golden Jian Bing packed thickly with tender braised pork hock and fresh shredded fillings",
          zh: "外皮焦黄酥脆、裹满厚实猪酱肘子与脆料的招牌煎饼",
        },
      },
      {
        id: "jerk-chicken-crepe",
        name: { en: "Caribbean Jerk Chicken Jian Bing", zh: "加勒比牙买加烤鸡煎饼" },
        chineseName: "加勒比牙买加烤鸡煎饼",
        description: {
          en: "A true Camden Road collaboration — smoky spiced Caribbean jerk chicken folded hot into our natural dragon-fruit & spinach Jian Bing.",
          zh: "卡姆登路限定融合口味——烟熏微辣的加勒比烤鸡夹进鲜榨果蔬煎饼里，肉香与饼香碰撞得意外合拍。",
        },
        price: "£14.00",
        image: "/images/dragonfruit-pink-jianbing.webp",
        imageAlt: {
          en: "Naturally pink dragon-fruit batter Jian Bing generously filled with grilled chicken and crisp salad",
          zh: "红心火龙果粉色果蔬皮煎饼，夹满厚实烤鸡肉与鲜脆时蔬",
        },
      },
      {
        id: "tuna-crepe",
        name: { en: "Tuna Jian Bing (Medium)", zh: "吞拿鱼煎饼（中）" },
        chineseName: "吞拿鱼煎饼（中）",
        description: {
          en: "A lighter medium crepe filled with savoury tuna, crisp greens and egg — quick and easy for lunch on the go.",
          zh: "分量轻盈的中份煎饼，鲜香吞拿鱼配脆生菜与鲜蛋，适合午间随手带走。",
        },
        price: "£8.00",
        image: "/images/chicken-crepe-sleeve.webp",
        imageAlt: {
          en: "Warm medium Jian Bing folded neatly into a brown takeaway sleeve",
          zh: "热气腾腾装在牛皮纸袋里的中份煎饼",
        },
      },
      {
        id: "veggie-lover-crepe",
        name: { en: "Veggie Lover Jian Bing", zh: "素菜煎饼" },
        chineseName: "素菜煎饼",
        description: {
          en: "Crunchy shredded potato, cool cucumber, fresh spinach, lettuce and fried shallots tucked inside a natural fruit-and-veg crepe with savoury house sauce.",
          zh: "爽脆土豆丝、清口黄瓜条、嫩菠菜、生菜与酥香炸洋葱，卷进鲜榨果蔬饼皮里刷上咸香酱，清爽又管饱。",
        },
        price: "£9.00",
        dietary: ["vegetarian"],
        featured: true,
        image: "/images/veggie-crepe-griddle.webp",
        imageAlt: {
          en: "Colourful fruit-and-vegetable batter Veggie Lover Jian Bing topped with fresh greens on the griddle",
          zh: "铁板上刚摊好的彩色果蔬面糊素菜煎饼，铺满翠绿蔬菜与香葱",
        },
      },
      {
        id: "spinach-cheese-crepe",
        name: { en: "Spinach & Cheese Jian Bing", zh: "菠菜芝士煎饼" },
        chineseName: "菠菜芝士煎饼",
        description: {
          en: "Fresh spinach, egg and melted cheese folded warm into a crisp crepe with a light brush of house sauce — simple and cosy.",
          zh: "鲜嫩菠菜、鸡蛋加上热乎融化的香浓芝士，轻刷一层自家酱，简单踏实又暖心。",
        },
        price: "£10.00",
        dietary: ["vegetarian"],
        image: "/images/folded-rainbow-crepe.webp",
        imageAlt: {
          en: "Freshly folded vegetable-batter crepe sizzling on the hot griddle",
          zh: "铁板上正在折叠的彩色果蔬面糊煎饼",
        },
      },
      {
        id: "flourless-crepe",
        name: { en: "Flourless Jian Bing", zh: "无面煎饼" },
        chineseName: "无面煎饼",
        description: {
          en: "A lighter, flour-free egg wrap cooked crisp on the griddle and loaded with fresh greens and savoury fillings.",
          zh: "不加面粉的轻盈纯蛋皮现摊煎饼，依然铺满鲜脆时蔬与秘制酱香，低碳水也能放心解馋。",
        },
        price: "£11.00",
        image: "/images/golden-jianbing-cut.webp",
        imageAlt: {
          en: "Golden sesame-crusted Jian Bing sliced open to reveal fresh greens and savoury layers",
          zh: "金黄撒芝麻的现摊煎饼切面，露出翠绿蔬菜与扎实内馅",
        },
      },
    ],
  },
  {
    id: "sweet-crepes-and-desserts",
    title: { en: "Sweet Crepes", zh: "花式可丽饼 · 甜煎饼" },
    chineseTitle: "花式可丽饼",
    subtitle: {
      en: "Caramelised crème brûlée cones, matcha & pistachio fluff crepes, fresh strawberry cones and warm chocolate crepes.",
      zh: "现烤焦糖布蕾甜筒、抹茶开心果可丽饼、小动物鲜草莓可丽饼与热乎巧克力甜煎饼。",
    },
    items: [
      {
        id: "creme-brulee-crepe",
        name: {
          en: "Crème Brûlée & Mascarpone Crepe (Limited Edition)",
          zh: "焦糖布蕾蛋糕可丽饼",
        },
        chineseName: "焦糖布蕾蛋糕可丽饼",
        description: {
          en: "Silky custard cream and mascarpone torched to a crackly golden caramel top, ringed with fresh strawberries inside a warm hand-rolled crepe cone.",
          zh: "丝滑马斯卡彭奶油布蕾现烤出咔嚓焦糖脆壳，围满新鲜红草莓和脆卷，奶香浓郁甜而不腻。",
        },
        price: "£11.00",
        dietary: ["vegetarian"],
        featured: true,
        image: "/images/creme-brulee-crepe.webp",
        imageAlt: {
          en: "Caramelised Crème Brûlée custard sweet crepe cone ringed with fresh strawberries and chocolate wafer rolls",
          zh: "围满新鲜草莓与巧克力脆卷的现烤焦糖布蕾蛋糕可丽饼",
        },
      },
      {
        id: "matcha-pistachio-crepe",
        name: {
          en: "Matcha & Pistachio Crème Brûlée Crepe",
          zh: "抹茶开心果布蕾蛋糕可丽饼",
        },
        chineseName: "抹茶开心果布蕾蛋糕可丽饼",
        description: {
          en: "Fragrant green tea matcha crepe layered with creamy brûlée custard, nutty pistachio fluff and a dusting of rich matcha.",
          zh: "茶香清苦回甘的抹茶饼皮，层层叠入绵密布蕾蛋糕与香浓开心果奶油脆，口感丰富不甜腻。",
        },
        price: "£12.00",
        dietary: ["vegetarian"],
        featured: true,
        image: "/images/matcha-pistachio-crepe.webp",
        imageAlt: {
          en: "Green tea matcha crepe cone topped with generous matcha pistachio crumble and a cute bunny sweet",
          zh: "铺满细腻抹茶粉与开心果碎、点缀可爱小兔的抹茶开心果可丽饼",
        },
      },
      {
        id: "strawberry-crepe",
        name: {
          en: "Strawberry Sweet Crepe (Cute Character Edition)",
          zh: "草莓可丽饼（小动物）",
        },
        chineseName: "草莓可丽饼（小动物）",
        description: {
          en: "Freshly sliced strawberries, light whipped cream and playful handmade character toppers rolled into a warm crepe cone.",
          zh: "现切饱满红草莓配轻盈鲜奶油与可爱小动物造型点缀，热软饼皮卷着吃，清爽又治愈。",
        },
        price: "£10.00",
        dietary: ["vegetarian"],
        image: "/images/strawberry-animal-crepe.webp",
        imageAlt: {
          en: "Fresh strawberry and whipped cream sweet crepe cone topped with a cute bunny marshmallow and chocolate wafer rolls",
          zh: "装满新鲜草莓、轻奶油与可爱小动物造型的草莓可丽饼",
        },
      },
      {
        id: "banana-crepe",
        name: {
          en: "Banana Sweet Crepe (Cute Character Edition)",
          zh: "香蕉可丽饼（小动物）",
        },
        chineseName: "香蕉可丽饼（小动物）",
        description: {
          en: "Sweet sliced banana, whipped cream, chocolate drizzle and cute character toppings wrapped warm to order.",
          zh: "香甜现切香蕉片配绵密奶油、巧克力酱和萌趣小动物点缀，趁热吃软糯香甜。",
        },
        price: "£10.00",
        dietary: ["vegetarian"],
        image: "/images/nutella-strawberry-crepe.webp",
        imageAlt: {
          en: "Warm folded sweet crepe topped with sliced banana, fresh strawberries, cream and chocolate drizzle",
          zh: "铺满香蕉片、鲜草莓、奶油与巧克力酱的现摊甜煎饼",
        },
      },
      {
        id: "chocolate-crepe",
        name: { en: "Warm Chocolate Crepe", zh: "巧克力可丽饼" },
        chineseName: "巧克力可丽饼",
        description: {
          en: "A warm, soft crepe generously spread with rich chocolate — simple, cosy and freshly griddled for a fiver.",
          zh: "刚出锅的软韧甜饼皮，厚厚抹上一层融化的香浓巧克力酱，简单解馋又暖心。",
        },
        price: "£5.00",
        dietary: ["vegetarian"],
        image: "/images/chocolate-strawberry-triangle.webp",
        imageAlt: {
          en: "Warm triangle-folded chocolate dessert crepe drizzled with rich chocolate sauce",
          zh: "淋满浓香巧克力酱的三角折叠热乎巧克力可丽饼",
        },
      },
    ],
  },
  {
    id: "meal-deals",
    title: { en: "Meal Deals", zh: "超值优惠套餐" },
    chineseTitle: "优惠套餐",
    subtitle: {
      en: "Pair our signature savoury Jian Bing with Hong Kong Iced Lemon Tea or Freshly Ground Soya Milk and save.",
      zh: "招牌咸味煎饼搭配港式冻柠茶或现磨豆浆，热饼配好饮，一顿刚好更划算。",
    },
    items: [
      {
        id: "chicken-meal-deal",
        name: { en: "Chicken Jian Bing Meal Deal", zh: "鸡肉煎饼套餐" },
        chineseName: "鸡肉煎饼 + 港式柠檬茶 / 现磨豆浆",
        description: {
          en: "Signature Halal Chicken Jian Bing paired with your choice of Hong Kong Iced Lemon Tea or freshly ground house soya milk.",
          zh: "招牌清真鸡肉煎饼配冰爽港式柠檬茶或温润现磨豆浆，热乎管饱又解腻。",
        },
        price: "£12.00",
        dietary: ["halal"],
        image: "/images/hero-jianbing-platter.webp",
        imageAlt: {
          en: "Freshly sliced Chicken Jian Bing crepe served warm for our meal deal",
          zh: "热乎出锅的招牌鸡肉煎饼套餐主食",
        },
      },
      {
        id: "beef-meal-deal",
        name: { en: "Beef Jian Bing Meal Deal", zh: "牛肉煎饼套餐" },
        chineseName: "牛肉煎饼 + 港式柠檬茶 / 现磨豆浆",
        description: {
          en: "Signature Halal Beef Jian Bing paired with your choice of Hong Kong Iced Lemon Tea or freshly ground house soya milk.",
          zh: "招牌清真牛肉煎饼配冰爽港式柠檬茶或温润现磨豆浆，街坊午晚餐最常点的省心组合。",
        },
        price: "£13.00",
        dietary: ["halal"],
        image: "/images/beef-jianbing-stack.webp",
        imageAlt: {
          en: "Stacked Beef Jian Bing crepe served with our meal deal drink pairing",
          zh: "满馅招牌牛肉煎饼套餐",
        },
      },
      {
        id: "jerk-chicken-meal-deal",
        name: {
          en: "Caribbean Jerk Chicken Jian Bing Meal Deal",
          zh: "加勒比烤鸡煎饼套餐",
        },
        chineseName: "加勒比烤鸡煎饼 + 港式柠檬茶 / 现磨豆浆",
        description: {
          en: "Our bold Caribbean Jerk Chicken Jian Bing paired with Hong Kong Iced Lemon Tea or freshly ground house soya milk.",
          zh: "加勒比牙买加烤鸡煎饼配冰爽港式冻柠茶或现磨豆浆，香气十足、一口过瘾。",
        },
        price: "£18.00",
        image: "/images/dragonfruit-pink-jianbing.webp",
        imageAlt: {
          en: "Caribbean Jerk Chicken Jian Bing in naturally pink dragon-fruit batter",
          zh: "鲜榨红心火龙果皮加勒比烤鸡煎饼",
        },
      },
    ],
  },
  {
    id: "mains-and-rice",
    title: { en: "Homestyle Mains & Rice", zh: "家常主食盖饭" },
    chineseTitle: "家常主食",
    subtitle: {
      en: "Slow-simmered comfort bowls from Mrs Liu's kitchen, served piping hot over fluffy steamed white rice.",
      zh: "像家里灶台上慢火炖出的热乎硬菜，浓汤拌着热腾腾的白米饭吃格外踏实。",
    },
    items: [
      {
        id: "taiwan-braised-pork-rice",
        name: { en: "Taiwanese Braised Pork Rice", zh: "台湾卤肉饭" },
        chineseName: "台湾卤肉饭",
        description: {
          en: "Rich, aromatic slow-braised pork belly ladled generously over hot steamed white rice — deeply comforting and under a tenner.",
          zh: "慢火熬出浓香油润的台式卤肉燥，厚厚浇在热米饭上，咸香微甜，十镑吃得特别满足。",
        },
        price: "£10.00",
      },
      {
        id: "braised-beef-rice",
        name: { en: "Slow-Braised Beef & Radish Rice", zh: "萝卜炖牛肉饭" },
        chineseName: "萝卜炖牛肉饭",
        description: {
          en: "Beef braised slowly until fork-tender with soft potatoes, sweet radish and carrots in rich savoury gravy over steamed rice.",
          zh: "慢火咕嘟炖到软烂入味的牛肉，配上吸饱肉汁的绵软萝卜与胡萝卜，浇在热米饭上格外下饭。",
        },
        price: "£15.00",
        secondaryPrice: { en: "£17.00 Large", zh: "大份 £17.00" },
        featured: true,
        image: "/images/braised-beef-rice.webp",
        imageAlt: {
          en: "Tender slow-braised beef with carrots and potatoes served alongside steamed white rice",
          zh: "软烂入味的炖牛肉搭配热腾腾白米饭",
        },
      },
      {
        id: "beef-rib-rice",
        name: { en: "Braised Beef Rib Rice", zh: "牛肋骨饭" },
        chineseName: "牛肋骨饭",
        description: {
          en: "Meaty, fall-off-the-bone braised beef ribs in rich house gravy, served hot over fluffy white rice.",
          zh: "慢炖脱骨的厚实牛肋骨配浓厚原汁汤头，浇在热白米饭上肉香四溢、特别顶饱。",
        },
        price: "£15.00",
        secondaryPrice: { en: "£17.00 Large", zh: "大份 £17.00" },
      },
    ],
  },
  {
    id: "snacks-and-dumplings",
    title: { en: "Chinese Snacks, Dumplings & Soups", zh: "中式小吃 · 煎饺 · 鲜汤" },
    chineseTitle: "街头小吃",
    subtitle: {
      en: "Pan-fried dumplings, Halal beef buns and flatbreads, handmade wontons and slow-simmered soups.",
      zh: "脆底煎饺、清真牛肉大包与馅饼、手工鲜汤馄饨与现熬养生鸡汤，单点或加配都合适。",
    },
    items: [
      {
        id: "halal-beef-bun",
        name: { en: "Halal Beef Stuffed Bun", zh: "清真牛肉大馅肉包子" },
        chineseName: "清真牛肉大馅肉包子",
        description: {
          en: "Soft, pillowy steamed bun generously packed with juicy seasoned Halal beef.",
          zh: "松软发面大包子，掰开是扎实多汁的清真牛肉鲜馅，热乎吃一个很舒服。",
        },
        price: "£3.50",
        dietary: ["halal"],
      },
      {
        id: "beef-flatbread",
        name: { en: "Pan-Fried Beef Flatbread", zh: "牛肉馅饼" },
        chineseName: "牛肉馅饼",
        description: {
          en: "Golden, crisp pan-fried flatbread stuffed with savoury seasoned Halal beef and herbs.",
          zh: "外皮煎得金黄焦香、咬开满满扎实牛肉与葱香，热乎拿着边走边吃最过瘾。",
        },
        price: "£3.50",
        dietary: ["halal"],
        image: "/images/roujiamo-burger.webp",
        imageAlt: {
          en: "Warm crisp Chinese flatbread generously stuffed with savoury braised meat and spring onions",
          zh: "金黄酥香、塞满鲜嫩肉馅与香葱的热乎中式肉饼",
        },
      },
      {
        id: "spring-onion-flatbread",
        name: { en: "Spring Onion Flatbread", zh: "葱油饼" },
        chineseName: "葱油饼",
        description: {
          en: "Flaky, layered pan-fried scallion pancake cooked crisp and fragrant to order.",
          zh: "层层起酥、外焦里软的老式葱油饼，刚出锅满嘴葱香。",
        },
        price: "£2.50",
        dietary: ["vegan"],
      },
      {
        id: "veg-floss-scallion-roll",
        name: { en: "Veg Floss & Spring Onion Roll", zh: "素肉松葱花卷" },
        chineseName: "素肉松葱花卷",
        description: {
          en: "Soft steamed savoury roll layered with fragrant spring onions and crispy vegetarian floss.",
          zh: "松软热乎的葱花卷里卷满咸香素肉松，简单家常又顶饿。",
        },
        price: "£3.00",
        dietary: ["vegetarian"],
      },
      {
        id: "prawn-toast",
        name: { en: "Sesame King Prawn Toast", zh: "虾多士" },
        chineseName: "虾多士",
        description: {
          en: "Crisp golden toast topped with seasoned king prawn paste and toasted sesame seeds.",
          zh: "酥脆吐司铺满鲜弹虾滑与白芝麻，炸得金黄焦香。",
        },
        price: "£5.00",
      },
      {
        id: "beef-dumplings",
        name: { en: "Pan-Fried Beef Dumplings (6 pcs)", zh: "牛肉饺子（6 个）" },
        chineseName: "牛肉饺子（6个）",
        description: {
          en: "Six handmade dumplings pan-fried crisp and golden underneath, filled with juicy Halal beef, carrot and a hint of toasted sesame.",
          zh: "6 只现煎手工清真牛肉煎饺，底面金黄焦脆、咬开汁水饱满，带淡淡芝麻香。",
        },
        price: "£6.00",
        dietary: ["halal"],
        image: "/images/beef-dumplings-plate.webp",
        imageAlt: {
          en: "Six golden crispy pan-fried beef dumplings plated with house dipping sauce",
          zh: "金黄酥脆的牛肉煎饺配秘制蘸料",
        },
      },
      {
        id: "vegetarian-dumplings",
        name: { en: "Pan-Fried Veggie Dumplings (6 pcs)", zh: "素饺子（6 个）" },
        chineseName: "素饺子（6个）",
        description: {
          en: "Six crisp pan-fried dumplings stuffed with glass noodles, carrot, bean sprouts and fresh ginger.",
          zh: "6 只清爽鲜香的手工素煎饺，豆芽、胡萝卜、粉丝与鲜姜调馅，焦脆爽口。",
        },
        price: "£5.00",
        dietary: ["vegetarian"],
        image: "/images/veggie-dumplings-ring.webp",
        imageAlt: {
          en: "Golden crispy pan-fried vegetarian dumplings arranged on a red plate",
          zh: "围成一圈的金黄酥脆素煎饺",
        },
      },
      {
        id: "vegetarian-spring-rolls",
        name: { en: "Crispy Veggie Spring Rolls (2 pcs)", zh: "素春卷（2 个）" },
        chineseName: "素春卷（2个）",
        description: {
          en: "Two light, flaky golden pastry rolls packed with seasoned vegetables, cooked crisp to order.",
          zh: "两只外皮金黄松脆、内馅清甜爽口的热炸素春卷，趁热咬下去咔嚓响。",
        },
        price: "£5.00",
        dietary: ["vegetarian"],
        image: "/images/veg-spring-rolls.webp",
        imageAlt: {
          en: "Crispy golden vegetarian spring rolls sliced open on a heart-shaped plate",
          zh: "心形白盘上切开的金黄酥脆素春卷",
        },
      },
      {
        id: "beef-wonton",
        name: { en: "Beef Wonton Soup", zh: "牛肉馄饨" },
        chineseName: "牛肉馄饨",
        description: {
          en: "Handmade savoury beef wontons in a light, piping-hot broth — simple and soothing on a grey London day.",
          zh: "手工包制的鲜香牛肉馄饨，泡在清亮滚烫的热汤里，伦敦阴雨天吃上一碗特别暖和。",
        },
        price: "£7.00",
        secondaryPrice: { en: "6 pcs £7 · 8 pcs £9", zh: "6 个 £7 · 8 个 £9" },
      },
      {
        id: "three-delicacy-wonton",
        name: { en: "Three-Delicacy Wonton Soup", zh: "三鲜馄饨" },
        chineseName: "三鲜馄饨",
        description: {
          en: "Delicate traditional three-delicacy wontons floating in a clean, fragrant clear broth.",
          zh: "皮薄馅足的经典三鲜手工馄饨，汤头清鲜不腻，落胃暖呼呼的。",
        },
        price: "£7.00",
        secondaryPrice: { en: "6 pcs £7 · 8 pcs £9", zh: "6 个 £7 · 8 个 £9" },
      },
      {
        id: "red-oil-prawn-wonton",
        name: { en: "Chilli Oil Prawn Wonton Soup", zh: "红油鲜虾云吞汤" },
        chineseName: "红油鲜虾云吞汤",
        description: {
          en: "Plump, juicy prawn wontons finished with fragrant homemade Sichuan-style chilli oil.",
          zh: "饱满弹牙的鲜虾云吞淋上自家熬制的红亮香辣油，鲜麻微辣、一口开胃。",
        },
        price: "£10.00",
      },
      {
        id: "herbal-chicken-soup",
        name: { en: "Slow-Simmered Herbal Chicken Soup", zh: "现熬养生鸡汤" },
        chineseName: "现熬养生鸡汤",
        description: {
          en: "Nourishing homestyle chicken soup gently simmered with red dates and wild mushrooms — deeply restorative and warm.",
          zh: "红枣菌菇慢火细熬的家常滋补热汤，汤色清润、鲜香暖身，喝完特别舒服。",
        },
        price: "£5.00",
        secondaryPrice: { en: "£10.00 Large", zh: "大份 £10.00" },
        image: "/images/herbal-soup-bowl.webp",
        imageAlt: {
          en: "Steaming bowl of slow-simmered Chinese herbal soup with red dates and wild morel mushrooms",
          zh: "热气腾腾的红枣菌菇慢熬中式养生汤",
        },
      },
    ],
  },
  {
    id: "drinks",
    title: { en: "Special Drinks & Beverages", zh: "特色手调饮品与冰饮" },
    chineseTitle: "特色饮品",
    subtitle: {
      en: "Hong Kong milk teas, chilled mango pomelo sago, warm soya milk & toasted black sesame, whisked matcha and chilled drinks.",
      zh: "港式珍珠奶茶、杨枝甘露、热豆奶与黑芝麻糊、手打抹茶拿铁、鲜果冷饮与冰镇饮料。",
    },
    items: [
      {
        id: "hk-boba-milk-tea",
        name: { en: "Hong Kong Boba Milk Tea (Iced)", zh: "港式奶茶撞珍珠（冰）" },
        chineseName: "港式奶茶撞珍珠",
        description: {
          en: "Rich, silky Hong Kong-style black milk tea poured over chewy brown-sugar boba pearls.",
          zh: "茶底香浓丝滑的经典港式奶茶撞上软糯黑糖珍珠，冰爽顺口。",
        },
        price: "£6.00",
        dietary: ["vegetarian"],
        image: "/images/brulee-boba-milk-tea.webp",
        imageAlt: {
          en: "Two cups of iced Hong Kong boba milk tea crowned with golden caramelised pudding and glossy pearls",
          zh: "顶着焦糖布丁与晶莹黑糖珍珠的冰爽港式奶茶",
        },
      },
      {
        id: "hk-milk-tea",
        name: { en: "Hong Kong Milk Tea (Iced)", zh: "港式奶茶（冰）" },
        chineseName: "港式奶茶（冰）",
        description: {
          en: "Classic strong-brewed Hong Kong milk tea over ice — smooth, fragrant and balanced.",
          zh: "茶香醇厚、奶香顺滑的地道冰港奶，配咸煎饼很解腻。",
        },
        price: "£6.00",
        dietary: ["vegetarian"],
      },
      {
        id: "pistachio-matcha-boba",
        name: { en: "Pistachio Matcha Boba Tea", zh: "开心抹茶珍珠奶茶" },
        chineseName: "开心抹茶珍珠奶茶",
        description: {
          en: "Earthy whisked matcha layered with nutty pistachio cream and soft boba pearls.",
          zh: "清新抹茶融合浓郁开心果奶香与软糯珍珠，口感层次丰富。",
        },
        price: "£6.00",
        dietary: ["vegetarian"],
      },
      {
        id: "mango-sago",
        name: { en: "Chilled Mango Pomelo Sago (Iced)", zh: "杨枝甘露（冰）" },
        chineseName: "杨枝甘露（冰）",
        description: {
          en: "Cool, creamy sweet mango dessert drink layered with juicy pomelo and delicate sago pearls.",
          zh: "新鲜芒果泥搭配清甜柚子粒与软弹西米，冰凉顺滑、果香自然。",
        },
        price: "£6.00",
        dietary: ["vegetarian"],
      },
      {
        id: "lucky-2026-special",
        name: { en: "Lucky New Year 2026 Special (Iced)", zh: "鸿运当头 2026（冰）" },
        chineseName: "鸿运当头2026（冰）",
        description: {
          en: "Our bright, fruity house special iced refresher crafted for 2026 — crisp, vibrant and refreshing.",
          zh: "2026 店长限定鲜果特调冰饮，色泽红润喜庆、酸甜清口。",
        },
        price: "£6.00",
        dietary: ["vegetarian"],
      },
      {
        id: "fresh-strawberry-milk",
        name: { en: "Fresh Strawberry Milk", zh: "草莓鲜奶" },
        chineseName: "草莓鲜奶",
        description: {
          en: "Crushed fresh strawberries swirled with cold creamy milk — lightly sweet and natural.",
          zh: "新鲜捣碎草莓果肉倒入冰鲜牛奶里，自然果香不齁甜。",
        },
        price: "£6.00",
        dietary: ["vegetarian"],
      },
      {
        id: "hk-lemon-tea",
        name: { en: "Hong Kong Iced Lemon Tea", zh: "港式冻柠茶（冰）" },
        chineseName: "港式冻柠茶（冰）",
        description: {
          en: "Brisk black tea muddled with fresh lemon slices over ice — sharp, clean and thirst-quenching.",
          zh: "现捣鲜柠檬片配浓郁红茶底，冰爽酸甜，吃热煎饼绝配。",
        },
        price: "£6.00",
        dietary: ["vegan"],
      },
      {
        id: "lemon-ginger-honey-tea",
        name: { en: "Iced Lemon, Ginger & Honey Tea", zh: "冻柠姜蜜茶" },
        chineseName: "冻柠姜蜜茶",
        description: {
          en: "Bright lemon, gentle warming ginger and sweet honey shaken cold.",
          zh: "清新柠檬配微辛生姜与柔和蜂蜜，清润爽口。",
        },
        price: "£6.00",
        dietary: ["vegetarian"],
      },
      {
        id: "soya-milk-latte",
        name: { en: "House Soya Milk Latte (Hot / Cold)", zh: "豆浆奶（热 / 冷）" },
        chineseName: "豆浆奶（热/冷）",
        description: {
          en: "Velvety house-made soya milk latte served warm or over ice.",
          zh: "丝滑醇厚的现磨豆浆奶，冷热皆宜，豆香温润。",
        },
        price: "£6.00",
        dietary: ["vegan"],
      },
      {
        id: "matcha-latte",
        name: { en: "Whisked Matcha Latte (Hot / Iced)", zh: "抹茶拿铁（热 / 冷）" },
        chineseName: "抹茶拿铁（热/冷）",
        description: {
          en: "Earthy matcha whisked smooth with milk, served hot or over ice.",
          zh: "细腻手打抹茶融合醇香牛奶，微苦回甘、顺滑好喝。",
        },
        price: "£6.00",
        dietary: ["vegetarian"],
      },
      {
        id: "soya-or-sesame-hot",
        name: {
          en: "Warm Soya Milk or Black Sesame Paste (Hot)",
          zh: "豆奶 / 黑芝麻糊（热）",
        },
        chineseName: "豆奶/黑芝麻糊（热）",
        description: {
          en: "Choose silky warm house soya milk or thick, nutty toasted black sesame paste — cosy, comforting and classic with Jian Bing.",
          zh: "可选温润顺滑的热豆奶，或焙香浓稠的传统热黑芝麻糊，捧在手里暖手又暖胃。",
        },
        price: "£4.00",
        dietary: ["vegetarian"],
      },
      {
        id: "passion-fruit-sparkling",
        name: {
          en: "Sparkling Passion Fruit, Lemon & Lime",
          zh: "百香果气泡水",
        },
        chineseName: "百香果气泡水",
        description: {
          en: "Crisp sparkling refresher brightened with tangy passion fruit, fresh lemon and lime.",
          zh: "细密气泡裹着酸甜百香果与青柠香，冰凉解腻。",
        },
        price: "£6.00",
        dietary: ["vegan"],
      },
      {
        id: "passion-fruit-lemon-tea",
        name: { en: "Passion Fruit & Lemon Iced Tea", zh: "百香果柠檬红茶" },
        chineseName: "百香果柠檬红茶",
        description: {
          en: "Chilled black tea shaken with fresh lemon and tangy passion fruit — clean and refreshing.",
          zh: "醇香红茶摇入鲜柠檬与百香果肉，酸甜清爽。",
        },
        price: "£6.00",
        dietary: ["vegan"],
      },
      {
        id: "chilled-drinks",
        name: { en: "Chilled Bottled & Canned Drinks", zh: "冰镇饮品与王老吉" },
        chineseName: "饮料",
        description: {
          en: "Aloe Vera Juice (£2.50), Iced Green Tea (£2.50), Iced Lemon Red Tea (£2.50), Wang Lao Ji Herbal Tea (£2.00) and Lychee Juice (£2.00).",
          zh: "冷柜常备：芦荟汁 £2.50、冰绿茶 £2.50、冰红茶 £2.50、王老吉凉茶 £2.00、荔枝饮料 £2.00。",
        },
        price: "£2.00 – £2.50",
        dietary: ["vegan"],
      },
    ],
  },
  {
    id: "dips",
    title: { en: "House Dips & Sauces", zh: "秘制酱料" },
    chineseTitle: "秘制酱料",
    subtitle: {
      en: "Add an extra pot of Mrs Liu's homemade chilli oil or classic dipping sauce to any order.",
      zh: "配煎饼、煎饺或馄饨随时加一份自家秘制蘸料。",
    },
    items: [
      {
        id: "beef-chilli-sauce",
        name: { en: "House Special Beef Chilli Sauce", zh: "牛肉辣酱" },
        chineseName: "牛肉辣酱",
        description: {
          en: "Rich, fragrant homemade chilli oil simmered with savoury beef — a regulars' favourite.",
          zh: "自家慢熬的醇香牛肉辣酱，拌面配煎饼都特别提味。",
        },
        price: "£0.50",
      },
      {
        id: "chilli-sauce",
        name: { en: "Chinese Chilli Sauce", zh: "自家辣酱" },
        chineseName: "辣酱",
        description: {
          en: "Warming homemade Chinese chilli oil with toasted aromatics.",
          zh: "香辣不燥的自家熬制传统中式辣椒油。",
        },
        price: "£0.50",
        dietary: ["vegan"],
      },
      {
        id: "soya-sauce",
        name: { en: "Light Soya Sauce", zh: "生抽" },
        chineseName: "生抽",
        description: {
          en: "Classic savoury dipping soya sauce for dumplings and snacks.",
          zh: "搭配煎饺、春卷的鲜香生抽蘸料。",
        },
        price: "£0.50",
        dietary: ["vegan"],
      },
      {
        id: "mayonnaise",
        name: { en: "Mayonnaise", zh: "美乃滋" },
        chineseName: "美乃滋",
        description: {
          en: "Creamy mayonnaise dip.",
          zh: "顺滑香浓沙拉美乃滋蘸料。",
        },
        price: "£0.50",
        dietary: ["vegetarian"],
      },
    ],
  },
];

export const featuredMenuItems: MenuItem[] = menuCategories
  .flatMap((category) => category.items)
  .filter((item) => item.featured && item.image);
