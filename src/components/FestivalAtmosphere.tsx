"use client";

import type { FestivalMotif, FestivalPreset } from "@/data/festivals";

interface FestivalAtmosphereProps {
  festival: FestivalPreset;
}

function LanternPair({
  side,
  primary,
  accent,
  deep,
}: {
  side: "left" | "right";
  primary: string;
  accent: string;
  deep: string;
}) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 180 260"
      fill="none"
      className={`h-44 w-32 sm:h-60 sm:w-44 lg:h-72 lg:w-52 ${
        isLeft ? "opacity-85" : "opacity-80"
      }`}
    >
      {/* Main hanging lantern */}
      <g className="festival-sway" style={{ animationDelay: isLeft ? "0s" : "1.4s" }}>
        <line x1="68" y1="0" x2="68" y2="44" stroke={accent} strokeWidth="2.5" />
        <rect x="52" y="42" width="32" height="9" rx="3" fill={accent} />
        <ellipse cx="68" cy="88" rx="36" ry="42" fill={primary} />
        <ellipse cx="68" cy="88" rx="22" ry="41" stroke={accent} strokeOpacity="0.65" strokeWidth="1.5" />
        <ellipse cx="68" cy="88" rx="9" ry="42" stroke={accent} strokeOpacity="0.55" strokeWidth="1.2" />
        <ellipse cx="56" cy="76" rx="8" ry="18" fill={accent} fillOpacity="0.22" />
        <rect x="54" y="126" width="28" height="8" rx="3" fill={accent} />
        <line x1="68" y1="134" x2="68" y2="174" stroke={accent} strokeWidth="2.5" />
        <line x1="63" y1="142" x2="60" y2="170" stroke={primary} strokeWidth="1.8" />
        <line x1="73" y1="142" x2="76" y2="170" stroke={primary} strokeWidth="1.8" />
        <circle cx="68" cy="140" r="4" fill={accent} />
      </g>

      {/* Secondary smaller lantern */}
      <g
        className="festival-sway"
        style={{ animationDelay: isLeft ? "2.1s" : "0.7s", transformOrigin: "132px 0px" }}
      >
        <line x1="132" y1="0" x2="132" y2="74" stroke={accent} strokeWidth="2" />
        <rect x="121" y="72" width="22" height="6" rx="2" fill={accent} />
        <ellipse cx="132" cy="102" rx="22" ry="26" fill={deep} />
        <ellipse cx="132" cy="102" rx="12" ry="25" stroke={accent} strokeOpacity="0.65" strokeWidth="1.2" />
        <rect x="122" y="125" width="20" height="6" rx="2" fill={accent} />
        <line x1="132" y1="131" x2="132" y2="156" stroke={accent} strokeWidth="2" />
      </g>

      {/* Festive golden sparkles */}
      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "0.4s" : "1.8s" }}>
        <path d="M24 118 L27 125 L34 128 L27 131 L24 138 L21 131 L14 128 L21 125 Z" fill={accent} />
        <path d="M156 172 L158 177 L163 179 L158 181 L156 186 L154 181 L149 179 L154 177 Z" fill={primary} fillOpacity="0.8" />
        <circle cx="105" cy="54" r="3" fill={accent} />
      </g>
    </svg>
  );
}

