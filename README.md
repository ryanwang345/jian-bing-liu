# Jian Bing Liu (煎饼刘) — Restaurant Website

A warm, modern, responsive restaurant website for **Jian Bing Liu** (`124 Camden Rd, London NW1 9EE`), built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

## Features

- **Pages**: Home (`/`), Menu (`/menu`), Our Story (`/our-story`), Gallery (`/gallery`), and Visit Us (`/visit-us`).
- **Real Supplied Photography**: Curated and optimized local photography from the provided Google Drive folder rendered via `next/image` with AVIF/WebP support and descriptive `alt` text.
- **Brand-Aligned Visual System**: Warm kraft paper (`#FBF6EC` / `#F2E6CF`), vermilion seal cinnabar (`#B8251C`), cast-iron ink (`#1A1614`), and calligraphy accents (`Ma Shan Zheng`, `Fraunces`, `Plus Jakarta Sans` loaded via `next/font/google`).
- **Interactive Menu & Gallery**: Dietary filters (`All`, `Halal`, `Vegetarian`, `Vegan`) with category jump links on `/menu`, plus a category-filtered lightbox gallery with keyboard navigation on `/gallery`.
- **Verified Business Details & Clear Placeholders**: Address, opening hours, phone number, service options (Takeaway & No-contact delivery), verified menu items/prices, and official All Eat ordering link. Unverified optional details (email address, official social handles, founder bio dates, and unpriced photographed items) are clearly marked as placeholders rather than invented.
- **SEO & Accessibility**: Per-page metadata, Open Graph & Twitter previews, `Restaurant` JSON-LD structured data, dynamic `sitemap.xml` and `robots.txt`, skip-to-content link, keyboard navigation, and accessible color contrast.

## Easy Content Updates

All restaurant content lives in structured TypeScript files under `src/data/`:

- [`src/data/restaurant.ts`](src/data/restaurant.ts) — Address, opening hours, phone, verified ordering/map links, story copy, and clearly marked placeholders (`email`, `verifiedSocialLinks`, `founderStoryNote`).
- [`src/data/menu.ts`](src/data/menu.ts) — Menu categories, item descriptions, verified prices (or `null` for `Price TBC`), dietary badges, and dish imagery.
- [`src/data/gallery.ts`](src/data/gallery.ts) — Gallery images, categories, captions, and accessible `alt` descriptions.

## Local Development

### Prerequisites

- Node.js 20+ (tested on Node 24)
- pnpm 10+ (tested on pnpm 11)

### Setup & Run

```bash
# 1. Install dependencies
pnpm install

# 2. (Optional) Configure your public site URL
cp .env.example .env.local

# 3. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Deployment

### Deploying to Vercel (Recommended)

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Set the environment variable:
   - `NEXT_PUBLIC_SITE_URL=https://jianbingliucamden.co.uk` (or your custom domain)
4. Click **Deploy** — Vercel automatically detects `pnpm-lock.yaml` and Next.js.

### Self-Hosting (Node.js)

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```
