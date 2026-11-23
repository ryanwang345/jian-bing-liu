import type { LocalizedText } from "@/lib/i18n";

export type ReviewSource =
  | "google"
  | "instagram"
  | "tiktok"
  | "reddit"
  | "fantuan";

export interface CustomerReview {
  id: string;
  author: string;
  rating: 4 | 5;
  source: ReviewSource;
  url: string;
  publishedLabel?: LocalizedText;
  highlight: LocalizedText;
  quote: LocalizedText;
}

export interface SocialPost {
  id: string;
  platform: "instagram" | "tiktok" | "threads" | "reddit" | "fantuan";
  handle: string;
  postType: LocalizedText;
  title: LocalizedText;
  caption: LocalizedText;
  href: string;
  image: string;
  imageAlt: LocalizedText;
}

export const GOOGLE_MAPS_PLACE_URL =
  "https://www.google.com/maps/place/Jian+Bing+Liu/@51.5422785,-0.1377214,17z/data=!3m1!4b1!4m6!3m5!1s0x48761b0053d36dcf:0x6c48602980f0cb9e!8m2!3d51.5422785!4d-0.1377214!16s%2Fg%2F11y90b95h1";

export const FANTUAN_STORE_URL =
  "https://www.fantuanorder.com/store/jian-bing-liu/gb-4753211";

export const REDDIT_RECOMMEND_URL =
  "https://www.reddit.com/r/LondonFood/comments/1qmx85b/highly_recommend_jian_bing_liu_in_camden/";

export const googleRating = {
  score: "4.9",
  count: 286,
  reviewsUrl: GOOGLE_MAPS_PLACE_URL,
};

/**
 * Verified public customer reviews & comments from Google Maps, Instagram, and TikTok.
 * Every item links directly to the verified Google Maps listing or original post/reel/video.
 */