function WinterOrnaments({
  side,
  primary,
  accent,
  jade,
}: {
  side: "left" | "right";
  primary: string;
  accent: string;
  jade: string;
}) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      className="h-44 w-36 sm:h-60 sm:w-48 lg:h-72 lg:w-56 opacity-85"
    >
      {/* Hanging Christmas ornament bauble */}
      <g className="festival-sway" style={{ animationDelay: isLeft ? "0s" : "1.6s" }}>
        <line x1="64" y1="0" x2="64" y2="54" stroke={accent} strokeWidth="2" />
        <rect x="57" y="52" width="14" height="7" rx="2" fill={accent} />
        <circle cx="64" cy="84" r="26" fill={primary} />
        <path d="M40 84 Q64 70 88 84" stroke={accent} strokeWidth="2" strokeOpacity="0.85" />
        <path d="M42 94 Q64 82 86 94" stroke={accent} strokeWidth="1.5" strokeOpacity="0.65" />
        <circle cx="55" cy="74" r="6" fill="#FFFFFF" fillOpacity="0.25" />
      </g>

      {/* Evergreen bauble */}
      <g className="festival-sway" style={{ animationDelay: isLeft ? "1.9s" : "0.6s", transformOrigin: "136px 0px" }}>
        <line x1="136" y1="0" x2="136" y2="86" stroke={accent} strokeWidth="1.8" />
        <rect x="131" y="84" width="10" height="5" rx="1.5" fill={accent} />
        <circle cx="136" cy="108" r="19" fill={jade} />
        <path d="M136 96 L139 105 L148 108 L139 111 L136 120 L133 111 L124 108 L133 105 Z" fill={accent} />
      </g>

      {/* Crystalline snowflakes & twinkling stars */}
      <g className="festival-float-slow" style={{ animationDelay: isLeft ? "0.5s" : "2.1s" }}>
        <g stroke={jade} strokeOpacity="0.55" strokeWidth="1.8" strokeLinecap="round" transform="translate(106 168)">
          <line x1="0" y1="-16" x2="0" y2="16" />
          <line x1="-14" y1="-8" x2="14" y2="8" />
          <line x1="-14" y1="8" x2="14" y2="-8" />
          <circle cx="0" cy="0" r="3" fill={accent} stroke="none" />
        </g>
        <g stroke={primary} strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" transform="translate(36 156)">
          <line x1="0" y1="-11" x2="0" y2="11" />
          <line x1="-10" y1="-5" x2="10" y2="5" />
          <line x1="-10" y1="5" x2="10" y2="-5" />
        </g>
      </g>

      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "0.8s" : "2.3s" }}>
        <path d="M168 58 L171 66 L179 69 L171 72 L168 80 L165 72 L157 69 L165 66 Z" fill={accent} />
        <circle cx="98" cy="42" r="3" fill={primary} fillOpacity="0.7" />
        <circle cx="160" cy="160" r="2.5" fill={accent} />
      </g>
    </svg>
  );
}

function CrescentOrnaments({
  side,
  primary,
  accent,
  jade,
}: {
  side: "left" | "right";
  primary: string;
  accent: string;
  jade: string;
}) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      className="h-44 w-36 sm:h-60 sm:w-48 lg:h-72 lg:w-56 opacity-85"
    >
      {/* Hanging Fanoos lantern */}
      <g className="festival-sway" style={{ animationDelay: isLeft ? "0s" : "1.5s" }}>
        <line x1="68" y1="0" x2="68" y2="48" stroke={accent} strokeWidth="2" />
        <path d="M56 54 L68 42 L80 54 Z" fill={accent} />
        <path d="M50 56 H86 L80 112 H56 Z" fill={primary} stroke={accent} strokeWidth="1.6" />
        <path d="M68 62 Q76 80 68 104 Q60 80 68 62 Z" fill={accent} fillOpacity="0.75" />
        <path d="M56 112 H80 L68 124 Z" fill={accent} />
      </g>

      {/* Crescent Moon */}
      <g className="festival-float-slow" style={{ animationDelay: isLeft ? "0.8s" : "2s" }}>
        <path
          d="M148 48 A26 26 0 1 0 166 94 A21 21 0 1 1 148 48 Z"
          fill={accent}
        />
      </g>

      {/* 8-pointed geometric stars */}
      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "0.3s" : "1.9s" }}>
        <g transform="translate(132 146)">
          <rect x="-10" y="-10" width="20" height="20" fill={jade} fillOpacity="0.55" />
          <rect x="-10" y="-10" width="20" height="20" transform="rotate(45)" fill={accent} fillOpacity="0.85" />
          <circle cx="0" cy="0" r="4" fill={primary} />
        </g>
        <path d="M36 142 L39 149 L46 152 L39 155 L36 162 L33 155 L26 152 L33 149 Z" fill={accent} />
        <circle cx="110" cy="46" r="3" fill={primary} fillOpacity="0.7" />
      </g>
    </svg>
  );
}

