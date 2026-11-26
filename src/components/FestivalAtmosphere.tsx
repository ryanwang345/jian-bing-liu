"use client";

import type { FestivalMotif, FestivalPreset } from "@/data/festivals";

interface FestivalAtmosphereProps {
  festival: FestivalPreset;
}

function LanternPair({
  primary,
  accent,
  deep,
}: {
  primary: string;
  accent: string;
  deep: string;
}) {
  return (
    <svg
      viewBox="0 0 150 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-56 w-36 opacity-85"
    >
      <line x1="56" y1="0" x2="56" y2="42" stroke={accent} strokeWidth="2.5" />
      <rect x="40" y="40" width="32" height="9" rx="3" fill={accent} />
      <ellipse cx="56" cy="86" rx="34" ry="40" fill={primary} />
      <ellipse cx="56" cy="86" rx="20" ry="39" stroke={accent} strokeOpacity="0.65" strokeWidth="1.5" />
      <ellipse cx="56" cy="86" rx="8" ry="40" stroke={accent} strokeOpacity="0.55" strokeWidth="1.2" />
      <ellipse cx="44" cy="74" rx="7" ry="16" fill={accent} fillOpacity="0.22" />
      <rect x="42" y="122" width="28" height="8" rx="3" fill={accent} />
      <line x1="56" y1="130" x2="56" y2="168" stroke={accent} strokeWidth="2.5" />
      <line x1="51" y1="138" x2="48" y2="164" stroke={primary} strokeWidth="1.8" />
      <line x1="61" y1="138" x2="64" y2="164" stroke={primary} strokeWidth="1.8" />
      <circle cx="56" cy="136" r="4" fill={accent} />

      <line x1="112" y1="0" x2="112" y2="70" stroke={accent} strokeWidth="2" />
      <rect x="101" y="68" width="22" height="6" rx="2" fill={accent} />
      <ellipse cx="112" cy="98" rx="21" ry="25" fill={deep} />
      <ellipse cx="112" cy="98" rx="11" ry="24" stroke={accent} strokeOpacity="0.65" strokeWidth="1.2" />
      <rect x="102" y="120" width="20" height="6" rx="2" fill={accent} />
      <line x1="112" y1="126" x2="112" y2="150" stroke={accent} strokeWidth="2" />

      <path d="M18 118 L21 125 L28 128 L21 131 L18 138 L15 131 L8 128 L15 125 Z" fill={accent} />
      <circle cx="90" cy="52" r="3" fill={accent} />
    </svg>
  );
}

function WinterOrnaments({
  primary,
  accent,
  jade,
}: {
  primary: string;
  accent: string;
  jade: string;
}) {
  return (
    <svg
      viewBox="0 0 150 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-56 w-36 opacity-85"
    >
      <line x1="52" y1="0" x2="52" y2="52" stroke={accent} strokeWidth="2" />
      <rect x="45" y="50" width="14" height="7" rx="2" fill={accent} />
      <circle cx="52" cy="82" r="24" fill={primary} />
      <path d="M30 82 Q52 68 74 82" stroke={accent} strokeWidth="2" strokeOpacity="0.85" />
      <path d="M32 92 Q52 80 72 92" stroke={accent} strokeWidth="1.5" strokeOpacity="0.65" />
      <circle cx="44" cy="72" r="5.5" fill="#FFFFFF" fillOpacity="0.25" />

      <line x1="112" y1="0" x2="112" y2="82" stroke={accent} strokeWidth="1.8" />
      <rect x="107" y="80" width="10" height="5" rx="1.5" fill={accent} />
      <circle cx="112" cy="104" r="18" fill={jade} />
      <path d="M112 92 L115 101 L124 104 L115 107 L112 116 L109 107 L100 104 L109 101 Z" fill={accent} />

      <g stroke={jade} strokeOpacity="0.55" strokeWidth="1.8" strokeLinecap="round" transform="translate(80 162)">
        <line x1="0" y1="-15" x2="0" y2="15" />
        <line x1="-13" y1="-7" x2="13" y2="7" />
        <line x1="-13" y1="7" x2="13" y2="-7" />
        <circle cx="0" cy="0" r="3" fill={accent} stroke="none" />
      </g>
      <path d="M26 146 L29 153 L36 156 L29 159 L26 166 L23 159 L16 156 L23 153 Z" fill={accent} />
    </svg>
  );
}