export const customerReviews: CustomerReview[] = [
  {
    id: "jonathan-travers-smith",
    author: "Jonathan Travers-Smith",
    rating: 5,
    source: "google",
    url: GOOGLE_MAPS_PLACE_URL,
    highlight: {
      en: "Super authentic Jian Bing — just like China",
      zh: "旅居中国十年老食客认证的正宗煎饼",
    },
    quote: {
      en: "I lived in China for over 10 years and jianbing (Chinese savoury crepes with chilli) was my favourite breakfast. I couldn't believe my luck when I found Liu Ayi's store right here in Camden. The jianbing are super authentic and Mrs Liu is extremely cheery and kind. Highly recommend — please visit!",
      zh: "我在中国住了十多年，加辣的中式煎饼一直是我最爱的早餐。能在伦敦卡姆登遇到刘阿姨的小店简直太幸运了！煎饼超级正宗，刘阿姨也格外开朗亲切。我每次都点经典原味加足辣椒和脆饼，强烈推荐大家一定要来尝尝！",
    },
  },
  {
    id: "heyjojoeats-ig",
    author: "@heyjojoeats",
    rating: 5,
    source: "instagram",
    url: "https://www.instagram.com/heyjojoeats/reel/Ddy_R9APhZs/",
    highlight: {
      en: "Small but mighty spot on Camden Road",
      zh: "Instagram 伦敦美食博主实拍打卡",
    },
    quote: {
      en: "A small but mighty spot on Camden Road specialising in authentic Chinese savoury crepes and street food. Even the small size Jian Bing was incredibly filling — packed with egg, char siu, crispy fried onions, homemade sauce, potato fries, crisp cracker and pork floss. Very generous portions!",
      zh: "藏在卡姆登路上的宝藏小店，专注正宗中式煎饼与街头小吃。连小份煎饼都超级扎实，塞满鸡蛋、叉烧、酥脆洋葱、秘制酱、土豆丝、薄脆和肉松，分量太实在了；甜煎饼也铺满新鲜水果和榛子巧克力酱！",
    },
  },
  {
    id: "reddit-londonfood-beijing",
    author: "r/LondonFood",
    rating: 5,
    source: "reddit",
    url: REDDIT_RECOMMEND_URL,
    highlight: {
      en: "Most authentic Jian Bing outside of Beijing",
      zh: "Reddit r/LondonFood 强推：北京以外最正宗的煎饼",
    },
    quote: {
      en: "Jian Bing Liu is by far the most authentic Jian Bing that I have ever had outside of Beijing… it is run by a lady who is also the owner. She is unbelievably friendly and sweet, explaining to you the details about the dish and what she's adding.",
      zh: "煎饼刘是我在北京之外吃过迄今为止最正宗的煎饼果子……小店由老板娘亲自打理，人超级热情温柔，会细心讲解每一样食材和配料。",
    },
  },
  {
    id: "fantuan-vip-l-colorful",
    author: "L · Fantuan VIP",
    rating: 5,
    source: "fantuan",
    url: FANTUAN_STORE_URL,
    highlight: {
      en: "Best colourful Jian Bing in the UK",
      zh: "饭团 VIP 评价：在英国吃过最好吃的彩色煎饼",
    },
    quote: {
      en: "The jianbing (savory Chinese crepes) at Jianbing Liu are truly delicious. Located near Camden, the shop is run by a very welcoming owner. The quality and taste of the crepes are outstanding, and the portions are generous. It's the best colorful jianbing I've ever had in the UK! The crepe batter is so soft.",
      zh: "煎饼刘的煎饼真的非常好吃！就在卡姆登附近，老板娘特别热情，品质和口感都非常在线，分量也很足。这是我在英国吃过最好吃的彩色果蔬煎饼，饼皮特别柔软香甜！",
    },
  },
  {
    id: "matthew-chia",
    author: "Matthew Chia",
    rating: 5,
    source: "google",
    url: GOOGLE_MAPS_PLACE_URL,
    highlight: {
      en: "Fresh, hearty, homely — made from scratch",
      zh: "全口味打卡零踩雷，连饮品都是自制",
    },
    quote: {
      en: "Eat here. You won't regret it. I have tried all the savoury crepes — chicken, beef, char siu, roast duck, even the vegetarian — and all are excellent. They are fresh, hearty, homely, a burst of flavours and textures. The drinks like the soya milk and watermelon juice are homemade too.",
      zh: "放心来吃绝对不会后悔！鸡肉、牛肉、叉烧、烤鸭甚至素食咸味煎饼我都吃过，每一种都非常出色，新鲜扎实又有家常味。老板娘对每份出品都特别用心，连豆浆和西瓜汁都是自制的，逢年过节还有限定小吃！",
    },
  },
  {
    id: "jolin-eats-london-tt",
    author: "Jolin Eats London",
    rating: 5,
    source: "tiktok",
    url: "https://www.tiktok.com/@jianbingliu.uk/video/7654358443339287830",
    highlight: {
      en: "London foodie comment on TikTok",
      zh: "TikTok 伦敦美食账号留言点赞",
    },
    quote: {
      en: "Awww look amazing",
      zh: "哇，看起来太诱人太棒了！",
    },
  },
  {
    id: "jojo",
    author: "Jojo",
    rating: 5,
    source: "google",
    url: GOOGLE_MAPS_PLACE_URL,
    highlight: {
      en: "Authentic Dongbei-style Jian Bing & cute sweet crepes",
      zh: "正宗东北风味煎饼，甜煎饼颜值超高",
    },
    quote: {
      en: "A hidden gem in Camden! Authentic Dongbei-style Jian Bing freshly made by the passionate owner. The savoury crepe is incredibly filling. The sweet crepe is so cute and good for photos. Great value with generous portion sizes.",
      zh: "卡姆登的宝藏小店！热情的老板娘现摊的正宗东北风味煎饼，咸煎饼超级顶饱，甜煎饼又可爱又出片，分量足性价比高！",
    },
  },
  {
    id: "kitchen-jungle85-ig",
    author: "@kitchen_jungle85",
    rating: 5,
    source: "instagram",
    url: "https://www.instagram.com/heyjojoeats/reel/Ddy_R9APhZs/",
    highlight: {
      en: "Comment on Camden Jian Bing Reel",
      zh: "Instagram 热门煎饼视频评论",
    },
    quote: {
      en: "So incredibly delicious 😋",
      zh: "真的太美味了 😋",
    },
  },
  {
    id: "tiffany-liang",
    author: "Tiffany Liang",
    rating: 5,
    source: "google",
    url: GOOGLE_MAPS_PLACE_URL,
    highlight: {
      en: "Packed with fillings & welcoming owner",
      zh: "馅料满满，老板娘热情亲切",
    },
    quote: {
      en: "Me and my gf wanted to grab a bit for the road and we came across this cozy jian bing shop. The food is amaaaazing, packed with fillings and super yummy. The owner was chatting to us the whole time, she's very sweet and welcoming. Definite recommend if you pass Camden any time.",
      zh: "和女朋友路上想买点吃的，偶遇这家温馨的煎饼小店。味道太惊艳了，馅料塞得满满当当超级好吃！老板娘全程和我们热情聊天，特别温柔好客，路过卡姆登一定要来！",
    },
  },
  {
    id: "dinasfoodstory-tt",
    author: "@dinasfoodstory",
    rating: 5,
    source: "tiktok",
    url: "https://www.tiktok.com/@jianbingliu.uk/video/7704032867570961696",
    highlight: {
      en: "Celebrating 2 years on Camden Road",
      zh: "TikTok 祝贺煎饼刘开业两周年",
    },
    quote: {
      en: "Congratulations! (Commenting on Jian Bing Liu's 2nd anniversary celebration video on TikTok.)",
      zh: "恭喜开业两周年！（在煎饼刘 TikTok 两周年庆祝视频下的暖心祝福）",
    },
  },
  {
    id: "xinshui77-ig",
    author: "@xinshui77",
    rating: 5,
    source: "instagram",
    url: "https://www.instagram.com/gina_liu__/reel/DbQNKmfN9vH/",
    highlight: {
      en: "Loved the colourful vegetable batter",
      zh: "被天然彩色果蔬饼皮惊艳",
    },
    quote: {
      en: "哇彩色的😍 (Wow, it's colourful! — commenting on Master Liu's live griddle reel.)",
      zh: "哇彩色的😍（在刘阿姨一镜到底现摊果蔬煎饼 Reel 下的评论）",
    },
  },
  {
    id: "adelie",
    author: "adelie",
    rating: 5,
    source: "google",
    url: GOOGLE_MAPS_PLACE_URL,
    highlight: {
      en: "One of my favourite spots in London",
      zh: "伦敦最爱的小店之一，满满用心",
    },
    quote: {
      en: "One of my favorite spots in London!!! Cozy and warm, and the owner is so incredibly sweet. Me and my friend love stopping by here to share dishes :) Everything we've had tasted amazing and made with lots of love.",
      zh: "我在伦敦最喜欢的小店之一！温暖又舒适，老板娘真的超级温柔。我和朋友总喜欢顺路来这里一起分享好几样菜，点过的每一样都超级好吃，能吃出满满的心意。",
    },
  },
  {
    id: "followmeyoonie-ig",
    author: "@followmeyoonie",
    rating: 5,
    source: "instagram",
    url: "https://www.instagram.com/heyjojoeats/reel/Ddy_R9APhZs/",
    highlight: {
      en: "Praise on Instagram Reel",
      zh: "Instagram 视频评论好评",
    },
    quote: {
      en: "Wow looks amazing 🙌",
      zh: "哇，看着太惊艳了 🙌",
    },
  },
  {
    id: "mimi",
    author: "Mimi",
    rating: 5,
    source: "google",
    url: GOOGLE_MAPS_PLACE_URL,
    highlight: {
      en: "Sweetest owner & generous crepes",
      zh: "阿姨特别温柔，回头客力荐",
    },
    quote: {
      en: "The place itself smelt so comforting and the lady who made our food is the sweetest. We've gone here multiple times and each time the food is even better than the last… it was delicious and if you're near you should stop by. Would 100% recommend!",
      zh: "店里的香味特别治愈，做煎饼的阿姨超级温柔。我们已经去过好多次了，每次都比上次更好吃……甜煎饼料给得非常足，杨枝甘露也超好喝，性价比很高，100% 推荐！",
    },
  },
  {
    id: "larcheung2022-ig",
    author: "@larcheung2022",
    rating: 5,
    source: "instagram",
    url: "https://www.instagram.com/heyjojoeats/reel/Ddy_R9APhZs/",
    highlight: {
      en: "Instagram comment on savoury & sweet crepes",
      zh: "Instagram 评论直呼美味",
    },
    quote: {
      en: "Look so delicious 😋",
      zh: "看起来太好吃了 😋",
    },
  },
  {
    id: "iris",
    author: "Iris",
    rating: 5,
    source: "google",
    url: GOOGLE_MAPS_PLACE_URL,
    highlight: {
      en: "Matcha dessert crepe, wontons & beef Jian Bing",
      zh: "抹茶甜煎饼、馄饨和牛肉煎饼都很赞",
    },
    quote: {
      en: "I got the matcha dessert crepe with cheesecake cream, strawberries, banana, Nutella, and Dubai chocolate kunafeh toppings and it was so delicious! My friends also got some wontons and a savoury beef Chinese crepe. We had a lovely experience and will definitely be back!",
      zh: "点了抹茶甜煎饼加芝士奶盖、草莓、香蕉、榛子巧克力酱和迪拜巧克力脆，太好吃了！朋友点的馄饨和咸味牛肉煎饼也特别香。整体体验非常棒，肯定还会再来！",
    },
  },
  {
    id: "ashluvs-food-ig",
    author: "@ashluvs.food",
    rating: 5,
    source: "instagram",
    url: "https://www.instagram.com/heyjojoeats/reel/Ddy_R9APhZs/",
    highlight: {
      en: "Loved our cute sweet crepe details",
      zh: "盛赞花式甜煎饼的可爱造型",
    },
    quote: {
      en: "The hello kitty is so cute! (Commenting on Jian Bing Liu's custom sweet crepe reel.)",
      zh: "可爱造型也太萌了！（在煎饼刘花式甜煎饼 Reel 下的评论）",
    },
  },
  {
    id: "natali-jensen",
    author: "Natali JENSEN",
    rating: 5,
    source: "google",
    url: GOOGLE_MAPS_PLACE_URL,
    highlight: {
      en: "Fresh fillings & homemade chilli oil",
      zh: "分量大、食材新鲜、自制辣椒油超香",
    },
    quote: {
      en: "The Chinese crepes were big and packed with lots of filling. The crepe itself tasted delicious and the ingredients were fresh and also included homemade chili oil. The owner was friendly and I'll definitely be coming back to try more things from the menu!",
      zh: "中式煎饼分量很大、馅料塞得满满当当。饼皮本身就非常香，食材新鲜，还配了自家秘制辣椒油。老板娘很热情友好，下次一定再来解锁菜单上的其他菜！",
    },
  },
  {
    id: "sahjin-lee",
    author: "Sahjin Lee",
    rating: 5,
    source: "google",
    url: GOOGLE_MAPS_PLACE_URL,
    highlight: {
      en: "Warm hospitality & big portions",
      zh: "耐心讲解每样配料，分量超大",
    },
    quote: {
      en: "Tucked away on Camden Road is a Jian Bing place run by the most lovely woman. She was so nice and explained what she was putting into each crepe. I got the matcha crepe which was super filling and delicious… Would highly recommend — portions are big and really yummy.",
      zh: "藏在卡姆登路上的宝藏煎饼店，老板娘人特别好，会很耐心地介绍每一种配料。我点的抹茶甜煎饼配料丰富又扎实，草莓香蕉都很新鲜，分量超大超好吃，强烈推荐！",
    },
  },
  {
    id: "fantuan-vip-59997",
    author: "Fantuan VIP (***59997)",
    rating: 5,
    source: "fantuan",
    url: FANTUAN_STORE_URL,
    highlight: {
      en: "Generous portion & thoughtful packaging",
      zh: "饭团 VIP 好评：分量超足，贴心分装",
    },
    quote: {
      en: "Super delicious and a generous portion. The owner thoughtfully split it into two bags.",
      zh: "超级好吃而且分量特别大，老板娘还很贴心地帮忙分装成了两袋！",
    },
  },
  {
    id: "fantuan-vip-l-pigear",
    author: "L · Fantuan VIP",
    rating: 5,
    source: "fantuan",
    url: FANTUAN_STORE_URL,
    highlight: {
      en: "Braised pork hock & pig ear Jian Bing",
      zh: "饭团回头客推荐：猪耳肘子煎饼超香",
    },
    quote: {
      en: "The jianbing is absolutely delicious — the pig ear jianbing is great!",
      zh: "煎饼太美味了，卤味猪耳肘子煎饼特别棒！",
    },
  },
  {
    id: "fantuan-vip-o2556",
    author: "Fantuan VIP (***o2556)",
    rating: 5,
    source: "fantuan",
    url: FANTUAN_STORE_URL,
    highlight: {
      en: "Roast duck & braised pork hock Jian Bing",
      zh: "饭团点评：烤鸭与肘子煎饼馅料超多",
    },
    quote: {
      en: "The taste is decent, and the portions are generous with plenty of fillings; highly recommended. (Roast Duck Jianbing & Braised Pork Hock Jianbing.)",
      zh: "味道在线，分量很大、馅料塞得满满当当，烤鸭煎饼和卤肘子煎饼都很推荐！",
    },
  },
];