function SpookyOrnaments({
  side,
  primary,
  accent,
  jade,
}: {
  side: "left" | "right";
  primary: string;
  accent: string;
  jade: string;
}) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      className="h-44 w-36 sm:h-60 sm:w-48 lg:h-72 lg:w-56 opacity-85"
    >
      {/* Delicate corner web filigree */}
      <g stroke={jade} strokeOpacity="0.32" strokeWidth="1.3">
        <line x1="0" y1="0" x2="120" y2="18" />
        <line x1="0" y1="0" x2="96" y2="68" />
        <line x1="0" y1="0" x2="54" y2="110" />
        <line x1="0" y1="0" x2="14" y2="128" />
        <path d="M8 52 Q36 42 54 12" />
        <path d="M12 88 Q56 72 86 16" />
        <path d="M14 118 Q74 96 112 18" />
      </g>

      {/* Playful bats & glowing moon */}
      <g className="festival-float-slow" style={{ animationDelay: isLeft ? "0.2s" : "1.8s" }}>
        <circle cx="144" cy="64" r="24" fill={accent} fillOpacity="0.82" />
        <path
          d="M118 112 Q128 102 136 110 Q140 105 144 110 Q152 102 162 112 Q153 114 148 120 Q144 116 140 116 Q136 116 132 120 Q127 114 118 112 Z"
          fill={jade}
        />
        <path
          d="M52 142 Q59 135 65 141 Q68 137 71 141 Q77 135 84 142 Q78 143 74 148 Q71 145 68 145 Q65 145 62 148 Q58 143 52 142 Z"
          fill={primary}
          fillOpacity="0.85"
        />
      </g>

      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "0.9s" : "2.4s" }}>
        <path d="M104 42 L107 49 L114 52 L107 55 L104 62 L101 55 L94 52 L101 49 Z" fill={primary} />
        <circle cx="172" cy="148" r="3.5" fill={accent} />
        <circle cx="42" cy="182" r="2.5" fill={jade} fillOpacity="0.7" />
      </g>
    </svg>
  );
}

function PetalOrnaments({
  side,
  primary,
  accent,
}: {
  side: "left" | "right";
  primary: string;
  accent: string;
}) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      className="h-44 w-36 sm:h-60 sm:w-48 lg:h-72 lg:w-56 opacity-85"
    >
      {/* Floating blossom petals */}
      <g className="festival-float-slow" style={{ animationDelay: isLeft ? "0s" : "1.7s" }}>
        <path d="M54 38 C72 28 84 48 66 64 C52 74 36 52 54 38 Z" fill={primary} fillOpacity="0.72" />
        <path d="M126 68 C142 56 156 74 138 92 C122 104 110 82 126 68 Z" fill={accent} fillOpacity="0.9" />
        <path d="M84 128 C98 118 110 132 96 146 C84 156 72 138 84 128 Z" fill={primary} fillOpacity="0.58" />
        <path d="M36 112 C48 104 58 116 46 128 C36 136 26 122 36 112 Z" fill={accent} fillOpacity="0.8" />
      </g>

      {/* Delicate floating heart & sparkles */}
      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "0.6s" : "2.1s" }}>
        <path
          d="M150 132 C150 124 162 122 162 132 C162 140 150 148 150 148 C150 148 138 140 138 132 C138 122 150 124 150 132 Z"
          fill={primary}
          fillOpacity="0.78"
        />
        <path d="M106 34 L109 41 L116 44 L109 47 L106 54 L103 47 L96 44 L103 41 Z" fill={primary} fillOpacity="0.8" />
        <circle cx="164" cy="48" r="3" fill={primary} fillOpacity="0.6" />
        <circle cx="52" cy="176" r="3" fill={accent} />
      </g>
    </svg>
  );
}

