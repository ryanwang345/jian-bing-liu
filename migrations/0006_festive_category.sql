-- Add Festive Specials / 节日限定菜单 category.
-- Placed at sort_order = -1 so active festive items spotlight at the top of /menu,
-- while remaining automatically hidden on the public menu when empty.
INSERT OR IGNORE INTO menu_categories (
  id,
  title_en,
  title_zh,
  chinese_title,
  subtitle_en,
  subtitle_zh,
  sort_order
) VALUES (
  'festive-specials',
  'Festive Specials',
  '节日限定菜单',
  '节日限定',
  'Limited-time seasonal crepes, snacks and drinks crafted for holidays and celebrations — available while ingredients last.',
  '逢年过节特别推出的限定风味煎饼、点心与特调，限时供应、售完即止。',
  -1
);