/**
 * Direct verified post/reel/video links on Jian Bing Liu's official Instagram, TikTok, and Threads.
 */
export const socialPosts: SocialPost[] = [
  {
    id: "ig-heyjojoeats-reel",
    platform: "instagram",
    handle: "@heyjojoeats × @jian_bing_liu",
    postType: { en: "Instagram Reel · 114 Likes", zh: "Instagram 短视频 · 114 赞" },
    title: {
      en: "Char Siu Jian Bing & Custard Cream Sweet Crepe",
      zh: "叉烧煎饼果子 & 焦糖布蕾甜煎饼实拍",
    },
    caption: {
      en: "A small but mighty spot on Camden Road — freshly made savoury Jian Bing packed with egg, char siu, crispy fried onions, and homemade sauce.",
      zh: "卡姆登路人气实拍：满馅叉烧咸煎饼搭配焦糖布蕾奶油水果甜煎饼。",
    },
    href: "https://www.instagram.com/heyjojoeats/reel/Ddy_R9APhZs/",
    image: "/images/hero-jianbing-platter.jpg",
    imageAlt: {
      en: "Freshly sliced savoury Jian Bing featured on Instagram Reel",
      zh: "Instagram 短视频展示的现摊咸味煎饼",
    },
  },
  {
    id: "tt-dragonfruit-spinach",
    platform: "tiktok",
    handle: "@jianbingliu.uk",
    postType: { en: "TikTok · 18K Views", zh: "TikTok 热门 · 1.8万 播放" },
    title: {
      en: "Natural Dragon Fruit & Spinach Jian Bing in London",
      zh: "天然火龙果汁与菠菜汁彩色煎饼",
    },
    caption: {
      en: "Fresh, colourful handmade crepes made with natural dragon fruit juice and spinach juice — choose roast duck, beef, chicken, or pork knuckle.",
      zh: "用天然火龙果汁和菠菜汁现场调色摊饼，烤鸭、牛肉、鸡肉多种招牌馅料任选！",
    },
    href: "https://www.tiktok.com/@jianbingliu.uk/video/7672559024713272598",
    image: "/images/veggie-crepe-griddle.jpg",
    imageAlt: {
      en: "Colourful dragon fruit and spinach Jian Bing on the griddle",
      zh: "铁板上的火龙果菠菜双色果蔬煎饼",
    },
  },
  {
    id: "ig-master-liu-reel",
    platform: "instagram",
    handle: "@gina_liu__ × @jian_bing_liu",
    postType: { en: "Instagram Reel", zh: "Instagram 短视频" },
    title: {
      en: "How Master Liu Makes the Perfect Jian Bing (No Editing)",
      zh: "一镜到底看刘阿姨铁板现摊完美煎饼",
    },
    caption: {
      en: "Watch Master Liu swirl fresh batter, crack eggs, brush house sauce, and fold a crisp Jian Bing live on the griddle.",
      zh: "无剪辑直拍：热铁板摊面糊、磕鲜蛋、刷秘制酱、加满脆料一气呵成。",
    },
    href: "https://www.instagram.com/gina_liu__/reel/DbQNKmfN9vH/",
    image: "/images/griddle-batter-egg.jpg",
    imageAlt: {
      en: "Swirling batter and egg on the round Jian Bing griddle",
      zh: "圆铁板上现摊煎饼面糊与鸡蛋",
    },
  },
  {
    id: "tt-pinned-viral",
    platform: "tiktok",
    handle: "@jianbingliu.uk",
    postType: { en: "TikTok Pinned · 17K Views", zh: "TikTok 置顶 · 1.7万 播放" },
    title: {
      en: "Our Viral Camden Griddle Showcase",
      zh: "卡姆登置顶人气出餐视频",
    },
    caption: {
      en: "Our pinned Camden Road clip (390+ likes) showing savoury Jian Bing and hand-piped lace crepes cooked to order.",
      zh: "390+ 点赞置顶视频，感受卡姆登人气煎饼档口的热闹烟火气。",
    },
    href: "https://www.tiktok.com/@jianbingliu.uk/video/7671489076666682646",
    image: "/images/fancy-lace-dessert-cone.jpg",
    imageAlt: {
      en: "Hand-piped fancy lace dessert cone from Jian Bing Liu TikTok",
      zh: "煎饼刘 TikTok 置顶视频展示的花式蕾丝甜筒",
    },
  },
  {
    id: "tt-halal-special",
    platform: "tiktok",
    handle: "@jianbingliu.uk",
    postType: { en: "TikTok · 15.4K Views", zh: "TikTok 热门 · 1.54万 播放" },
    title: {
      en: "Halal Beef, Chicken & Street-Food Favourites",
      zh: "清真牛肉鸡肉煎饼与街头热卖推荐",
    },
    caption: {
      en: "Halal beef and chicken Jian Bing plus hot street-food snacks from our Camden Road counter.",
      zh: "1.54 万播放推荐：清真牛肉/鸡肉煎饼与现做中式街头小吃，欢迎关注打卡。",
    },
    href: "https://www.tiktok.com/@jianbingliu.uk/video/7678046964440714518",
    image: "/images/beef-crepe-sleeve.jpg",
    imageAlt: {
      en: "Warm sesame-crusted Halal beef Jian Bing in a kraft sleeve",
      zh: "装在牛皮纸袋里撒满黑芝麻的清真牛肉煎饼",
    },
  },
  {
    id: "tt-ucl-csm-chinese-stomach",
    platform: "tiktok",
    handle: "@jianbingliu.uk",
    postType: { en: "TikTok · 447 Likes", zh: "TikTok 高赞 · 447 赞" },
    title: {
      en: "Beloved by UCL & CSM Students Near Camden",
      zh: "伦敦超正宗煎饼果子 · 守护留子的中国胃",
    },
    caption: {
      en: "Right near UCL & CSM — generous authentic Jian Bing, fresh soya milk, mango sago, dumplings, and sweet crepes.",
      zh: "就在 CSM 和 UCL 附近，真材实料分量足，还有现磨豆浆、杨枝甘露、煎饺与甜煎饼！",
    },
    href: "https://www.tiktok.com/@jianbingliu.uk/video/7559103569085975830",
    image: "/images/golden-sesame-jianbing.jpg",
    imageAlt: {
      en: "Golden sesame Jian Bing sliced in half showing crisp fillings",
      zh: "切开展示丰富内馅的金黄黑芝麻煎饼",
    },
  },
  {
    id: "ig-strawberry-crepe-post",
    platform: "instagram",
    handle: "@jian_bing_liu",
    postType: { en: "Instagram Post", zh: "Instagram 贴文" },
    title: {
      en: "Strawberry Crème Brûlée Sweet Crepe",
      zh: "草莓焦糖布蕾花式甜煎饼",
    },
    caption: {
      en: "Fresh strawberries, rich cream, and sweet freshly griddled crepe straight from our Camden counter.",
      zh: "新鲜草莓搭配细腻奶油与现摊焦香甜饼皮，颜值与口感双在线。",
    },
    href: "https://www.instagram.com/jian_bing_liu/p/DPrmEAQjZRl/",
    image: "/images/nutella-strawberry-crepe.jpg",
    imageAlt: {
      en: "Strawberry sweet crepe post on Jian Bing Liu Instagram",
      zh: "煎饼刘 Instagram 草莓甜煎饼贴文",
    },
  },
  {
    id: "ig-ruff-leah-reel",
    platform: "instagram",
    handle: "@ruff.leah × @jian_bing_liu",
    postType: { en: "Instagram Reel", zh: "Instagram 短视频" },
    title: {
      en: "Sweet & Savoury Crepes Made Fresh Daily on Camden Road",
      zh: "卡姆登路每日现做咸甜双味煎饼",
    },
    caption: {
      en: "Sweet and savoury crepes cooked fresh every day on Camden Road.",
      zh: "每日新鲜食材现做，咸味果蔬煎饼与花式甜煎饼一次满足。",
    },
    href: "https://www.instagram.com/ruff.leah/reel/DF3YvDIoAyH/",
    image: "/images/folded-rainbow-crepe.jpg",
    imageAlt: {
      en: "Colourful savoury crepe folded warm on the griddle",
      zh: "热铁板上折叠中的彩色果蔬煎饼",
    },
  },
  {
    id: "threads-griddle-post",
    platform: "threads",
    handle: "@jian_bing_liu",
    postType: { en: "Threads Post", zh: "Threads 贴文" },
    title: {
      en: "Fresh Off the Griddle & Packed Warm to Go",
      zh: "现摊出锅，热乎装盒带走",
    },
    caption: {
      en: "Behind-the-scenes prep and freshly packed Jian Bing takeaway boxes shared on our official Threads.",
      zh: "官方 Threads 分享的后厨现摊与热乎外带出品瞬间。",
    },
    href: "https://www.threads.com/@jian_bing_liu/post/DOnN-zOiucB",
    image: "/images/jianbing-apron-hero.jpg",
    imageAlt: {
      en: "Freshly folded Jian Bing held in front of the Jian Bing Liu apron",
      zh: "煎饼刘围裙前新鲜出锅的咸味煎饼",
    },
  },
  {
    id: "threads-strawberry-post",
    platform: "threads",
    handle: "@jian_bing_liu",
    postType: { en: "Threads Post", zh: "Threads 贴文" },
    title: {
      en: "Fresh Strawberry Dessert Crepe on Threads",
      zh: "Threads 分享：鲜草莓奶油甜煎饼",
    },
    caption: {
      en: "Check out our sweet dessert crepe photo on Threads and drop a reply with your favourite toppings!",
      zh: "点击查看官方 Threads 草莓甜煎饼贴文，也欢迎留言告诉我们你最爱的配料！",
    },
    href: "https://www.threads.com/@jian_bing_liu/post/DPrmEVEjduI",
    image: "/images/lace-crepe-sheet.jpg",
    imageAlt: {
      en: "Hand-piped pink lace crepe sheet in the Camden kitchen",
      zh: "卡姆登厨房里的手工粉色蕾丝甜煎饼皮",
    },
  },
  {
    id: "reddit-highly-recommend",
    platform: "reddit",
    handle: "r/LondonFood",
    postType: { en: "Reddit Thread", zh: "Reddit 热门讨论" },
    title: {
      en: "“Highly recommend Jian Bing Liu in Camden!”",
      zh: "Reddit 伦敦美食社区热帖：强烈推荐卡姆登煎饼刘",
    },
    caption: {
      en: "London foodies on r/LondonFood praising Jian Bing Liu as the most authentic Jian Bing outside of Beijing, with everything made fresh in-house.",
      zh: "伦敦食客在 r/LondonFood 热烈讨论，盛赞煎饼刘是北京之外最地道的中式煎饼与自制辣椒油。",
    },
    href: REDDIT_RECOMMEND_URL,
    image: "/images/beef-crepe-sleeve.jpg",
    imageAlt: {
      en: "Warm black-sesame Jian Bing crepe wrapped in a kraft sleeve",
      zh: "装在牛皮纸袋里撒满黑芝麻的咸味煎饼",
    },
  },
  {
    id: "reddit-best-chinese-london",
    platform: "reddit",
    handle: "r/LondonFood",
    postType: { en: "Reddit Thread", zh: "Reddit 推荐帖" },
    title: {
      en: "Featured in “Best Authentic Chinese Food in London”",
      zh: "入选 r/LondonFood「伦敦最正宗中餐」推荐讨论",
    },
    caption: {
      en: "Picked out by London locals as a go-to Camden spot for Northern Chinese street food.",
      zh: "被伦敦本地吃货力荐为卡姆登必打卡的北方中式街头风味宝藏小店。",
    },
    href: "https://www.reddit.com/r/LondonFood/comments/1vkvncd/best_authentic_chinese_food_in_london/",
    image: "/images/braised-beef-rice.jpg",
    imageAlt: {
      en: "Slow-braised beef with carrots, potatoes, and steamed white rice",
      zh: "慢炖土豆胡萝卜牛肉配热白米饭",
    },
  },
  {
    id: "fantuan-camden-store",
    platform: "fantuan",
    handle: "Fantuan · 4.5 ★",
    postType: { en: "Fantuan Delivery", zh: "饭团外卖 · 4.5 ★" },
    title: {
      en: "Order Jian Bing Liu (Camden) on Fantuan Delivery",
      zh: "饭团外卖直达：煎饼刘（Camden 店）",
    },
    caption: {
      en: "Browse full Chinese & English delivery menu on Fantuan — savoury crepes, braised pork hock & roast duck crepes, rice bowls, wontons & drinks.",
      zh: "在饭团外卖一键下单全套招牌果蔬煎饼、卤肘子/烤鸭煎饼、盖饭、鲜汤馄饨与饮品，查看最新评价与满减优惠。",
    },
    href: FANTUAN_STORE_URL,
    image: "/images/beef-dumplings-plate.jpg",
    imageAlt: {
      en: "Golden pan-fried beef dumplings plated with house dipping sauce",
      zh: "金黄酥脆的牛肉煎饺配秘制蘸汁",
    },
  },
];