function FireworksOrnaments({
  side,
  primary,
  accent,
  jade,
}: {
  side: "left" | "right";
  primary: string;
  accent: string;
  jade: string;
}) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      className="h-44 w-36 sm:h-60 sm:w-48 lg:h-72 lg:w-56 opacity-85"
    >
      {/* Primary starburst firework */}
      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "0s" : "1.4s" }}>
        <g transform="translate(76 74)" stroke={accent} strokeWidth="2.2" strokeLinecap="round">
          <line x1="0" y1="-34" x2="0" y2="-14" />
          <line x1="0" y1="14" x2="0" y2="34" />
          <line x1="-34" y1="0" x2="-14" y2="0" />
          <line x1="14" y1="0" x2="34" y2="0" />
          <line x1="-24" y1="-24" x2="-10" y2="-10" stroke={primary} />
          <line x1="10" y1="10" x2="24" y2="24" stroke={primary} />
          <line x1="-24" y1="24" x2="-10" y2="10" stroke={jade} />
          <line x1="10" y1="-10" x2="24" y2="-24" stroke={jade} />
          <circle cx="0" cy="0" r="5" fill={accent} stroke="none" />
        </g>
      </g>

      {/* Secondary burst */}
      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "1.6s" : "0.4s" }}>
        <g transform="translate(148 134)" stroke={primary} strokeWidth="1.8" strokeLinecap="round">
          <line x1="0" y1="-22" x2="0" y2="-9" />
          <line x1="0" y1="9" x2="0" y2="22" />
          <line x1="-22" y1="0" x2="-9" y2="0" />
          <line x1="9" y1="0" x2="22" y2="0" />
          <line x1="-15" y1="-15" x2="-6" y2="-6" stroke={accent} />
          <line x1="6" y1="6" x2="15" y2="15" stroke={accent} />
          <line x1="-15" y1="15" x2="-6" y2="6" stroke={jade} />
          <line x1="6" y1="-6" x2="15" y2="-15" stroke={jade} />
          <circle cx="0" cy="0" r="3.5" fill={primary} stroke="none" />
        </g>
      </g>

      {/* Confetti dots */}
      <g className="festival-float-slow">
        <circle cx="44" cy="148" r="4" fill={jade} fillOpacity="0.65" />
        <circle cx="132" cy="48" r="3.5" fill={accent} />
        <rect x="92" y="156" width="8" height="4" rx="2" transform="rotate(28 92 156)" fill={primary} fillOpacity="0.7" />
        <rect x="34" y="34" width="7" height="3.5" rx="1.5" transform="rotate(-24 34 34)" fill={accent} />
      </g>
    </svg>
  );
}

function MoonOrnaments({
  side,
  primary,
  accent,
  jade,
}: {
  side: "left" | "right";
  primary: string;
  accent: string;
  jade: string;
}) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      className="h-44 w-36 sm:h-60 sm:w-48 lg:h-72 lg:w-56 opacity-85"
    >
      {/* Luminous Full Moon Halo */}
      <g className="festival-float-slow" style={{ animationDelay: isLeft ? "0s" : "1.8s" }}>
        <circle cx="88" cy="76" r="40" fill={accent} fillOpacity="0.22" />
        <circle cx="88" cy="76" r="26" fill={accent} fillOpacity="0.88" />
        {/* Cloud wisp across moon */}
        <path
          d="M42 96 Q58 84 74 94 Q92 84 112 94 Q124 94 128 102 H36 Q38 97 42 96 Z"
          fill={jade}
          fillOpacity="0.45"
        />
      </g>

      {/* Osmanthus stars & golden sparkles */}
      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "0.5s" : "2.1s" }}>
        <path d="M148 54 L151 62 L159 65 L151 68 L148 76 L145 68 L137 65 L145 62 Z" fill={primary} fillOpacity="0.82" />
        <path d="M134 142 L136 148 L142 150 L136 152 L134 158 L132 152 L126 150 L132 148 Z" fill={accent} />
        <circle cx="52" cy="146" r="3.5" fill={primary} fillOpacity="0.7" />
        <circle cx="160" cy="112" r="2.5" fill={accent} />
      </g>
    </svg>
  );
}