function CrescentOrnaments({
  primary,
  accent,
  jade,
}: {
  primary: string;
  accent: string;
  jade: string;
}) {
  return (
    <svg
      viewBox="0 0 150 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-56 w-36 opacity-85"
    >
      <line x1="54" y1="0" x2="54" y2="46" stroke={accent} strokeWidth="2" />
      <path d="M42 52 L54 40 L66 52 Z" fill={accent} />
      <path d="M36 54 H72 L66 108 H42 Z" fill={primary} stroke={accent} strokeWidth="1.6" />
      <path d="M54 60 Q62 78 54 100 Q46 78 54 60 Z" fill={accent} fillOpacity="0.75" />
      <path d="M42 108 H66 L54 120 Z" fill={accent} />

      <path d="M118 46 A23 23 0 1 0 134 88 A18 18 0 1 1 118 46 Z" fill={accent} />

      <g transform="translate(104 142)">
        <rect x="-9" y="-9" width="18" height="18" fill={jade} fillOpacity="0.55" />
        <rect x="-9" y="-9" width="18" height="18" transform="rotate(45)" fill={accent} fillOpacity="0.85" />
        <circle cx="0" cy="0" r="3.5" fill={primary} />
      </g>
      <path d="M26 142 L29 149 L36 152 L29 155 L26 162 L23 155 L16 152 L23 149 Z" fill={accent} />
    </svg>
  );
}

function SpookyOrnaments({
  primary,
  accent,
  jade,
}: {
  primary: string;
  accent: string;
  jade: string;
}) {
  return (
    <svg
      viewBox="0 0 150 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-56 w-36 opacity-85"
    >
      <g stroke={jade} strokeOpacity="0.34" strokeWidth="1.3">
        <line x1="0" y1="0" x2="108" y2="16" />
        <line x1="0" y1="0" x2="86" y2="62" />
        <line x1="0" y1="0" x2="48" y2="102" />
        <line x1="0" y1="0" x2="12" y2="118" />
        <path d="M6 48 Q32 38 48 10" />
        <path d="M10 82 Q50 66 78 14" />
        <path d="M12 110 Q66 88 102 16" />
      </g>

      <circle cx="110" cy="64" r="22" fill={accent} fillOpacity="0.85" />
      <path
        d="M86 112 Q95 102 103 110 Q107 105 111 110 Q119 102 128 112 Q120 114 115 120 Q111 116 107 116 Q103 116 99 120 Q94 114 86 112 Z"
        fill={jade}
      />
      <path
        d="M36 142 Q43 135 49 141 Q52 137 55 141 Q61 135 68 142 Q62 143 58 148 Q55 145 52 145 Q49 145 46 148 Q42 143 36 142 Z"
        fill={primary}
        fillOpacity="0.85"
      />
      <path d="M78 40 L81 47 L88 50 L81 53 L78 60 L75 53 L68 50 L75 47 Z" fill={primary} />
    </svg>
  );
}

function PetalOrnaments({
  primary,
  accent,
}: {
  primary: string;
  accent: string;
}) {
  return (
    <svg
      viewBox="0 0 150 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-56 w-36 opacity-85"
    >
      <path d="M40 36 C58 26 70 46 52 62 C38 72 22 50 40 36 Z" fill={primary} fillOpacity="0.72" />
      <path d="M98 66 C114 54 128 72 110 90 C94 102 82 80 98 66 Z" fill={accent} fillOpacity="0.9" />
      <path d="M64 124 C78 114 90 128 76 142 C64 152 52 134 64 124 Z" fill={primary} fillOpacity="0.58" />
      <path d="M24 108 C36 100 46 112 34 124 C24 132 14 118 24 108 Z" fill={accent} fillOpacity="0.8" />
      <path
        d="M114 132 C114 124 126 122 126 132 C126 140 114 148 114 148 C114 148 102 140 102 132 C102 122 114 124 114 132 Z"
        fill={primary}
        fillOpacity="0.78"
      />
      <path d="M84 32 L87 39 L94 42 L87 45 L84 52 L81 45 L74 42 L81 39 Z" fill={primary} fillOpacity="0.8" />
    </svg>
  );
}

