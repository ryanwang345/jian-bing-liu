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
  /** Verified price string, or null when unverified */
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
    title: { en: "Signature Jian Bing (Savoury Crepes)", zh: "招牌咸味煎饼" },
    chineseTitle: "招牌果蔬煎饼",
    subtitle: {
      en: "Freshly griddled to order with natural fruit-and-veg batter, two cracked eggs, a crisp wonton centre and Mrs Liu's house sauce.",
      zh: "天然果蔬面糊上热铁板手工现摊，磕双蛋、刷自家慢熬咸香酱、夹酥脆配料，趁热折好装袋。",
    },
    items: [
      {
        id: "beef-crepe",
        name: { en: "Beef Jian Bing", zh: "招牌牛肉煎饼" },
        chineseName: "牛肉煎饼",
        description: {
          en: "Tender Halal beef folded into a hot, crisp two-egg crepe with lettuce, spring onions, crunchy fried shallots and our savoury house sauce. Properly filling.",
          zh: "热乎脆香的双蛋果蔬饼皮，裹满鲜嫩清真牛肉、脆生菜、香葱、酥脆炸洋葱和自家咸香酱，拿在手里沉甸甸的，实在又顶饱。",
        },
        price: "£10.00",
        dietary: ["halal"],
        featured: true,
        image: "/images/beef-crepe-sleeve.webp",
        imageAlt: {
          en: "Freshly griddled Beef Jian Bing crepe sprinkled with black sesame seeds in a kraft paper sleeve",
          zh: "刚出锅撒满黑芝麻的招牌牛肉煎饼，包裹着酥脆配料装在牛皮纸袋中",
        },
      },
      {
        id: "chicken-crepe",
        name: { en: "Chicken Jian Bing", zh: "招牌鸡肉煎饼" },
        chineseName: "鸡肉煎饼",
        description: {
          en: "Savoury Halal chicken, two eggs, fresh greens and crisp fried shallots wrapped in a warm crepe brushed with house sauce — rich, crunchy and comforting.",
          zh: "鲜嫩清真鸡肉配上双蛋、鲜脆生菜与金黄炸洋葱，现摊饼皮刷满秘制酱，外柔内脆、香而不腻。",
        },
        price: "£10.00",
        dietary: ["halal"],
        featured: true,
        image: "/images/hero-jianbing-platter.webp",
        imageAlt: {
          en: "Signature herb-studded Chicken Jian Bing crepe sliced in half on a plate beside a Jian Bing Liu kraft sleeve",
          zh: "切开展示丰富内馅的招牌果蔬鸡肉煎饼，摆放在白色餐盘上，旁有煎饼刘牛皮纸袋",
        },
      },
      {
        id: "veggie-lover-crepe",
        name: { en: "Veggie Lover Jian Bing", zh: "素食果蔬煎饼" },
        chineseName: "素食果蔬煎饼",
        description: {
          en: "Crunchy shredded potato, cool cucumber, fresh spinach, lettuce and fried shallots tucked inside a natural fruit-and-veg crepe with our savoury house sauce.",
          zh: "爽脆土豆丝、清口黄瓜条、嫩菠菜、生菜与酥香炸洋葱，卷进鲜榨果蔬饼皮里刷上咸香酱，清爽又管饱。",
        },
        price: "£6.00",
        dietary: ["vegetarian"],
        featured: true,
        image: "/images/veggie-crepe-griddle.webp",
        imageAlt: {
          en: "Colourful fruit-and-vegetable batter Veggie Lover Jian Bing crepe topped with fresh greens on the griddle",
          zh: "铁板上刚摊好的彩色果蔬面糊煎饼，铺满翠绿蔬菜与香葱",
        },
      },
    ],
  },
  {
    id: "lunchtime-specials",
    title: { en: "Lighter Lunch Crepes", zh: "午市精选煎饼" },
    chineseTitle: "午市精选",
    subtitle: {
      en: "Single-egg crepes made fresh in minutes — ideal for a quick Camden lunch on the move.",
      zh: "分量恰到好处的单蛋现摊煎饼，几分钟热乎出锅，上课上班途中顺手带走最合适。",
    },
    items: [
      {
        id: "beef-crepe-lunch",
        name: { en: "Beef Jian Bing (Lunch)", zh: "午市牛肉煎饼" },
        chineseName: "午市牛肉煎饼",
        description: {
          en: "A lighter lunchtime portion with Halal beef, one egg, crisp lettuce, spring onions and house savoury sauce.",
          zh: "轻盈不撑胃的午市分量，清真牛肉、单蛋、脆生菜、香葱配自家咸香酱，简单解馋。",
        },
        price: "£6.50",
        dietary: ["halal"],
        image: "/images/chicken-crepe-sleeve.webp",
        imageAlt: {
          en: "Warm golden Jian Bing crepe folded into a kraft takeaway sleeve",
          zh: "热气腾腾装在牛皮纸袋中的金黄煎饼",
        },
      },
      {
        id: "chicken-crepe-lunch",
        name: { en: "Chicken Jian Bing (Lunch)", zh: "午市鸡肉煎饼" },
        chineseName: "午市鸡肉煎饼",
        description: {
          en: "A lighter lunchtime portion with Halal chicken, one egg, fresh lettuce, spring onions, crunchy shallots and house sauce.",
          zh: "清真鸡肉、单蛋、新鲜生菜、香葱和脆洋葱刷上秘制酱，热乎趁手，刚好一顿舒服的午饭。",
        },
        price: "£6.50",
        dietary: ["halal"],
        image: "/images/golden-sesame-jianbing.webp",
        imageAlt: {
          en: "Golden sesame-crusted Chicken Jian Bing crepe sliced to show fresh shredded vegetables",
          zh: "表面撒满黑芝麻的金黄煎饼，对半切开露出鲜脆蔬菜丝与酥脆内馅",
        },
      },
      {
        id: "spinach-cheese-crepe",
        name: { en: "Spinach & Cheese Crepe", zh: "菠菜芝士煎饼" },
        chineseName: "菠菜芝士煎饼",
        description: {
          en: "Fresh spinach, one egg and melted cheese folded into a warm crepe with a light brush of house sauce — simple, cosy and under a fiver.",
          zh: "鲜嫩菠菜、一颗鸡蛋加上热乎融化的香浓芝士，轻刷一层自家酱，简单踏实又暖心。",
        },
        price: "£4.00",
        dietary: ["vegetarian"],
        image: "/images/folded-rainbow-crepe.webp",
        imageAlt: {
          en: "Freshly folded vegetable-batter crepe sizzling on the hot griddle",
          zh: "铁板上正在折叠的彩色果蔬面糊煎饼",
        },
      },
    ],
  },
  {
    id: "mains-and-rice",
    title: { en: "Homestyle Mains & Rice", zh: "家常热菜与盖饭" },
    chineseTitle: "热菜盖饭",
    subtitle: {
      en: "Slow-cooked comfort dishes from Mrs Liu's kitchen — order on their own or over hot steamed rice.",
      zh: "像家里灶台上慢火炖出的热乎家常菜，可单点，浇在白米饭上更香。",
    },
    items: [
      {
        id: "braised-beef",
        name: { en: "Slow-Braised Beef", zh: "土豆胡萝卜炖牛肉" },
        chineseName: "土豆胡萝卜炖牛肉",
        description: {
          en: "Beef braised slowly until fork-tender with soft potatoes and sweet carrots in a rich, glossy gravy. Best ladled over steamed rice.",
          zh: "慢火咕嘟炖到软烂入味的牛肉，配上吸饱汤汁的绵软土豆和清甜胡萝卜，拌着热米饭吃格外踏实。",
        },
        price: "£11.95",
        secondaryPrice: { en: "£12.95 with rice", zh: "配米饭 £12.95" },
        featured: true,
        image: "/images/braised-beef-rice.webp",
        imageAlt: {
          en: "Tender braised beef with potatoes and carrots served alongside heart-shaped steamed white rice",
          zh: "色泽诱人的土豆胡萝卜炖牛肉，搭配心形热腾腾的白米饭",
        },
      },
      {
        id: "japanese-curry-chicken",
        name: { en: "Crispy Chicken Japanese Curry", zh: "日式脆鸡咖喱" },
        chineseName: "日式咖喱鸡",
        description: {
          en: "Golden fried chicken served with tender carrots and potatoes in a mild, velvety Japanese curry sauce.",
          zh: "炸得外酥里嫩的鸡肉，配软糯土豆与胡萝卜，浇上微甜顺滑的醇香咖喱，温和暖胃。",
        },
        price: "£9.95",
        secondaryPrice: { en: "£10.95 with rice", zh: "配米饭 £10.95" },
      },
      {
        id: "vegan-japanese-curry",
        name: { en: "Vegan Japanese Curry", zh: "纯素日式咖喱" },
        chineseName: "素食日式咖喱",
        description: {
          en: "A warming, gently spiced plant-based curry simmered with chunky potatoes, sweet onions and carrots.",
          zh: "大块土豆、甜洋葱和胡萝卜慢慢熬出自然清甜，裹满柔和浓香的纯素咖喱，暖心不腻。",
        },
        price: "£6.95",
        secondaryPrice: { en: "£7.95 with rice", zh: "配米饭 £7.95" },
        dietary: ["vegan"],
        featured: true,
        image: "/images/vegan-japanese-curry.webp",
        imageAlt: {
          en: "Golden Vegan Japanese Curry with chunky potatoes and carrots served next to heart-shaped steamed rice",
          zh: "浓郁金黄的纯素土豆胡萝卜日式咖喱配心形白米饭",
        },
      },
      {
        id: "plain-steamed-rice",
        name: { en: "Steamed White Rice", zh: "香蒸白米饭" },
        chineseName: "白米饭",
        description: {
          en: "Soft, fluffy steamed white rice — the ideal base for our braised beef or curries.",
          zh: "刚出锅的松软白米饭，配炖牛肉或咖喱最合适。",
        },
        price: "£4.95",
        dietary: ["vegan"],
      },
    ],
  },
  {
    id: "wonton-soups",
    title: { en: "Wonton Soups", zh: "鲜汤馄饨" },
    chineseTitle: "鲜汤馄饨",
    subtitle: {
      en: "Delicate handmade wontons served steaming hot in a light, clear broth.",
      zh: "皮薄馅鲜的手工馄饨，端在手里热腾腾的一碗清汤，喝完浑身舒坦。",
    },
    items: [
      {
        id: "beef-wonton",
        name: { en: "Beef Wonton Soup", zh: "牛肉馄饨" },
        chineseName: "牛肉馄饨",
        description: {
          en: "Savoury handmade beef wontons in a light, piping-hot broth — simple and soothing on a grey London day.",
          zh: "手工包制的鲜香牛肉馄饨，泡在清亮滚烫的热汤里，伦敦阴雨天吃上一碗特别暖和。",
        },
        price: "£5.95",
      },
      {
        id: "shrimp-wonton",
        name: { en: "Prawn Wonton Soup", zh: "鲜虾馄饨" },
        chineseName: "鲜虾馄饨",
        description: {
          en: "Plump, juicy prawn wontons floating in a clean, fragrant broth.",
          zh: "饱满弹嫩的鲜虾馅手工馄饨，汤头清鲜不油腻，每一口都鲜甜。",
        },
        price: "£8.00",
      },
    ],
  },
  {
    id: "snacks-and-dumplings",
    title: { en: "Dumplings & Street Snacks", zh: "街头小吃与煎饺" },
    chineseTitle: "街头小吃",
    subtitle: {
      en: "Golden pan-fried dumplings, crisp spring rolls and traditional tea eggs — easy to add onto any order.",
      zh: "底面金黄焦脆的手工煎饺、酥香春卷和五香茶叶蛋，单买或顺手加配都正好。",
    },
    items: [
      {
        id: "beef-dumplings",
        name: { en: "Pan-Fried Beef Dumplings", zh: "牛肉煎饺" },
        chineseName: "牛肉煎饺",
        description: {
          en: "Crisp and golden underneath, juicy inside — filled with Halal beef, sweet carrot, egg and a hint of toasted sesame. £1 each.",
          zh: "底部煎得金黄焦脆、咬开鲜嫩多汁；清真牛肉混着甜胡萝卜、鸡蛋与点点芝麻香，£1 一只随心加。",
        },
        price: "£1.00",
        dietary: ["halal"],
        featured: true,
        image: "/images/beef-dumplings-plate.webp",
        imageAlt: {
          en: "Golden crispy pan-fried beef dumplings plated on a red dish with dipping sauce and fresh greens",
          zh: "红色餐盘上金黄酥脆的牛肉煎饺，配秘制蘸料与新鲜生菜",
        },
      },
      {
        id: "vegetarian-dumplings",
        name: { en: "Pan-Fried Veggie Dumplings (2 pcs)", zh: "素煎饺（2 只）" },
        chineseName: "素煎饺",
        description: {
          en: "Two crisp pan-fried dumplings stuffed with glass noodles, carrot, bean sprouts and fresh ginger, finished with fragrant house spiced oil.",
          zh: "脆豆芽、胡萝卜、粉丝与鲜姜调成的清香素馅，煎出金黄脆底，淋上自家香料油格外提味。",
        },
        price: "£1.50",
        dietary: ["vegetarian"],
        image: "/images/veggie-dumplings-ring.webp",
        imageAlt: {
          en: "Ring of golden crispy vegetarian dumplings arranged on a red plate",
          zh: "围成一圈的金黄酥脆素煎饺摆放在红盘中",
        },
      },
      {
        id: "tea-egg",
        name: { en: "Spiced Tea Egg", zh: "五香茶叶蛋" },
        chineseName: "茶叶蛋",
        description: {
          en: "A classic Chinese street snack — whole egg slowly steeped in black tea, soy and warming whole spices until deeply savoury.",
          zh: "整颗鸡蛋泡在红茶、酱油和整粒香料卤汁里慢慢浸出花纹，剥开满是熟悉的老家街头茶香。",
        },
        price: "£1.00",
        dietary: ["vegetarian"],
        image: "/images/spiced-tea-eggs.webp",
        imageAlt: {
          en: "Whole Chinese tea eggs steeping in rich dark spiced tea marinade",
          zh: "浸泡在浓郁红茶卤汁里的整颗五香茶叶蛋",
        },
      },
      {
        id: "vegetarian-spring-rolls",
        name: { en: "Crispy Veggie Spring Rolls", zh: "酥炸素春卷" },
        chineseName: "素春卷",
        description: {
          en: "Light, flaky golden pastry packed with seasoned vegetables, cooked crisp to order.",
          zh: "薄皮炸得金黄松脆，里面裹满清甜爽口蔬菜丝，趁热咬下去咔嚓作响。",
        },
        price: null,
        note: {
          en: "Ask at the counter or check Fantuan for today's price",
          zh: "当日价格以门店或饭团外卖页面为准",
        },
        dietary: ["vegetarian"],
        image: "/images/veg-spring-rolls.webp",
        imageAlt: {
          en: "Crispy golden vegetarian spring rolls sliced open on a heart-shaped plate",
          zh: "心形白盘上切开的金黄酥脆素春卷",
        },
      },
    ],
  },
  {
    id: "sweet-crepes-and-desserts",
    title: { en: "Sweet Crepes & Traditional Desserts", zh: "花式甜煎饼与甜品" },
    chineseTitle: "甜煎饼与甜品",
    subtitle: {
      en: "Warm folded crepes, hand-piped lace cones and cosy Chinese desserts.",
      zh: "热乎松软的甜煎饼、手工现挤蕾丝甜筒，以及几款温润的中式甜品。",
    },
    items: [
      {
        id: "nutella-crepe",
        name: { en: "Warm Nutella Crepe", zh: "榛子巧克力甜煎饼" },
        chineseName: "榛子巧克力甜煎饼",
        description: {
          en: "A warm, soft crepe generously spread with Nutella — ask at the counter to add fresh strawberries or banana.",
          zh: "刚出锅的软韧甜饼皮，厚厚抹上一层融化的榛子巧克力酱；到店还可让阿姨加切新鲜草莓或香蕉。",
        },
        price: "£4.00",
        dietary: ["vegetarian"],
        featured: true,
        image: "/images/nutella-strawberry-crepe.webp",
        imageAlt: {
          en: "Folded sweet crepe topped with sliced strawberries, banana, whipped cream, and chocolate drizzle on a wooden heart board",
          zh: "木质心形盘上的折叠甜煎饼，铺满鲜草莓、香蕉片、奶油与巧克力酱",
        },
      },
      {
        id: "mango-sago",
        name: { en: "Chilled Mango Sago", zh: "鲜果杨枝甘露" },
        chineseName: "杨枝甘露",
        description: {
          en: "Cool, creamy sweet mango dessert layered with soft sago pearls — bright, light and refreshing.",
          zh: "冰凉清甜的新鲜芒果泥配软弹西米，果香自然不腻，吃完热煎饼来一杯特别爽口。",
        },
        price: "£6.00",
        dietary: ["vegetarian"],
      },
      {
        id: "black-sesame-paste",
        name: {
          en: "Warm Toasted Black Sesame Paste",
          zh: "手磨热黑芝麻糊",
        },
        chineseName: "手磨黑芝麻糊",
        description: {
          en: "Thick, nutty and gently sweet — a cosy traditional Chinese hot dessert made from roasted black sesame.",
          zh: "焙香黑芝麻慢慢磨煮得浓稠顺滑，甜度柔和、香气醇厚，捧在手里暖手又暖胃。",
        },
        price: "£2.99",
        dietary: ["vegetarian"],
      },
      {
        id: "fancy-lace-dessert-cone",
        name: { en: "Pink Lace Crepe Cone", zh: "花式蕾丝甜筒煎饼" },
        chineseName: "花式蕾丝甜筒",
        description: {
          en: "Crisp pink lace batter piped by hand on the griddle, rolled into a cone and filled with whipped cream, fresh fruit and biscuit sticks.",
          zh: "铁板上手工挤出轻脆粉色蕾丝边，趁热卷成甜筒，装满绵密奶油、鲜果和小饼干棒，甜而不腻。",
        },
        price: null,
        note: {
          en: "Seasonal fruit toppings — ask at the counter",
          zh: "当季鲜果与售价请以门店现场为准",
        },
        dietary: ["vegetarian"],
        image: "/images/fancy-lace-dessert-cone.webp",
        imageAlt: {
          en: "Pink lace dessert crepe cone filled with whipped cream, fresh strawberry, matcha biscuit sticks, and teddy cookies",
          zh: "粉色手工蕾丝边甜筒煎饼，装满奶油、鲜草莓、抹茶饼干棒和小熊饼干",
        },
      },
    ],
  },
  {
    id: "drinks",
    title: { en: "Drinks & House Soya Milk", zh: "手调饮品与豆浆" },
    chineseTitle: "手调饮品",
    subtitle: {
      en: "House-made soya milk, whisked matcha, fresh fruit refreshers and chilled tins from the fridge.",
      zh: "每日现磨豆浆、手打抹茶、鲜果冷饮，以及冷柜里常备的冰镇罐装饮料。",
    },
    items: [
      {
        id: "matcha-latte",
        name: {
          en: "Whisked Matcha Latte (Hot / Iced)",
          zh: "手打抹茶拿铁（热 / 冰）",
        },
        chineseName: "手打抹茶拿铁",
        description: {
          en: "Earthy matcha whisked smooth with milk, served hot or over ice.",
          zh: "细腻手打抹茶融合醇香牛奶，微苦回甘、口感顺滑，冷热都好喝。",
        },
        price: "£2.99",
        dietary: ["vegetarian"],
      },
      {
        id: "passion-fruit-sparkling",
        name: { en: "Passion Fruit Sparkling", zh: "百香果气泡饮" },
        chineseName: "百香果气泡饮",
        description: {
          en: "Crisp, lightly sparkling iced drink brightened with tangy passion fruit.",
          zh: "清爽细密的气泡裹着酸甜百香果香，冰凉解腻，配咸煎饼很合拍。",
        },
        price: "£5.80",
        dietary: ["vegan"],
      },
      {
        id: "passion-fruit-lemon-tea",
        name: { en: "Passion Fruit Iced Lemon Tea", zh: "百香果冰柠檬茶" },
        chineseName: "百香果冰柠檬茶",
        description: {
          en: "Chilled tea shaken with fresh lemon and tangy passion fruit — clean and thirst-quenching.",
          zh: "清香茶底摇入鲜榨柠檬和酸甜百香果，冰爽清口，喝完嘴里干干净净。",
        },
        price: "£5.80",
        dietary: ["vegan"],
      },
      {
        id: "watermelon-juice",
        name: {
          en: "Freshly Pressed Watermelon Juice (500ml)",
          zh: "鲜榨西瓜汁（500ml）",
        },
        chineseName: "鲜榨西瓜汁",
        description: {
          en: "Cold, crisp watermelon juice pressed fresh — sweet and genuinely refreshing.",
          zh: "新鲜西瓜现榨装杯，清甜水润不掺水，解辣又解渴。",
        },
        price: "£5.80",
        dietary: ["vegan"],
      },
      {
        id: "soya-milk",
        name: { en: "House Soya Milk (Hot / Cold)", zh: "经典现磨豆浆（热 / 冰）" },
        chineseName: "现磨豆浆",
        description: {
          en: "Silky, lightly sweet traditional soya milk — served warm or chilled, and the classic pairing for a hot Jian Bing.",
          zh: "温润顺滑、带着淡淡豆香的现磨豆浆，冷热皆宜，配刚出锅的热煎饼最是熟悉的家味。",
        },
        price: "£2.00",
        dietary: ["vegan"],
      },
      {
        id: "chilled-soft-drinks",
        name: { en: "Chilled Cans & Soft Drinks", zh: "冰镇汽水与饮料" },
        chineseName: "冰镇汽水",
        description: {
          en: "Cold cans and bottles from the fridge, including Coke, Diet Coke, Fanta, Sprite, Old Jamaica Ginger Beer and Ting.",
          zh: "冷柜常备多款冰镇罐装与瓶装饮品，有可乐、健怡可乐、芬达、雪碧、姜汁汽水与西柚汽水。",
        },
        price: null,
        note: {
          en: "See the fridge in-store for prices",
          zh: "价格以店内冷柜标价为准",
        },
        dietary: ["vegan"],
      },
    ],
  },
];

export const featuredMenuItems: MenuItem[] = menuCategories
  .flatMap((category) => category.items)
  .filter((item) => item.featured && item.image);