function BambooOrnaments({
  side,
  primary,
  accent,
  jade,
}: {
  side: "left" | "right";
  primary: string;
  accent: string;
  jade: string;
}) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      className="h-44 w-36 sm:h-60 sm:w-48 lg:h-72 lg:w-56 opacity-80"
    >
      <g className="festival-sway" style={{ animationDelay: isLeft ? "0s" : "1.8s" }}>
        {/* Graceful bamboo culm & leaves */}
        <path d="M36 0 Q54 78 44 176" stroke={jade} strokeWidth="4" strokeLinecap="round" strokeOpacity="0.6" />
        <line x1="39" y1="54" x2="51" y2="54" stroke={accent} strokeWidth="2.5" />
        <line x1="42" y1="112" x2="54" y2="112" stroke={accent} strokeWidth="2.5" />
        <path d="M46 52 C74 36 104 42 120 56 C94 64 68 62 46 52 Z" fill={primary} fillOpacity="0.75" />
        <path d="M48 56 C70 68 92 86 100 104 C76 92 58 76 48 56 Z" fill={jade} fillOpacity="0.65" />
        <path d="M48 110 C78 96 108 104 126 120 C98 126 70 122 48 110 Z" fill={primary} fillOpacity="0.65" />
      </g>

      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "0.7s" : "2.2s" }}>
        <path d="M148 64 L151 71 L158 74 L151 77 L148 84 L145 77 L138 74 L145 71 Z" fill={accent} />
        <circle cx="132" cy="146" r="3.5" fill={primary} fillOpacity="0.6" />
      </g>
    </svg>
  );
}

function SpringOrnaments({
  side,
  primary,
  accent,
  jade,
}: {
  side: "left" | "right";
  primary: string;
  accent: string;
  jade: string;
}) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      className="h-44 w-36 sm:h-60 sm:w-48 lg:h-72 lg:w-56 opacity-85"
    >
      {/* Spring flower & pastel confetti */}
      <g className="festival-float-slow" style={{ animationDelay: isLeft ? "0s" : "1.5s" }}>
        <g transform="translate(76 74)">
          <circle cx="0" cy="-14" r="10" fill={accent} fillOpacity="0.9" />
          <circle cx="13" cy="-4" r="10" fill={accent} fillOpacity="0.85" />
          <circle cx="8" cy="12" r="10" fill={accent} fillOpacity="0.9" />
          <circle cx="-8" cy="12" r="10" fill={accent} fillOpacity="0.85" />
          <circle cx="-13" cy="-4" r="10" fill={accent} fillOpacity="0.9" />
          <circle cx="0" cy="0" r="8" fill={jade} />
        </g>

        <g transform="translate(144 132)">
          <circle cx="0" cy="-10" r="7" fill={jade} fillOpacity="0.72" />
          <circle cx="9" cy="-3" r="7" fill={jade} fillOpacity="0.68" />
          <circle cx="6" cy="8" r="7" fill={jade} fillOpacity="0.72" />
          <circle cx="-6" cy="8" r="7" fill={jade} fillOpacity="0.68" />
          <circle cx="-9" cy="-3" r="7" fill={jade} fillOpacity="0.72" />
          <circle cx="0" cy="0" r="5" fill={accent} />
        </g>
      </g>

      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "0.6s" : "2s" }}>
        <circle cx="144" cy="52" r="5" fill={primary} fillOpacity="0.7" />
        <circle cx="48" cy="144" r="4" fill={primary} fillOpacity="0.65" />
        <path d="M112 40 L115 47 L122 50 L115 53 L112 60 L109 53 L102 50 L109 47 Z" fill={primary} fillOpacity="0.8" />
      </g>
    </svg>
  );
}

function GriddleOrnaments({
  side,
  primary,
  accent,
}: {
  side: "left" | "right";
  primary: string;
  accent: string;
}) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      className="h-44 w-36 sm:h-60 sm:w-48 lg:h-72 lg:w-56 opacity-85"
    >
      {/* Sunny golden starburst & warm steam curls */}
      <g className="festival-float-slow" style={{ animationDelay: isLeft ? "0s" : "1.6s" }}>
        <circle cx="82" cy="74" r="24" fill={accent} fillOpacity="0.82" />
        <circle cx="82" cy="74" r="34" stroke={primary} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="6 6" />
        <path d="M132 146 Q124 128 134 112 Q144 96 134 78" stroke={primary} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
        <path d="M150 156 Q142 138 152 122 Q162 106 152 88" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      </g>

      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "0.4s" : "2s" }}>
        <path d="M46 134 L49 142 L57 145 L49 148 L46 156 L43 148 L35 145 L43 142 Z" fill={primary} />
        <path d="M148 44 L150 50 L156 52 L150 54 L148 60 L146 54 L140 52 L146 50 Z" fill={accent} />
      </g>
    </svg>
  );
}