function FireworksOrnaments({
  primary,
  accent,
  jade,
}: {
  primary: string;
  accent: string;
  jade: string;
}) {
  return (
    <svg
      viewBox="0 0 150 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-56 w-36 opacity-85"
    >
      <g transform="translate(62 72)" stroke={accent} strokeWidth="2.2" strokeLinecap="round">
        <line x1="0" y1="-30" x2="0" y2="-12" />
        <line x1="0" y1="12" x2="0" y2="30" />
        <line x1="-30" y1="0" x2="-12" y2="0" />
        <line x1="12" y1="0" x2="30" y2="0" />
        <line x1="-21" y1="-21" x2="-8" y2="-8" stroke={primary} />
        <line x1="8" y1="8" x2="21" y2="21" stroke={primary} />
        <line x1="-21" y1="21" x2="-8" y2="8" stroke={jade} />
        <line x1="8" y1="-8" x2="21" y2="-21" stroke={jade} />
        <circle cx="0" cy="0" r="4.5" fill={accent} stroke="none" />
      </g>

      <g transform="translate(114 138)" stroke={primary} strokeWidth="1.8" strokeLinecap="round">
        <line x1="0" y1="-20" x2="0" y2="-8" />
        <line x1="0" y1="8" x2="0" y2="20" />
        <line x1="-20" y1="0" x2="-8" y2="0" />
        <line x1="8" y1="0" x2="20" y2="0" />
        <line x1="-14" y1="-14" x2="-5" y2="-5" stroke={accent} />
        <line x1="5" y1="5" x2="14" y2="14" stroke={accent} />
        <circle cx="0" cy="0" r="3" fill={primary} stroke="none" />
      </g>

      <circle cx="34" cy="146" r="3.5" fill={jade} fillOpacity="0.65" />
      <circle cx="110" cy="46" r="3.5" fill={accent} />
    </svg>
  );
}

function MoonOrnaments({
  primary,
  accent,
  jade,
}: {
  primary: string;
  accent: string;
  jade: string;
}) {
  return (
    <svg
      viewBox="0 0 150 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-56 w-36 opacity-85"
    >
      <circle cx="68" cy="74" r="36" fill={accent} fillOpacity="0.22" />
      <circle cx="68" cy="74" r="24" fill={accent} fillOpacity="0.88" />
      <path
        d="M26 94 Q42 82 58 92 Q76 82 94 92 Q104 92 108 100 H22 Q24 95 26 94 Z"
        fill={jade}
        fillOpacity="0.45"
      />
      <path d="M120 52 L123 60 L131 63 L123 66 L120 74 L117 66 L109 63 L117 60 Z" fill={primary} fillOpacity="0.82" />
      <path d="M104 140 L106 146 L112 148 L106 150 L104 156 L102 150 L96 148 L102 146 Z" fill={accent} />
      <circle cx="38" cy="144" r="3.5" fill={primary} fillOpacity="0.7" />
    </svg>
  );
}

function BambooOrnaments({
  primary,
  accent,
  jade,
}: {
  primary: string;
  accent: string;
  jade: string;
}) {
  return (
    <svg
      viewBox="0 0 150 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-56 w-36 opacity-80"
    >
      <path d="M28 0 Q44 76 34 172" stroke={jade} strokeWidth="4" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="30" y1="52" x2="42" y2="52" stroke={accent} strokeWidth="2.5" />
      <line x1="33" y1="108" x2="45" y2="108" stroke={accent} strokeWidth="2.5" />
      <path d="M38 50 C64 34 92 40 108 54 C84 62 58 60 38 50 Z" fill={primary} fillOpacity="0.75" />
      <path d="M40 54 C60 66 80 84 88 100 C66 88 50 74 40 54 Z" fill={jade} fillOpacity="0.65" />
      <path d="M40 106 C68 92 96 100 112 116 C86 122 60 118 40 106 Z" fill={primary} fillOpacity="0.65" />
      <path d="M118 62 L121 69 L128 72 L121 75 L118 82 L115 75 L108 72 L115 69 Z" fill={accent} />
    </svg>
  );
}

function SpringOrnaments({
  primary,
  accent,
  jade,
}: {
  primary: string;
  accent: string;
  jade: string;
}) {
  return (
    <svg
      viewBox="0 0 150 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-56 w-36 opacity-85"
    >
      <g transform="translate(58 72)">
        <circle cx="0" cy="-13" r="9.5" fill={accent} fillOpacity="0.9" />
        <circle cx="12" cy="-4" r="9.5" fill={accent} fillOpacity="0.85" />
        <circle cx="7" cy="11" r="9.5" fill={accent} fillOpacity="0.9" />
        <circle cx="-7" cy="11" r="9.5" fill={accent} fillOpacity="0.85" />
        <circle cx="-12" cy="-4" r="9.5" fill={accent} fillOpacity="0.9" />
        <circle cx="0" cy="0" r="7.5" fill={jade} />
      </g>

      <g transform="translate(110 132)">
        <circle cx="0" cy="-9" r="6.5" fill={jade} fillOpacity="0.72" />
        <circle cx="8" cy="-3" r="6.5" fill={jade} fillOpacity="0.68" />
        <circle cx="5" cy="7" r="6.5" fill={jade} fillOpacity="0.72" />
        <circle cx="-5" cy="7" r="6.5" fill={jade} fillOpacity="0.68" />
        <circle cx="-8" cy="-3" r="6.5" fill={jade} fillOpacity="0.72" />
        <circle cx="0" cy="0" r="4.5" fill={accent} />
      </g>
      <circle cx="114" cy="48" r="4.5" fill={primary} fillOpacity="0.7" />
      <path d="M88 38 L91 45 L98 48 L91 51 L88 58 L85 51 L78 48 L85 45 Z" fill={primary} fillOpacity="0.8" />
    </svg>
  );
}

