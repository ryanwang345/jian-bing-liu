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
    title: { en: "Signature Savoury Crepes (Jian Bing)", zh: "招牌咸味煎饼" },
    chineseTitle: "招牌果蔬煎饼",
    subtitle: {
      en: "Chinese savoury crepes spread by hand on a hot round griddle, finished with house sauce and crispy fillings.",
      zh: "圆铁板手工现摊，搭配秘制咸香酱料、新鲜蔬菜与金黄酥脆。",
    },
    items: [
      {
        id: "beef-crepe",
        name: { en: "Beef Crepe", zh: "招牌牛肉煎饼" },
        chineseName: "牛肉煎饼",
        description: {
          en: "Halal beef, 2 eggs, crisp lettuce, spring onions, crispy fried onions, and our savoury homemade sauce.",
          zh: "选用清真牛肉，搭配双蛋、新鲜生菜、香葱、酥脆炸洋葱及秘制自调酱料，料足香浓。",
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
        name: { en: "Chicken Crepe", zh: "招牌鸡肉煎饼" },
        chineseName: "鸡肉煎饼",
        description: {
          en: "Halal chicken, 2 eggs, fresh lettuce, spring onions, crispy fried onions, and homemade sauce.",
          zh: "选用清真鸡肉，搭配双蛋、脆嫩生菜、香葱、酥脆炸洋葱与秘制酱料，鲜嫩爽口。",
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
        name: { en: "Veggie Lover Crepe", zh: "素食果蔬煎饼" },
        chineseName: "素食果蔬煎饼",
        description: {
          en: "Lettuce, spring onions, spinach, crispy fried onions, shredded potatoes, cucumber strips, and homemade sauce.",
          zh: "生菜、香葱、新鲜菠菜、酥脆炸洋葱、爽脆土豆丝与黄瓜丝，刷上秘制酱料，清爽满足。",
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
    title: { en: "Lunchtime Specials", zh: "午市精选煎饼" },
    chineseTitle: "午市精选",
    subtitle: {
      en: "Lighter single-egg portions for a quick lunch on Camden Road.",
      zh: "分量恰到好处的日常简餐，适合工作与逛街途中快速补充能量。",
    },
    items: [
      {
        id: "beef-crepe-lunch",
        name: { en: "Beef Crepe (Lunch)", zh: "午市牛肉煎饼" },
        chineseName: "午市牛肉煎饼",
        description: {
          en: "Halal beef, 1 egg, fresh lettuce, spring onions, and homemade sauce.",
          zh: "清真牛肉、单蛋、新鲜生菜、香葱与自家秘制酱料，轻盈解馋。",
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
        name: { en: "Chicken Crepe (Lunch)", zh: "午市鸡肉煎饼" },
        chineseName: "午市鸡肉煎饼",
        description: {
          en: "Halal chicken, 1 egg, fresh lettuce, spring onions, crispy fried onions, and homemade sauce.",
          zh: "清真鸡肉、单蛋、新鲜生菜、香葱、酥脆炸洋葱与自家秘制酱料。",
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
          en: "Fresh spinach, 1 egg, melted cheese, and our homemade sauce.",
          zh: "新鲜菠菜、单蛋、香浓拉丝芝士配秘制酱料，简单醇香。",
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
    title: { en: "Mains & Rice Dishes", zh: "家常热菜与盖饭" },
    chineseTitle: "热菜盖饭",
    subtitle: {
      en: "Homestyle hot dishes, served on their own or with steamed white rice.",
      zh: "暖心慢炖家常硬菜，可单点也可搭配热腾腾的白米饭。",
    },
    items: [
      {
        id: "braised-beef",
        name: { en: "Braised Beef", zh: "土豆胡萝卜炖牛肉" },
        chineseName: "土豆胡萝卜炖牛肉",
        description: {
          en: "Slow-braised beef with tender potatoes and carrots in rich savoury gravy.",
          zh: "软烂入味的慢炖牛肉，搭配绵软土豆与香甜胡萝卜，汤汁浓郁下饭。",
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
        name: { en: "Japanese Curry Chicken", zh: "日式脆鸡咖喱" },
        chineseName: "日式咖喱鸡",
        description: {
          en: "Crispy fried chicken with carrots and potatoes in smooth Japanese curry sauce.",
          zh: "外酥里嫩的炸鸡搭配软糯土豆与胡萝卜，裹满醇厚日式咖喱。",
        },
        price: "£9.95",
        secondaryPrice: { en: "£10.95 with rice", zh: "配米饭 £10.95" },
      },
      {
        id: "vegan-japanese-curry",
        name: { en: "Vegan Japanese Curry", zh: "纯素日式咖喱" },
        chineseName: "素食日式咖喱",
        description: {
          en: "Plant-based Japanese curry simmered with chunky carrots, sweet onions, and potatoes.",
          zh: "胡萝卜、洋葱与大块土豆慢炖而成的醇香纯素日式咖喱。",
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
        name: { en: "Plain Steamed White Rice", zh: "香蒸白米饭" },
        chineseName: "白米饭",
        description: {
          en: "Fluffy freshly steamed white rice.",
          zh: "粒粒松软的热腾腾白米饭。",
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
      en: "Handmade wontons served piping hot in light, clear broth.",
      zh: "皮薄馅鲜的手工馄饨，配一碗清爽暖胃的高汤。",
    },
    items: [
      {
        id: "beef-wonton",
        name: { en: "Beef Wonton Soup", zh: "牛肉馄饨" },
        chineseName: "牛肉馄饨",
        description: {
          en: "Savoury beef wontons in a light, hot broth.",
          zh: "鲜香牛肉馅手工馄饨，泡在清润暖胃的热汤里。",
        },
        price: "£5.95",
      },
      {
        id: "shrimp-wonton",
        name: { en: "Shrimp Wonton Soup", zh: "鲜虾馄饨" },
        chineseName: "鲜虾馄饨",
        description: {
          en: "Plump shrimp wontons in a clear, fragrant broth.",
          zh: "饱满弹牙的鲜虾馄饨，汤鲜味美。",
        },
        price: "£8.00",
      },
    ],
  },
  {
    id: "snacks-and-dumplings",
    title: { en: "Snacks & Dumplings", zh: "街头小吃与煎饺" },
    chineseTitle: "街头小吃",
    subtitle: {
      en: "Pan-fried dumplings, crispy spring rolls, and spiced tea eggs.",
      zh: "底部焦脆的手工煎饺、酥香春卷与古法五香茶叶蛋。",
    },
    items: [
      {
        id: "beef-dumplings",
        name: { en: "Beef Dumplings", zh: "牛肉煎饺" },
        chineseName: "牛肉煎饺",
        description: {
          en: "Halal beef mince seasoned with oyster sauce, carrots, egg, and fragrant sesame oil.",
          zh: "选用清真牛肉馅，以蚝油、胡萝卜、鲜蛋与香油调味，煎至金黄酥脆。",
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
        name: { en: "Vegetarian Dumplings (2 pcs)", zh: "素煎饺（2 只）" },
        chineseName: "素煎饺",
        description: {
          en: "Bean sprouts, carrots, rice vermicelli, and ginger, served with homemade spiced oil.",
          zh: "爽口豆芽、胡萝卜、粉丝与鲜姜调馅，配自家秘制香料油，清香酥脆。",
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
        name: { en: "Tea Egg", zh: "五香茶叶蛋" },
        chineseName: "茶叶蛋",
        description: {
          en: "Whole egg steeped in black tea, soy sauce, and whole spices.",
          zh: "红茶、酱油与整粒香料慢卤入味的经典中式茶叶蛋。",
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
        name: { en: "Vegetarian Spring Rolls", zh: "酥炸素春卷" },
        chineseName: "素春卷",
        description: {
          en: "Crisp golden pastry rolls filled with seasoned vegetables.",
          zh: "外皮金黄酥脆、内馅鲜香爽口的传统蔬菜春卷。",
        },
        price: null,
        note: {
          en: "Ask in-store or check All Eat for today's price",
          zh: "价格以店内或在线点餐页面为准",
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
    title: { en: "Sweet Crepes & Desserts", zh: "花式甜煎饼与甜品" },
    chineseTitle: "甜煎饼与甜品",
    subtitle: {
      en: "Warm sweet crepes, lacy dessert cones, and classic Chinese desserts.",
      zh: "香甜松脆的现摊甜煎饼、手工蕾丝甜筒以及暖心传统中式甜品。",
    },
    items: [
      {
        id: "nutella-crepe",
        name: { en: "Nutella Crepe", zh: "榛子巧克力甜煎饼" },
        chineseName: "榛子巧克力甜煎饼",
        description: {
          en: "Warm sweet crepe spread with Nutella; ask at the counter for fresh fruit toppings.",
          zh: "现摊热乎甜饼皮抹上浓郁榛子巧克力酱，到店可选加新鲜草莓、香蕉等丰富配料。",
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
        name: { en: "Mango Sago", zh: "鲜果杨枝甘露" },
        chineseName: "杨枝甘露",
        description: {
          en: "Chilled sweet mango dessert with chewy sago pearls.",
          zh: "精选新鲜甜芒果与弹滑西米手工调制，冰凉清甜。",
        },
        price: "£6.00",
        dietary: ["vegetarian"],
      },
      {
        id: "black-sesame-paste",
        name: {
          en: "Hand-Brewed Black Sesame Paste (Hot)",
          zh: "手磨热黑芝麻糊",
        },
        chineseName: "手磨黑芝麻糊",
        description: {
          en: "Thick, warm traditional dessert made from toasted black sesame.",
          zh: "浓稠顺滑、芝麻香气扑鼻的传统热甜品，暖胃又解馋。",
        },
        price: "£2.99",
        dietary: ["vegetarian"],
      },
      {
        id: "fancy-lace-dessert-cone",
        name: { en: "Fancy Lace Sweet Crepe Cone", zh: "花式蕾丝甜筒煎饼" },
        chineseName: "花式蕾丝甜筒",
        description: {
          en: "Crisp hand-piped lace crepe rolled into a cone with whipped cream, fresh fruit, and biscuit sticks.",
          zh: "招牌手工挤制粉色蕾丝脆边饼皮卷成甜筒，装满绵密奶油、鲜果、抹茶饼干棒与可爱小熊饼干。",
        },
        price: null,
        note: {
          en: "Seasonal toppings — ask at the counter",
          zh: "当季配料与价格请以店内为准",
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
    title: { en: "Drinks & Refreshers", zh: "手调饮品与豆浆" },
    chineseTitle: "手调饮品",
    subtitle: {
      en: "Hand-whisked matcha, fresh fruit drinks, classic soya milk, and chilled cans.",
      zh: "现磨豆浆、手打抹茶、鲜果特调与多款冰镇罐装饮料。",
    },
    items: [
      {
        id: "matcha-latte",
        name: {
          en: "Hand-Brewed Matcha Latte (Hot / Iced)",
          zh: "手打抹茶拿铁（热 / 冰）",
        },
        chineseName: "手打抹茶拿铁",
        description: {
          en: "Smooth hand-whisked matcha, served hot or over ice.",
          zh: "细腻手打抹茶融合醇香牛奶，冷热皆宜。",
        },
        price: "£2.99",
        dietary: ["vegetarian"],
      },
      {
        id: "passion-fruit-sparkling",
        name: { en: "Passion Fruit Sparkling", zh: "百香果气泡饮" },
        chineseName: "百香果气泡饮",
        description: {
          en: "Lightly sparkling iced drink with tangy passion fruit.",
          zh: "酸甜爽口的气泡果饮，满口清新百香果香。",
        },
        price: "£5.80",
        dietary: ["vegan"],
      },
      {
        id: "passion-fruit-lemon-tea",
        name: { en: "Passion Fruit Iced Lemon Tea", zh: "百香果冰柠檬茶" },
        chineseName: "百香果冰柠檬茶",
        description: {
          en: "Chilled tea with fresh lemon and passion fruit.",
          zh: "冰爽醇香茶底遇上鲜柠檬与百香果，解腻开胃。",
        },
        price: "£5.80",
        dietary: ["vegan"],
      },
      {
        id: "watermelon-juice",
        name: {
          en: "Hand-Made Watermelon Juice (500ml)",
          zh: "鲜榨西瓜汁（500ml）",
        },
        chineseName: "鲜榨西瓜汁",
        description: {
          en: "Freshly made chilled watermelon juice.",
          zh: "清甜解渴的现制冰爽西瓜汁。",
        },
        price: "£5.80",
        dietary: ["vegan"],
      },
      {
        id: "soya-milk",
        name: { en: "Soya Milk (Hot / Cold)", zh: "经典现磨豆浆（热 / 冰）" },
        chineseName: "现磨豆浆",
        description: {
          en: "Smooth, classic Chinese soya milk, served hot or cold alongside your Jian Bing.",
          zh: "温润顺滑的传统豆浆，是配热煎饼的绝佳搭档。",
        },
        price: "£2.00",
        dietary: ["vegan"],
      },
      {
        id: "chilled-soft-drinks",
        name: { en: "Chilled Cans & Soft Drinks", zh: "冰镇汽水与饮料" },
        chineseName: "冰镇汽水",
        description: {
          en: "Chilled cans and bottles in the fridge, including Coca-Cola, Diet Coke, Fanta, Sprite, Old Jamaica Ginger Beer, and Ting.",
          zh: "店内冷柜常备多款罐装及瓶装饮品，包括可口可乐、健怡可乐、芬达、雪碧、姜汁汽水及西柚汽水等。",
        },
        price: null,
        note: {
          en: "See fridge in-store for prices",
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