function HeritageOrnaments({
  side,
  primary,
  accent,
  jade,
}: {
  side: "left" | "right";
  primary: string;
  accent: string;
  jade: string;
}) {
  const isLeft = side === "left";
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      className="h-44 w-36 sm:h-60 sm:w-48 lg:h-72 lg:w-56 opacity-80"
    >
      <g className="festival-twinkle" style={{ animationDelay: isLeft ? "0s" : "1.5s" }}>
        <path d="M74 44 L80 62 L98 68 L80 74 L74 92 L68 74 L50 68 L68 62 Z" fill={accent} />
        <path d="M142 114 L146 126 L158 130 L146 134 L142 146 L138 134 L126 130 L138 126 Z" fill={primary} fillOpacity="0.8" />
        <rect x="44" y="132" width="14" height="14" transform="rotate(45 51 139)" stroke={jade} strokeWidth="2" />
      </g>
      <g stroke={accent} strokeOpacity="0.35" strokeWidth="1.5">
        <line x1="16" y1="24" x2="118" y2="24" />
        <line x1="16" y1="30" x2="88" y2="30" stroke={primary} strokeOpacity="0.45" />
      </g>
    </svg>
  );
}

function MotifArtwork({
  motif,
  side,
  festival,
}: {
  motif: FestivalMotif;
  side: "left" | "right";
  festival: FestivalPreset;
}) {
  const { cinnabar, bannerAccent, jade, bannerBg } = festival.theme;
  switch (motif) {
    case "lanterns":
      return <LanternPair side={side} primary={cinnabar} accent={bannerAccent} deep={bannerBg} />;
    case "winter":
      return <WinterOrnaments side={side} primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "crescent":
      return <CrescentOrnaments side={side} primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "spooky":
      return <SpookyOrnaments side={side} primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "petals":
      return <PetalOrnaments side={side} primary={cinnabar} accent={bannerAccent} />;
    case "fireworks":
      return <FireworksOrnaments side={side} primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "moon":
      return <MoonOrnaments side={side} primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "bamboo":
      return <BambooOrnaments side={side} primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "spring":
      return <SpringOrnaments side={side} primary={cinnabar} accent={bannerAccent} jade={jade} />;
    case "griddle":
      return <GriddleOrnaments side={side} primary={cinnabar} accent={bannerAccent} />;
    case "heritage":
      return <HeritageOrnaments side={side} primary={cinnabar} accent={bannerAccent} jade={jade} />;
  }
}

/**
 * Lightweight, non-blocking festive atmosphere layer rendered only when a holiday theme is active.
 * Adds vivid corner colour halos + bespoke SVG holiday motifs framing the storefront without obstructing content.
 */
export function FestivalAtmosphere({ festival }: FestivalAtmosphereProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[2] h-[460px] overflow-hidden select-none"
    >
      {/* Top vivid holiday colour crown wash */}
      <div
        className="absolute inset-x-0 top-0 h-56 opacity-90"
        style={{
          background: `linear-gradient(180deg, ${festival.theme.glowA} 0%, ${festival.theme.glowB} 45%, transparent 100%)`,
        }}
      />

      {/* Left hanging / floating festive motif */}
      <div className="absolute top-14 -left-6 sm:top-16 sm:left-0 lg:left-2">
        <MotifArtwork
          motif={festival.theme.motif}
          side="left"
          festival={festival}
        />
      </div>

      {/* Right mirrored hanging / floating festive motif */}
      <div className="absolute top-14 -right-6 -scale-x-100 sm:top-16 sm:right-0 lg:right-2">
        <MotifArtwork
          motif={festival.theme.motif}
          side="right"
          festival={festival}
        />
      </div>
    </div>
  );
}
