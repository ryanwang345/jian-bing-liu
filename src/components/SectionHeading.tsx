interface SectionHeadingProps {
  eyebrow: string;
  chineseAccent?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  chineseAccent,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div className={isCenter ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <div
        className={`inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase ${
          isCenter ? "justify-center" : ""
        }`}
      >
        <span>{eyebrow}</span>
        {chineseAccent && (
          <>
            <span aria-hidden="true" className="text-kraft-deep">
              ·
            </span>
            <span
              lang="zh-Hans"
              className="font-calligraphy text-base font-normal tracking-normal text-ink-soft"
            >
              {chineseAccent}
            </span>
          </>
        )}
      </div>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
