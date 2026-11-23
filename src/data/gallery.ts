export type GalleryCategory =
  | "All"
  | "Savoury Jian Bing"
  | "Sweet & Lace Crepes"
  | "Mains & Snacks"
  | "Craft & Brand";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: Exclude<GalleryCategory, "All">;
  width: number;
  height: number;
}

export const galleryCategories: GalleryCategory[] = [
  "All",
  "Savoury Jian Bing",
  "Sweet & Lace Crepes",
  "Mains & Snacks",
  "Craft & Brand",
];

export const galleryItems: GalleryItem[] = [
  {
    id: "hero-platter",
    src: "/images/hero-jianbing-platter.jpg",
    alt: "Herb-studded savoury Jian Bing crepe sliced on a white plate beside the Jian Bing Liu kraft sleeve",
    caption: "Signature savoury Jian Bing — fresh off the griddle",
    category: "Savoury Jian Bing",
    width: 1600,
    height: 1067,
  },
  {
    id: "chef-lace-crepe",
    src: "/images/chef-lace-crepe.jpg",
    alt: "Chef at Jian Bing Liu smiling in branded black apron and red hoodie while lifting a freshly cooked lacy pink-edged crepe",
    caption: "Handmade fancy lace crepes lifted hot from the griddle",
    category: "Craft & Brand",
    width: 1200,
    height: 1600,
  },
  {
    id: "beef-crepe-sleeve",
    src: "/images/beef-crepe-sleeve.jpg",
    alt: "Sesame-crusted savoury Jian Bing loaded with crispy fried layers and fresh lettuce inside a warm kraft paper sleeve",
    caption: "Black sesame crust & golden crunch in our signature sleeve",
    category: "Savoury Jian Bing",
    width: 1600,
    height: 1067,
  },
  {
    id: "nutella-strawberry-crepe",
    src: "/images/nutella-strawberry-crepe.jpg",
    alt: "Sweet folded crepe topped with fresh sliced strawberries, banana, whipped cream, and dark chocolate drizzle on a wooden heart board",
    caption: "Fresh strawberry, banana & chocolate sweet crepe",
    category: "Sweet & Lace Crepes",
    width: 1600,
    height: 1200,
  },
  {
    id: "veggie-crepe-griddle",
    src: "/images/veggie-crepe-griddle.jpg",
    alt: "Naturally tinted pink and green fruit-and-vegetable batter crepe topped with herbs and shredded fillings on the hot cast-iron griddle",
    caption: "Naturally vibrant fruit & vegetable batter on the griddle",
    category: "Savoury Jian Bing",
    width: 1200,
    height: 1600,
  },
  {
    id: "beef-dumplings-plate",
    src: "/images/beef-dumplings-plate.jpg",
    alt: "Crispy pan-fried golden dumplings served on a red lacquer-style plate with dipping sauce and fresh salad leaves",
    caption: "Golden pan-fried beef dumplings with house dipping sauce",
    category: "Mains & Snacks",
    width: 1200,
    height: 1600,
  },
  {
    id: "jianbing-apron-hero",
    src: "/images/jianbing-apron-hero.jpg",
    alt: "Loaded savoury Jian Bing crepe held in a kraft wrapper in front of the embroidered Pancake Liu 煎饼刘 kitchen apron",
    caption: "Packed with crisp greens, shredded potato & golden crunch",
    category: "Craft & Brand",
    width: 1200,
    height: 1600,
  },
  {
    id: "fancy-lace-dessert-cone",
    src: "/images/fancy-lace-dessert-cone.jpg",
    alt: "Hand-piped pink lace crepe cone overflowing with whipped cream, fresh fruit, matcha biscuit sticks, and cute bear biscuits",
    caption: "Fancy lace sweet crepe cone with cream & biscuit sticks",
    category: "Sweet & Lace Crepes",
    width: 1200,
    height: 1600,
  },
  {
    id: "golden-sesame-jianbing",
    src: "/images/golden-sesame-jianbing.jpg",
    alt: "Close-up of a golden egg-brushed Jian Bing speckled with black sesame seeds and sliced to reveal shredded fillings",
    caption: "Egg-brushed golden batter with toasted black sesame",
    category: "Savoury Jian Bing",
    width: 1600,
    height: 1067,
  },
  {
    id: "braised-beef-rice",
    src: "/images/braised-beef-rice.jpg",
    alt: "Slow-braised beef with carrots and potatoes served alongside heart-shaped steamed white rice on a white platter",
    caption: "Slow-braised beef with potatoes, carrots & steamed rice",
    category: "Mains & Snacks",
    width: 1200,
    height: 1600,
  },
  {
    id: "vegan-japanese-curry",
    src: "/images/vegan-japanese-curry.jpg",
    alt: "Rich golden vegan Japanese curry with chunky potatoes and carrots paired with heart-shaped steamed white rice",
    caption: "Hearty Vegan Japanese Curry with steamed rice",
    category: "Mains & Snacks",
    width: 1600,
    height: 1200,
  },
  {
    id: "brand-kraft-sleeve",
    src: "/images/brand-kraft-sleeve.jpg",
    alt: "Close-up of the Jian Bing Liu kraft paper sleeve featuring red script, bold black Chinese calligraphy 煎饼刘, and a red seal stamp",
    caption: "Our signature kraft sleeve calligraphy & vermilion seal",
    category: "Craft & Brand",
    width: 1600,
    height: 1600,
  },
  {
    id: "veg-spring-rolls",
    src: "/images/veg-spring-rolls.jpg",
    alt: "Crispy golden-brown vegetarian spring rolls cut diagonally on a white heart-shaped plate with fresh herbs",
    caption: "Crispy golden vegetarian spring rolls",
    category: "Mains & Snacks",
    width: 1200,
    height: 1600,
  },
  {
    id: "folded-rainbow-crepe",
    src: "/images/folded-rainbow-crepe.jpg",
    alt: "Colourful fruit-and-vegetable crepe partially folded over savoury sauce and fresh herbs on a hot round cast-iron griddle",
    caption: "Folding the crisp fruit-and-vegetable Jian Bing to order",
    category: "Savoury Jian Bing",
    width: 1200,
    height: 1600,
  },
  {
    id: "spiced-tea-eggs",
    src: "/images/spiced-tea-eggs.jpg",
    alt: "Whole tea eggs gently simmering in a stainless steel pan filled with dark aromatic tea and soy marinade",
    caption: "Classic aromatic tea eggs steeped in whole spices",
    category: "Mains & Snacks",
    width: 1600,
    height: 1200,
  },
  {
    id: "lace-crepe-sheet",
    src: "/images/lace-crepe-sheet.jpg",
    alt: "Delicate golden crepe bordered with hand-piped pink lattice lace edges held vertically in the Camden kitchen",
    caption: "Intricate hand-piped lace edges before rolling",
    category: "Sweet & Lace Crepes",
    width: 1200,
    height: 1600,
  },
  {
    id: "griddle-batter-egg",
    src: "/images/griddle-batter-egg.jpg",
    alt: "Fresh egg and swirling fruit-and-vegetable batter cooking evenly across a round cast-iron griddle",
    caption: "Swirling fresh batter & egg onto a hot cast-iron griddle",
    category: "Craft & Brand",
    width: 1200,
    height: 1600,
  },
  {
    id: "crispy-dumplings-row",
    src: "/images/crispy-dumplings-row.jpg",
    alt: "Row of golden crisp pan-fried dumplings neatly arranged on a bright orange carrot-shaped serving dish",
    caption: "Crisp pan-fried dumplings served golden and piping hot",
    category: "Mains & Snacks",
    width: 1600,
    height: 1200,
  },
];
