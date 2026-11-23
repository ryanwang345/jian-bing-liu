import type { DietaryTag } from "@/data/menu";

interface DietaryBadgeProps {
  tag: DietaryTag;
}

const tagStyles: Record<DietaryTag, string> = {
  Halal: "border-cinnabar/25 bg-cinnabar/10 text-cinnabar-dark",
  Vegetarian: "border-jade/30 bg-jade/10 text-jade",
  Vegan: "border-jade/40 bg-jade text-parchment",
};

export function DietaryBadge({ tag }: DietaryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${tagStyles[tag]}`}
    >
      {tag}
    </span>
  );
}