function GriddleOrnaments({
  primary,
  accent,
}: {
  primary: string;
  accent: string;
}) {
  return (
    <svg
      viewBox="0 0 150 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-56 w-36 opacity-85"
    >
      <circle cx="62" cy="72" r="22" fill={accent} fillOpacity="0.84" />
      <circle cx="62" cy="72" r="32" stroke={primary} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="6 6" />
      <path d="M106 142 Q98 124 108 108 Q118 92 108 74" stroke={primary} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      <path d="M122 152 Q114 134 124 118 Q134 102 124 84" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 132 L39 140 L47 143 L39 146 L36 154 L33 146 L25 143 L33 140 Z" fill={primary} />
    </svg>
  );
}

function HeritageOrnaments({
  primary,
  accent,
  jade,
}: {
  primary: string;
  accent: string;
  jade: string;
}) {
  return (
    <svg
      viewBox="0 0 150 240"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-56 w-36 opacity-80"
    >
      <path d="M60 44 L66 60 L82 66 L66 72 L60 88 L54 72 L38 66 L54 60 Z" fill={accent} />
      <path d="M112 114 L116 124 L126 128 L116 132 L112 142 L108 132 L98 128 L108 124 Z" fill={primary} fillOpacity="0.8" />
      <rect x="34" y="128" width="13" height="13" transform="rotate(45 40 134)" stroke={jade} strokeWidth="2" />
      <g stroke={accent} strokeOpacity="0.35" strokeWidth="1.5">
        <line x1="12" y1="24" x2="104" y2="24" />
        <line x1="12" y1="30" x2="78" y2="30" stroke={primary} strokeOpacity="0.45" />
      </g>
    </svg>
  );
}

function MotifArtwork({
  motif,
  festival,
}: {
  motif: FestivalMotif;
  festival: FestivalPreset;
}) {
  const { cinnabar, bannerAccent, jade, bannerBg } = festival.theme;
  switch (motif) {
    case "lanterns":
      return <LanternPair primary={cinnabar} accent={bannerAccent} deep={bannerBg} />;
    case "winter":
      return <WinterOrnaments primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "crescent":
      return <CrescentOrnaments primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "spooky":
      return <SpookyOrnaments primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "petals":
      return <PetalOrnaments primary={cinnabar} accent={bannerAccent} />;
    case "fireworks":
      return <FireworksOrnaments primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "moon":
      return <MoonOrnaments primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "bamboo":
      return <BambooOrnaments primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "spring":
      return <SpringOrnaments primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "griddle":
      return <GriddleOrnaments primary={cinnabar} accent={bannerAccent} />;
    case "heritage":
      return <HeritageOrnaments primary={cinnabar} accent={bannerAccent} jade={jade} />;
  }
}

/**
 * Accessible festive margin framing rendered only when a holiday theme is active.
 * - Strictly confined to wide-screen outer side gutters outside the max-w-7xl content container
 *   so decorative motifs NEVER overlap images or description text at any screen size.
 * - Uses a calm finite entrance (no continuous >5s motion, compliant with WCAG 2.2.2)
 *   and is automatically hidden under prefers-contrast: more and forced-colors: active.
 */
export function FestivalAtmosphere({ festival }: FestivalAtmosphereProps) {
  return (
    <div
      aria-hidden="true"
      data-festival-decorative="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[280px] overflow-hidden select-none 2xl:block"
    >
      {/* Left outer gutter motif (clipped strictly outside max-w-7xl content area) */}
      <div
        className="festival-ornament-enter absolute top-0 left-0 overflow-hidden"
        style={{ maxWidth: "max(0px, calc((100vw - 82rem) / 2))" }}
      >
        <MotifArtwork motif={festival.theme.motif} festival={festival} />
      </div>

      {/* Right mirrored outer gutter motif (clipped strictly outside max-w-7xl content area) */}
      <div
        className="festival-ornament-enter absolute top-0 right-0 overflow-hidden"
        style={{ maxWidth: "max(0px, calc((100vw - 82rem) / 2))" }}
      >
        <div className="-scale-x-100">
          <MotifArtwork motif={festival.theme.motif} festival={festival} />
        </div>
      </div>
    </div>
  );
}
