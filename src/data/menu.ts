export type DietaryTag = "Halal" | "Vegetarian" | "Vegan";

export interface MenuItem {
  id: string;
  name: string;
  chineseName?: string;
  description: string;
  /** Verified price string, or null when unverified (renders a clear placeholder) */
  price: string | null;
  secondaryPrice?: string;
  dietary?: DietaryTag[];
  featured?: boolean;
  image?: string;
  imageAlt?: string;
  note?: string;
}

export interface MenuCategory {
  id: string;
  title: string;
  chineseTitle: string;
  subtitle: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: "savoury-crepes",
    title: "Signature Savoury Crepes (Jian Bing)",
    chineseTitle: "招牌果蔬煎饼",
    subtitle:
      "Hand-spread Chinese savoury crepes cooked fresh on the round griddle with homemade sauce and crispy layers.",
    items: [
      {
        id: "beef-crepe",
        name: "Beef Crepe",
        chineseName: "牛肉煎饼",
        description:
          "Halal beef, 2 eggs, crisp lettuce, spring onions, crispy fried onions, and our savoury homemade sauce.",
        price: "£10.00",
        dietary: ["Halal"],
        featured: true,
        image: "/images/beef-crepe-sleeve.jpg",
        imageAlt:
          "Freshly griddled Beef Jian Bing crepe sprinkled with black sesame seeds and packed with crispy layers in a kraft paper sleeve",
      },
      {
        id: "chicken-crepe",
        name: "Chicken Crepe",
        chineseName: "鸡肉煎饼",
        description:
          "Halal chicken, 2 eggs, fresh lettuce, spring onions, crispy fried onions, and homemade sauce.",
        price: "£10.00",
        dietary: ["Halal"],
        featured: true,
        image: "/images/hero-jianbing-platter.jpg",
        imageAlt:
          "Signature herb-studded Chicken Jian Bing crepe sliced in half on a plate beside a Jian Bing Liu kraft sleeve",
      },
      {
        id: "veggie-lover-crepe",
        name: "Veggie Lover Crepe",
        chineseName: "素食果蔬煎饼",
        description:
          "Lettuce, spring onions, spinach, crispy fried onions, shredded potatoes, cucumber strips, and homemade sauce.",
        price: "£6.00",
        dietary: ["Vegetarian"],
        featured: true,
        image: "/images/veggie-crepe-griddle.jpg",
        imageAlt:
          "Colourful fruit-and-vegetable batter Veggie Lover Jian Bing crepe topped with fresh greens and herbs on the griddle",
      },
    ],
  },
  {
    id: "lunchtime-specials",
    title: "Lunchtime Specials",
    chineseTitle: "午市精选",
    subtitle:
      "Lighter everyday crepe portions crafted for a quick, satisfying Camden lunch.",
    items: [
      {
        id: "beef-crepe-lunch",
        name: "Beef Crepe (Lunch)",
        chineseName: "午市牛肉煎饼",
        description:
          "Halal beef, 1 egg, fresh lettuce, spring onions, and homemade sauce.",
        price: "£6.50",
        dietary: ["Halal"],
        image: "/images/chicken-crepe-sleeve.jpg",
        imageAlt: "Warm golden Jian Bing crepe folded into a kraft takeaway sleeve",
      },
      {
        id: "chicken-crepe-lunch",
        name: "Chicken Crepe (Lunch)",
        chineseName: "午市鸡肉煎饼",
        description:
          "Halal chicken, 1 egg, fresh lettuce, spring onions, crispy fried onions, and homemade sauce.",
        price: "£6.50",
        dietary: ["Halal"],
        image: "/images/golden-sesame-jianbing.jpg",
        imageAlt:
          "Golden sesame-crusted Chicken Jian Bing crepe sliced to show fresh shredded vegetables and crispy filling",
      },
      {
        id: "spinach-cheese-crepe",
        name: "Spinach & Cheese Crepe",
        chineseName: "菠菜芝士煎饼",
        description:
          "Fresh spinach, 1 egg, melted cheese, and our homemade sauce.",
        price: "£4.00",
        dietary: ["Vegetarian"],
        image: "/images/folded-rainbow-crepe.jpg",
        imageAlt: "Freshly folded vegetable-batter crepe sizzling on the hot griddle",
      },
    ],
  },
  {
    id: "mains-and-rice",
    title: "Mains & Rice Dishes",
    chineseTitle: "热菜盖饭",
    subtitle:
      "Warm, comforting homestyle dishes — enjoy on their own or paired with freshly steamed rice.",
    items: [
      {
        id: "braised-beef",
        name: "Braised Beef",
        chineseName: "土豆胡萝卜炖牛肉",
        description:
          "Slow-braised beef simmered with tender potatoes and carrots in rich savoury gravy.",
        price: "£11.95",
        secondaryPrice: "£12.95 with rice",
        featured: true,
        image: "/images/braised-beef-rice.jpg",
        imageAlt:
          "Tender braised beef with potatoes and carrots served alongside heart-shaped steamed white rice",
      },
      {
        id: "japanese-curry-chicken",
        name: "Japanese Curry Chicken",
        chineseName: "日式咖喱鸡",
        description:
          "Crispy fried chicken paired with tender carrots and potatoes in smooth Japanese curry sauce.",
        price: "£9.95",
        secondaryPrice: "£10.95 with rice",
      },
      {
        id: "vegan-japanese-curry",
        name: "Vegan Japanese Curry",
        chineseName: "素食日式咖喱",
        description:
          "Hearty plant-based curry cooked with carrots, sweet onions, and potatoes.",
        price: "£6.95",
        secondaryPrice: "£7.95 with rice",
        dietary: ["Vegan"],
        featured: true,
        image: "/images/vegan-japanese-curry.jpg",
        imageAlt:
          "Golden Vegan Japanese Curry with chunky potatoes and carrots served next to heart-shaped steamed rice",
      },
      {
        id: "plain-steamed-rice",
        name: "Plain Steamed White Rice",
        chineseName: "白米饭",
        description: "Fluffy freshly steamed white rice.",
        price: "£4.95",
        dietary: ["Vegan"],
      },
    ],
  },
  {
    id: "wonton-soups",
    title: "Wonton Soups",
    chineseTitle: "鲜汤馄饨",
    subtitle: "Delicate handmade wontons served piping hot in comforting broth.",
    items: [
      {
        id: "beef-wonton",
        name: "Beef Wonton Soup",
        chineseName: "牛肉馄饨",
        description: "Savoury beef-filled wontons in a light, warming broth.",
        price: "£5.95",
      },
      {
        id: "shrimp-wonton",
        name: "Shrimp Wonton Soup",
        chineseName: "鲜虾馄饨",
        description: "Plump shrimp wontons served in clear aromatic soup.",
        price: "£8.00",
      },
    ],
  },
  {
    id: "snacks-and-dumplings",
    title: "Snacks & Dumplings",
    chineseTitle: "街头小吃",
    subtitle: "Golden pan-fried dumplings, crispy rolls, and classic tea eggs.",
    items: [
      {
        id: "beef-dumplings",
        name: "Beef Dumplings",
        chineseName: "牛肉煎饺",
        description:
          "Halal beef mince seasoned with oyster sauce, carrots, egg, and fragrant sesame oil.",
        price: "£1.00",
        dietary: ["Halal"],
        featured: true,
        image: "/images/beef-dumplings-plate.jpg",
        imageAlt:
          "Golden crispy pan-fried beef dumplings plated on a red dish with dipping sauce and fresh greens",
      },
      {
        id: "vegetarian-dumplings",
        name: "Vegetarian Dumplings (2 pcs)",
        chineseName: "素煎饺",
        description:
          "Bean sprouts, carrots, rice vermicelli, and ginger, served with homemade spiced oil.",
        price: "£1.50",
        dietary: ["Vegetarian"],
        image: "/images/veggie-dumplings-ring.jpg",
        imageAlt:
          "Ring of golden crispy vegetarian dumplings arranged on a red plate",
      },
      {
        id: "tea-egg",
        name: "Tea Egg",
        chineseName: "茶叶蛋",
        description:
          "Traditional Chinese egg gently steeped in aromatic black tea, soy sauce, and whole spices.",
        price: "£1.00",
        dietary: ["Vegetarian"],
        image: "/images/spiced-tea-eggs.jpg",
        imageAlt: "Whole Chinese tea eggs steeping in rich dark spiced tea marinade",
      },
      {
        id: "vegetarian-spring-rolls",
        name: "Vegetarian Spring Rolls",
        chineseName: "素春卷",
        description:
          "Crisp, golden-fried pastry rolls packed with savoury seasoned vegetables.",
        price: null,
        note: "Price TBC — confirm in-store or on All Eat",
        dietary: ["Vegetarian"],
        image: "/images/veg-spring-rolls.jpg",
        imageAlt: "Crispy golden vegetarian spring rolls sliced open on a heart-shaped plate",
      },
    ],
  },
  {
    id: "sweet-crepes-and-desserts",
    title: "Sweet Crepes & Desserts",
    chineseTitle: "花式甜煎饼与甜品",
    subtitle:
      "Indulgent sweet crepes, delicate lacy cones, and traditional Chinese desserts.",
    items: [
      {
        id: "nutella-crepe",
        name: "Nutella Crepe",
        chineseName: "榛子巧克力甜煎饼",
        description:
          "Warm freshly griddled sweet crepe generously layered with Nutella; ask in-store for fresh fruit toppings.",
        price: "£4.00",
        dietary: ["Vegetarian"],
        featured: true,
        image: "/images/nutella-strawberry-crepe.jpg",
        imageAlt:
          "Folded sweet crepe topped with sliced strawberries, banana, whipped cream, and chocolate drizzle on a wooden heart board",
      },
      {
        id: "mango-sago",
        name: "Mango Sago",
        chineseName: "杨枝甘露",
        description:
          "Chilled, silky dessert crafted with fresh sweet mango and chewy sago pearls.",
        price: "£6.00",
        dietary: ["Vegetarian"],
      },
      {
        id: "black-sesame-paste",
        name: "Hand-Brewed Black Sesame Paste (Hot)",
        chineseName: "手磨黑芝麻糊",
        description:
          "Velvety, comforting traditional hot dessert brewed from toasted black sesame.",
        price: "£2.99",
        dietary: ["Vegetarian"],
      },
      {
        id: "fancy-lace-dessert-cone",
        name: "Fancy Lace Sweet Crepe Cone",
        chineseName: "花式蕾丝甜筒煎饼",
        description:
          "Signature crisp hand-piped lace crepe rolled into a cone with whipped cream, fruit, and sweet biscuits (as photographed).",
        price: null,
        note: "Price & seasonal toppings TBC — ask in-store",
        dietary: ["Vegetarian"],
        image: "/images/fancy-lace-dessert-cone.jpg",
        imageAlt:
          "Pink lace dessert crepe cone filled with whipped cream, fresh strawberry, matcha biscuit sticks, and teddy cookies",
      },
    ],
  },
  {
    id: "drinks",
    title: "Drinks & Refreshers",
    chineseTitle: "手调饮品",
    subtitle:
      "Hand-brewed teas, fresh fruit refreshers, traditional soya milk, and chilled soft drinks.",
    items: [
      {
        id: "matcha-latte",
        name: "Hand-Brewed Matcha Latte (Hot / Iced)",
        chineseName: "手打抹茶拿铁",
        description: "Smooth hand-whisked matcha served hot or over ice.",
        price: "£2.99",
        dietary: ["Vegetarian"],
      },
      {
        id: "passion-fruit-sparkling",
        name: "Passion Fruit Sparkling",
        chineseName: "百香果气泡饮",
        description: "Crisp, lightly sparkling refresher bursting with tangy passion fruit.",
        price: "£5.80",
        dietary: ["Vegan"],
      },
      {
        id: "passion-fruit-lemon-tea",
        name: "Passion Fruit Iced Lemon Tea",
        chineseName: "百香果冰柠檬茶",
        description: "Chilled fragrant tea balanced with bright lemon and passion fruit.",
        price: "£5.80",
        dietary: ["Vegan"],
      },
      {
        id: "watermelon-juice",
        name: "Hand-Made Watermelon Juice (500ml)",
        chineseName: "鲜榨西瓜汁",
        description: "Cool, naturally sweet hand-made watermelon juice.",
        price: "£5.80",
        dietary: ["Vegan"],
      },
      {
        id: "soya-milk",
        name: "Soya Milk (Hot / Cold)",
        chineseName: "现磨豆浆",
        description:
          "Classic silky Chinese soya milk — the timeless pairing for a hot Jian Bing.",
        price: "£2.00",
        dietary: ["Vegan"],
      },
      {
        id: "chilled-soft-drinks",
        name: "Chilled Cans & Soft Drinks",
        chineseName: "冰镇汽水",
        description:
          "Selection of chilled cans and bottles available at the counter, including Coca-Cola, Diet Coke, Fanta, Sprite, Old Jamaica Ginger Beer, and Ting.",
        price: null,
        note: "Price TBC — see chilled cabinet in-store",
        dietary: ["Vegan"],
      },
    ],
  },
];

export const featuredMenuItems: MenuItem[] = menuCategories
  .flatMap((category) => category.items)
  .filter((item) => item.featured && item.image);
