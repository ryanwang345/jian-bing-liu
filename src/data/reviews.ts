import type { LocalizedText } from "@/lib/i18n";

export interface CustomerReview {
  id: string;
  author: string;
  rating: 5;
  source: "Google";
  highlight: LocalizedText;
  quote: LocalizedText;
}

export const googleRating = {
  score: "4.9",
  count: 286,
  reviewsUrl:
    "https://www.google.com/maps/search/?api=1&query=Jian+Bing+Liu+124+Camden+Rd+London+NW1+9EE",
};

/**
 * Verified customer reviews published on Jian Bing Liu's Google / official listing.
 * Chinese translations preserve the meaning of each original English review.
 */
export const customerReviews: CustomerReview[] = [
  {
    id: "mimi",
    author: "Mimi",
    rating: 5,
    source: "Google",
    highlight: {
      en: "Sweetest owner & generous crepes",
      zh: "阿姨特别温柔，配料超足",
    },
    quote: {
      en: "The place itself smelt so comforting and the lady who made our food is the sweetest. We've gone here multiple times and each time the food is even better than the last… it was delicious and if you're near you should stop by. Would 100% recommend!",
      zh: "店里的香味特别治愈，做煎饼的阿姨超级温柔。我们已经去过好多次了，每次都比上次更好吃……甜煎饼料给得非常足，杨枝甘露也超好喝，性价比很高，路过卡姆登一定要来尝尝，100% 推荐！",
    },
  },
  {
    id: "iris",
    author: "Iris",
    rating: 5,
    source: "Google",
    highlight: {
      en: "Matcha dessert crepe, wontons & beef Jian Bing",
      zh: "抹茶甜煎饼、馄饨和牛肉煎饼都很赞",
    },
    quote: {
      en: "I got the matcha dessert crepe with cheesecake cream, strawberries, banana, Nutella, and Dubai chocolate kunafeh toppings and it was so delicious! My friends also got some wontons and a savoury beef Chinese crepe. We had a lovely experience and will definitely be back!",
      zh: "点了抹茶甜煎饼加芝士奶盖、草莓、香蕉、榛子巧克力酱和迪拜巧克力脆，太好吃了！朋友点的馄饨和咸味牛肉煎饼也特别香。整体体验非常棒，感谢老板娘的热情，肯定还会再来！",
    },
  },
  {
    id: "natali-jensen",
    author: "Natali JENSEN",
    rating: 5,
    source: "Google",
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
    source: "Google",
    highlight: {
      en: "A hidden gem on Camden Road",
      zh: "藏在卡姆登路上的宝藏小店",
    },
    quote: {
      en: "Tucked away on Camden Road is a Jian Bing place run by the most lovely woman. She was so nice and explained what she was putting into each crepe. I got the matcha crepe which was super filling and delicious… Would highly recommend — portions are big and really yummy.",
      zh: "藏在卡姆登路上的宝藏煎饼店，老板娘人特别好，会很耐心地介绍每一种配料。我点的抹茶甜煎饼配料丰富又扎实，草莓香蕉都很新鲜，分量超大超好吃，强烈推荐！",
    },
  },
];
